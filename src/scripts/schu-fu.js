const synth = window.speechSynthesis;

const form = document.querySelector(".drill");
const call = document.querySelector(".call");
const progress = document.querySelector(".progress");
const status = document.querySelector(".status");

const startButton = document.querySelector("#start");
const pauseButton = document.querySelector("#pause");
const stopButton = document.querySelector("#stop");

const interval = document.querySelector("#interval");
const intervalValue = document.querySelector("#interval-value");
const order = document.querySelector("#order");
const rounds = document.querySelector("#rounds");

const belts = [...document.querySelectorAll(".belt")].map((belt) => ({
  title: belt.dataset.belt,
  toggle: belt.querySelector(".belt-toggle"),
  count: belt.querySelector(".count"),
  boxes: [...belt.querySelectorAll("input[name=technique]")],
}));

const READY = { name: "ready", say: "ready", audio: form.dataset.readyAudio };
// the dojo's yell, "oo" as in "who" + "saaa" as in "saw"
const DONE = { name: "oosaaa!", say: "oosa", audio: form.dataset.doneAudio };

const STORAGE_KEY = "schu-fu";

let saved = loadSettings();

let state = "idle"; // idle | running | paused
// bumped on every start/pause/stop so callbacks from an earlier run bail out
let run = 0;
let queue = [];
let position = 0;
let round = 0;
let timer;
let wakeLock;
let speaking = false;

let audioContext;
// decoded clips by URL, each fetched once
const clips = new Map();
let source;
// held here so Chrome doesn't garbage-collect it before its end event fires
let utterance;

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveSettings() {
  saved = {
    on: belts
      .flatMap((belt) => belt.boxes)
      .filter((box) => box.checked)
      .map((box) => box.value),
    interval: interval.value,
    order: order.value,
    rounds: rounds.value,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // private browsing or storage disabled: settings just won't persist
  }
}

function restoreSettings() {
  const on = new Set(saved.on);
  for (const belt of belts) {
    for (const box of belt.boxes) {
      box.checked = on.has(box.value);
    }
  }
  for (const [input, value] of [
    [interval, saved.interval],
    [order, saved.order],
    [rounds, saved.rounds],
  ]) {
    if (value !== undefined) {
      input.value = value;
    }
    if (input.selectedIndex === -1) {
      input.selectedIndex = 0;
    }
  }
}

function updateOutputs() {
  intervalValue.textContent = `${interval.value}s`;
}

function syncBelt(belt) {
  const on = belt.boxes.filter((box) => box.checked).length;
  belt.toggle.checked = on === belt.boxes.length;
  belt.toggle.indeterminate = on > 0 && on < belt.boxes.length;
  belt.count.textContent = `${on}/${belt.boxes.length}`;
}

// must first run from a tap or click, or iOS keeps the audio silent
function unlockAudio() {
  if (!audioContext) {
    // plays through the iPhone's silent switch, like any media app (iOS 17+)
    if (navigator.audioSession) {
      navigator.audioSession.type = "playback";
    }
    audioContext = new AudioContext();
  }
  if (audioContext.state !== "running") {
    audioContext.resume();
  }
}

