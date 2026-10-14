# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = ["mlx-audio==0.5.9"]
# ///
"""Generates the spoken clips for the Schu-Fu drill caller (/experiments/schu-fu).

    npm run voices                         # clips for any new or changed techniques
    npm run voices -- "horse schu" ready   # redo just these, e.g. after editing a `say`

Runs locally on Apple silicon; needs uv and ffmpeg. Models download on first run.

Every clip is transcribed back with a speech-to-text model, and regenerated if
the voice garbled it. Clips are keyed on the voice settings, the reference
recording and the spoken text, so changing VOICE below, the recording, or a
technique's `say` regenerates what it affects, and clips for techniques
removed from the list are deleted.

Each retry is a different take (seed 0, 1, 2...). To keep a take you liked by
ear, give the technique (or cue) a `seed`: that take is used as is, unchecked.
"""

import difflib
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

# the models' per-clip progress bars drown out the per-clip summary
os.environ["TQDM_DISABLE"] = "1"

import mlx.core as mx
import numpy as np
from mlx_audio.audio_io import write as audio_write
from mlx_audio.stt.utils import load_model as load_stt
from mlx_audio.tts.utils import load_model as load_tts

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "src/data/schu-fu.json"
MANIFEST = ROOT / "src/data/schu-fu-audio.json"
OUT = ROOT / "public/audio/schu-fu"
URL = "/audio/schu-fu"

# Every clip is cloned from one recording of the voice saying `reference_text`,
# so all the calls sound like the same man. Swap the recording to change the
# voice. It was made with Qwen3-TTS-12Hz-1.7B-VoiceDesign from the description
# "a very deep, low-pitched bass voice of a grizzled older man, rough and
# gravelly, calling out commands in a low, controlled growl: firm, clipped,
# urgent and intense, never shouting".
VOICE = {
    "model": "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-8bit",
    "options": {"lang_code": "english"},
    "reference": "scripts/schu-fu-voice.flac",
    "reference_text": "Listen up. Spreading the dark bear. Five o'clock sucker. "
    "Horseshoe. Louisville slugger. Again. Faster. Move.",
}
CHECKER = "mlx-community/parakeet-tdt-0.6b-v3"
# called when a drill starts and finishes, and how the voice should say them;
# "oosaaa" is the dojo's yell, "oo" as in "who" + "saaa" as in "saw"
CUES = {"ready": {"say": "ready"}, "done": {"say": "Oosaaa!", "seed": 1}}
ATTEMPTS = 5
# how closely the transcript must match what was meant to be said (0-1)
MATCH = 0.85

DIGITS = "zero one two three four five six seven eight nine".split()


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def key(line):
    reference = hashlib.sha256((ROOT / VOICE["reference"]).read_bytes()).hexdigest()
    settings = json.dumps({**VOICE, "recording": reference, **line}, sort_keys=True)
    return hashlib.sha256(settings.encode()).hexdigest()[:12]


def normalize(text):
    text = re.sub(r"\d", lambda m: DIGITS[int(m.group())], text.lower())
    return re.sub(r"[^a-z]", "", text)


def similarity(said, meant):
    return difflib.SequenceMatcher(None, normalize(said), normalize(meant)).ratio()


def wanted():
    """Each technique (and cue) by name: the text to speak, and any pinned take."""
    lines = {name: {"say": cue["say"], "seed": cue.get("seed")} for name, cue in CUES.items()}
    for belt in json.loads(DATA.read_text()):
        for item in belt["items"]:
            lines[item["name"]] = {"say": item.get("say", item["name"]), "seed": item.get("seed")}
    return lines


def encode(wav, mp3):
    """Trims the silence off both ends, evens out loudness, and compresses."""
    trim = "silenceremove=start_periods=1:start_threshold=-45dB"
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav),
         "-af", f"{trim},areverse,{trim},areverse,loudnorm=I=-16:TP=-1.5",
         "-ar", "44100", "-ac", "1", "-b:a", "64k", str(mp3)],
        check=True,
    )


def save(manifest):
    MANIFEST.write_text(json.dumps(dict(sorted(manifest.items())), indent=2) + "\n")


def main(redo):
    lines = wanted()
    unknown = [name for name in redo if name not in lines]
    if unknown:
        sys.exit(f"not in the technique list: {', '.join(unknown)}")

    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    if redo:
        todo = {name: lines[name] for name in redo}
    else:
        todo = {
            name: line
            for name, line in lines.items()
            if manifest.get(name, {}).get("key") != key(line)
            or not (OUT / f"{slug(name)}.mp3").exists()
        }

    # techniques dropped from the list take their clips with them
    for name in set(manifest) - set(lines):
        (OUT / f"{slug(name)}.mp3").unlink(missing_ok=True)
        del manifest[name]

    if todo:
        print(f"generating {len(todo)} clip(s) with {VOICE['model']}")
        tts, checker = load_tts(model_path=VOICE["model"]), load_stt(CHECKER)
        OUT.mkdir(parents=True, exist_ok=True)
        doubtful = []

        with tempfile.TemporaryDirectory() as tmp:
            for n, (name, line) in enumerate(todo.items(), 1):
                text, pinned = line["say"], line["seed"] is not None
                best = None
                for seed in [line["seed"]] if pinned else range(ATTEMPTS):
                    mx.random.seed(seed)
                    results = list(
                        tts.generate(
                            text=text,
                            ref_audio=str(ROOT / VOICE["reference"]),
                            ref_text=VOICE["reference_text"],
                            **VOICE["options"],
                        )
                    )
                    audio = np.concatenate([np.array(r.audio) for r in results])
                    wav = Path(tmp) / f"{seed}.wav"
                    audio_write(wav, audio, results[0].sample_rate, format="wav")
                    said = checker.generate(str(wav)).text.strip()
                    score = similarity(said, text)
                    if best is None or score > best[0]:
                        best = (score, said, wav)
                    if score >= MATCH:
                        break

                score, said, wav = best
                encode(wav, OUT / f"{slug(name)}.mp3")
                manifest[name] = {"file": f"{URL}/{slug(name)}.mp3", "key": key(line)}
                # saved as it goes, so an interrupted run picks up where it stopped
                save(manifest)
                if pinned:
                    flag = f"  (pinned seed {line['seed']}, kept as is)"
                else:
                    flag = "" if score >= MATCH else "  <- check by ear"
                print(f"[{n}/{len(todo)}] {name!r}: heard {said!r}{flag}", flush=True)
                if score < MATCH and not pinned:
                    doubtful.append((name, said))

        if doubtful:
            print("\nThese never transcribed cleanly. Listen to them, and if they're off,")
            print("add a phonetic `say` to the technique in src/data/schu-fu.json:")
            for name, said in doubtful:
                print(f"  {name!r} (heard {said!r})")
    else:
        print("all clips are up to date")

    save(manifest)


if __name__ == "__main__":
    main(sys.argv[1:])
