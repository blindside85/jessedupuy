const synth = window.speechSynthesis;

const app = document.querySelector(".app");
const setupView = document.querySelector("#setup");
const drillView = document.querySelector("#drill");
const summaryView = document.querySelector("#summary");

const myBelt = document.querySelector("#my-belt");
const nextBeltButton = document.querySelector("#next-belt");
const reviewButton = document.querySelector("#review");
const clearButton = document.querySelector("#clear");
const customPace = document.querySelector(".custom-pace");
const interval = document.querySelector("#interval");
const intervalValue = document.querySelector("#interval-value");
const startButton = document.querySelector("#start");
const startCount = document.querySelector(".go-count");

const drillBelt = drillView.querySelector(".drill-belt");
const call = drillView.querySelector(".drill-call");
const progress = drillView.querySelector(".drill-progress");
const status = drillView.querySelector(".drill-status");
const countdown = drillView.querySelector(".countdown-fill");
const pauseButton = document.querySelector("#pause");
const stopButton = document.querySelector("#stop");

const summaryStats = summaryView.querySelector(".summary-stats");
const againButton = document.querySelector("#again");
const backButton = document.querySelector("#back");

const belts = [...document.querySelectorAll(".tile")].map((tile) => {
  const dialog = document.querySelector(`#belt-${tile.dataset.index}`);
  return {
    title: tile.dataset.belt,
    style: tile.getAttribute("style"),
    tile,
    toggle: tile.querySelector(".tile-toggle"),
    edit: tile.querySelector(".tile-edit"),
    count: tile.querySelector(".tile-count"),
    stripes: tile.querySelector(".stripes"),
    dialog,
    boxes: [...dialog.querySelectorAll("input[name=technique]")],
  };
});
const allBoxes = belts.flatMap((belt) => belt.boxes);

// seconds of quiet after each call
const PACES = { blitz: 1, steady: 3, slow: 6 };

const READY = { name: "ready", say: "ready", audio: app.dataset.readyAudio };
// the dojo's yell, "oo" as in "who" + "saaa" as in "saw"
const DONE = { name: "oosaaa!", say: "oosa", audio: app.dataset.doneAudio };

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
let startedAt = 0;
let called = 0;

let audioContext;
// decoded clips by URL, each fetched once
const clips = new Map();
let source;
// held here so Chrome doesn't garbage-collect it before its end event fires
let utterance;

function choice(name) {
  return document.querySelector(`input[name=${name}]:checked`).value;
}

function choose(name, value) {
  const input =
    document.querySelector(`input[name=${name}][value="${value}"]`) ??
    document.querySelector(`input[name=${name}]`);
  input.checked = true;
}

function intervalSeconds() {
  const pace = choice("pace");
  return pace === "custom" ? Number(interval.value) : PACES[pace];
}

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveSettings() {
  saved = {
    on: allBoxes.filter((box) => box.checked).map((box) => box.value),
    myBelt: myBelt.value,
    pace: choice("pace"),
    interval: interval.value,
    order: choice("order"),
    rounds: choice("rounds"),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // private browsing or storage disabled: settings just won't persist
  }
}

function restoreSettings() {
  const on = new Set(saved.on);
  for (const box of allBoxes) {
    box.checked = on.has(box.value);
  }
  myBelt.value = saved.myBelt ?? "";
  if (myBelt.selectedIndex === -1) {
    myBelt.value = "";
  }
  if (saved.interval) {
    interval.value = saved.interval;
  }
  choose("pace", saved.pace ?? "steady");
  choose("order", saved.order ?? "listed");
  choose("rounds", saved.rounds ?? "1");
}

// ---- setup screen ----

function syncBelt(belt) {
  const on = belt.boxes.filter((box) => box.checked).length;
  const total = belt.boxes.length;
  const beltState = on === 0 ? "none" : on === total ? "all" : "some";
  belt.tile.dataset.state = beltState;
  belt.toggle.setAttribute(
    "aria-pressed",
    { none: "false", some: "mixed", all: "true" }[beltState],
  );
  belt.count.textContent = `${on}/${total}`;
}

function syncSetup() {
  belts.forEach(syncBelt);
  const count = allBoxes.filter((box) => box.checked).length;
  startButton.disabled = count === 0;
  startCount.textContent =
    count === 0
      ? "Pick a belt to start"
      : `${count} technique${count === 1 ? "" : "s"}`;
  customPace.hidden = choice("pace") !== "custom";
  intervalValue.textContent = `${interval.value}s`;
  syncQuickPicks();
}

// "practice next belt" and "review" shortcuts, from the belt you've said you hold
function syncQuickPicks() {
  const mine = myBelt.value === "" ? null : Number(myBelt.value);
  const next = mine === null ? undefined : belts[mine + 1];
  nextBeltButton.hidden = !next;
  if (next) {
    nextBeltButton.textContent = `Next belt: ${next.title}`;
  }
  reviewButton.hidden = mine === null || mine < 0;
  if (mine !== null && mine >= 0) {
    reviewButton.textContent =
      mine === 0
        ? `Review ${belts[0].title}`
        : `Review ${belts[0].title} → ${belts[mine].title}`;
  }
}

function selectBelts(pick) {
  belts.forEach((belt, i) => {
    for (const box of belt.boxes) {
      box.checked = pick(i);
    }
  });
  syncSetup();
  saveSettings();
}

// ---- audio ----

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
      await playClip(technique.audio).catch(() =>
        speakWithBrowser(technique.say),
      );
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

// ---- drill ----