function loadClip(url) {
  if (!clips.has(url)) {
    const clip = fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status} for ${url}`);
        }
        return response.arrayBuffer();
      })
      .then((data) => audioContext.decodeAudioData(data));
    // a failed fetch can be retried next time round
    clip.catch(() => clips.delete(url));
    clips.set(url, clip);
  }
  return clips.get(url);
}

function playClip(url) {
  const thisRun = run;
  return loadClip(url).then(
    (buffer) =>
      new Promise((resolve) => {
        // paused or stopped while the clip was still downloading
        if (thisRun !== run) {
          resolve();
          return;
        }
        source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.onended = resolve;
        source.start();
      }),
  );
}

function speakWithBrowser(text) {
  return new Promise((resolve) => {
    if (!synth) {
      resolve();
      return;
    }
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.onend = resolve;
    utterance.onerror = resolve;
    // some browsers drop the end event when the tab is backgrounded mid-call
    setTimeout(resolve, 10000);
    synth.speak(utterance);
  });
}

// plays the technique's recorded clip, or has the browser read it out if there isn't one
async function speak(technique) {
  speaking = true;
  try {
    if (technique.audio) {
      await playClip(technique.audio).catch(() => speakWithBrowser(technique.say));
    } else {
      await speakWithBrowser(technique.say);
    }
  } finally {
    speaking = false;
  }
}

function silence() {
  source?.stop();
  synth?.cancel();
}

function selectedTechniques() {
  const perBelt = belts.map((belt) =>
    belt.boxes
      .filter((box) => box.checked)
      .map((box) => ({
        name: box.value,
        say: box.dataset.say || box.value,
        audio: box.dataset.audio,
        belt: belt.title,
      })),
  );
  // reversing swaps the belts around, not the techniques within each one
  if (order.value === "reversed") {
    perBelt.reverse();
  }
  return perBelt.flat();
}

function shuffle(items, notFirst) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  // don't open a round with the technique that closed the last one
  if (items.length > 1 && items[0].name === notFirst) {
    [items[0], items[1]] = [items[1], items[0]];
  }
}

// the selection is re-read every round, so changes made mid-drill apply to the next one
function nextRound() {
  const last = queue[queue.length - 1]?.name;
  queue = selectedTechniques();
  if (order.value === "shuffled") {
    shuffle(queue, last);
  }
  position = 0;
  round += 1;
}

// calls a technique, then leaves the interval of quiet before the next one
function say(technique) {
  const thisRun = run;
  speak(technique).then(() => {
    if (thisRun !== run) {
      return;
    }
    timer = setTimeout(callNext, Number(interval.value) * 1000);
  });
  // fetch the next clip while this one plays
  const next = queue[position];
  if (next?.audio) {
    loadClip(next.audio).catch(() => {});
  }
}

function callNext() {
  const totalRounds = Number(rounds.value); // 0 means until stopped
  if (position >= queue.length) {
    if (totalRounds && round >= totalRounds) {
      finish();
      return;
    }
    nextRound();
    if (queue.length === 0) {
      finish();
      return;
    }
  }

  const technique = queue[position];
  position += 1;
  call.textContent = technique.name;
  progress.textContent =
    `${technique.belt} · ${position} of ${queue.length}` +
    (totalRounds === 1
      ? ""
      : ` · round ${round}${totalRounds ? ` of ${totalRounds}` : ""}`);
  say(technique);
}

function setState(next) {
  state = next;
  run += 1;
  clearTimeout(timer);
  startButton.disabled = state !== "idle";
  pauseButton.disabled = state === "idle";
  stopButton.disabled = state === "idle";
  pauseButton.textContent = state === "paused" ? "Resume" : "Pause";
  if (state === "running") {
    holdWakeLock();
  } else {
    wakeLock?.release();
    wakeLock = null;
  }
}

function start() {
  if (selectedTechniques().length === 0) {
    status.textContent = "Pick at least one belt first.";
    return;
  }
  unlockAudio();
  setState("running");
  queue = [];
  position = 0;
  round = 0;
  call.textContent = READY.name;
  progress.textContent = "";
  status.textContent = "";
  say(READY);
}

function pause() {
  // a call cut off mid-word gets repeated on resume
  if (speaking && position > 0) {
    position -= 1;
  }
  setState("paused");
  silence();
  status.textContent = "Paused";
}

function resume() {
  unlockAudio();
  setState("running");
  status.textContent = "";
  callNext();
}

function stop() {
  setState("idle");
  silence();
  call.textContent = "";
  progress.textContent = "";
  status.textContent = "Stopped";
}

function finish() {
  setState("idle");
  call.textContent = DONE.name;
  speak(DONE);
}

// keeps the screen from sleeping mid-drill, where the browser allows it
async function holdWakeLock() {
  try {
    const lock = await navigator.wakeLock?.request("screen");
    if (state === "running") {
      wakeLock = lock;
    } else {
      lock?.release();
    }
  } catch {
    // denied or unsupported: the drill still runs, the screen may just sleep
  }
}

restoreSettings();
updateOutputs();

for (const belt of belts) {
  belt.toggle.onchange = function () {
    for (const box of belt.boxes) {
      box.checked = belt.toggle.checked;
    }
    syncBelt(belt);
  };
  for (const box of belt.boxes) {
    box.addEventListener("change", () => syncBelt(belt));
  }
  syncBelt(belt);
}

form.oninput = updateOutputs;
form.onchange = saveSettings;

form.onsubmit = function (event) {
  event.preventDefault();
  start();
};

pauseButton.onclick = function () {
  if (state === "paused") {
    resume();
  } else {
    pause();
  }
};

stopButton.onclick = stop;

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && state === "running") {
    // the wake lock is dropped whenever the tab is hidden
    holdWakeLock();
    // and iOS can suspend the audio after a call or Siri interrupts it
    if (audioContext?.state !== "running") {
      audioContext?.resume();
    }
  }
});