function selectedTechniques() {
  const perBelt = belts.map((belt) =>
    belt.boxes
      .filter((box) => box.checked)
      .map((box) => ({
        name: box.value,
        say: box.dataset.say || box.value,
        audio: box.dataset.audio,
        belt,
      })),
  );
  // reversing swaps the belts around, not the techniques within each one
  if (choice("order") === "reversed") {
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
  if (choice("order") === "shuffled") {
    shuffle(queue, last);
  }
  position = 0;
  round += 1;
}

// the bar drains over the quiet between calls, so you can see the next one coming
function runCountdown(ms) {
  countdown.style.transition = "none";
  countdown.style.transform = "scaleX(1)";
  countdown.getBoundingClientRect();
  countdown.style.transition = `transform ${ms}ms linear`;
  countdown.style.transform = "scaleX(0)";
}

function freezeCountdown() {
  const current = getComputedStyle(countdown).transform;
  countdown.style.transition = "none";
  countdown.style.transform = current;
}

function fillCountdown() {
  countdown.style.transition = "none";
  countdown.style.transform = "scaleX(1)";
}

// calls a technique, then leaves the interval of quiet before the next one
function say(technique) {
  const thisRun = run;
  fillCountdown();
  speak(technique).then(() => {
    if (thisRun !== run) {
      return;
    }
    const ms = intervalSeconds() * 1000;
    runCountdown(ms);
    timer = setTimeout(callNext, ms);
  });
  // fetch the next clip while this one plays
  const next = queue[position];
  if (next?.audio) {
    loadClip(next.audio).catch(() => {});
  }
}

// the drill screen takes on the colour of the belt being called
function paint(belt) {
  if (belt) {
    drillView.setAttribute("style", belt.style);
  } else {
    drillView.removeAttribute("style");
  }
}

function callNext() {
  const totalRounds = Number(choice("rounds")); // 0 means until stopped
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
  called += 1;
  paint(technique.belt);
  drillBelt.textContent = `${technique.belt.title} belt`;
  if (technique.belt.stripes) {
    drillBelt.append(technique.belt.stripes.cloneNode(true));
  }
  call.textContent = technique.name;
  progress.textContent =
    `${position} / ${queue.length}` +
    (totalRounds === 1
      ? ""
      : ` · round ${round}${totalRounds ? ` of ${totalRounds}` : ""}`);
  say(technique);
}

function show(view) {
  for (const each of [setupView, drillView, summaryView]) {
    each.hidden = each !== view;
  }
}

function setState(next) {
  state = next;
  run += 1;
  clearTimeout(timer);
  pauseButton.textContent = state === "paused" ? "Resume" : "Pause";
  drillView.toggleAttribute("data-paused", state === "paused");
  if (state === "running") {
    holdWakeLock();
  } else {
    wakeLock?.release();
    wakeLock = null;
  }
}

function start() {
  if (selectedTechniques().length === 0) {
    return;
  }
  unlockAudio();
  setState("running");
  show(drillView);
  queue = [];
  position = 0;
  round = 0;
  called = 0;
  startedAt = performance.now();
  paint(null);
  drillBelt.textContent = "";
  call.textContent = READY.name;
  progress.textContent = "";
  status.textContent = "";
  say(READY);
}

function pause() {
  // a call cut off mid-word gets repeated on resume
  if (speaking && position > 0) {
    position -= 1;
    called -= 1;
  }
  setState("paused");
  silence();
  freezeCountdown();
  status.textContent = "Paused · tap to resume";
}

function resume() {
  unlockAudio();
  setState("running");
  status.textContent = "";
  callNext();
}

function togglePause() {
  if (state === "paused") {
    resume();
  } else if (state === "running") {
    pause();
  }
}

function stop() {
  setState("idle");
  silence();
  show(setupView);
}

function finish() {
  setState("idle");
  const seconds = Math.round((performance.now() - startedAt) / 1000);
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  summaryStats.textContent =
    `${called} technique${called === 1 ? "" : "s"} · ` +
    `${round} round${round === 1 ? "" : "s"} · ${time}`;
  show(summaryView);
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

// ---- wiring ----

restoreSettings();
syncSetup();

for (const belt of belts) {
  belt.toggle.onclick = function () {
    const all = belt.boxes.every((box) => box.checked);
    for (const box of belt.boxes) {
      box.checked = !all;
    }
    syncSetup();
    saveSettings();
  };
  belt.edit.onclick = () => belt.dialog.showModal();
  for (const button of belt.dialog.querySelectorAll("[data-set]")) {
    button.onclick = function () {
      for (const box of belt.boxes) {
        box.checked = button.dataset.set === "all";
      }
      syncSetup();
      saveSettings();
    };
  }
  // tapping the dimmed backdrop closes the picker too
  belt.dialog.addEventListener("click", (event) => {
    if (event.target === belt.dialog) {
      belt.dialog.close();
    }
  });
}

nextBeltButton.onclick = () => {
  const next = Number(myBelt.value) + 1;
  selectBelts((i) => i === next);
};
reviewButton.onclick = () => {
  const mine = Number(myBelt.value);
  selectBelts((i) => i <= mine);
};
clearButton.onclick = () => selectBelts(() => false);

setupView.addEventListener("input", () => {
  intervalValue.textContent = `${interval.value}s`;
});
setupView.addEventListener("change", () => {
  syncSetup();
  saveSettings();
});

startButton.onclick = start;
againButton.onclick = start;
backButton.onclick = () => show(setupView);
pauseButton.onclick = togglePause;
stopButton.onclick = stop;

// tap anywhere on the drill screen to pause or resume
drillView.addEventListener("click", (event) => {
  if (!event.target.closest("button")) {
    togglePause();
  }
});

document.addEventListener("keydown", (event) => {
  if (drillView.hidden) {
    return;
  }
  if (event.key === " ") {
    event.preventDefault();
    togglePause();
  } else if (event.key === "Escape") {
    stop();
  }
});

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
