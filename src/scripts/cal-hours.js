import { LifeTracker } from "./life-tracker.js";

// DOM values
const bdayInput = document.querySelector("input");
const dataText = document.querySelector(".life-math");

const tracker = new LifeTracker();

const canvas = document.querySelector("canvas");
const originalHeight = canvas.height;
const originalWidth = canvas.width;
const ctx = canvas.getContext("2d");
const px = 20 - ((1366 - canvas.width) / 1366) * 20;

if (tracker.params.has("bday")) {
  bdayInput.value = tracker.params.get("bday");
}

tracker.setBdayValues(bdayInput.valueAsDate);

bdayInput.addEventListener("change", (evt) => {
  tracker.setBdayValues(evt.target.valueAsDate);
  setDataText();
  tracker.updateParams(bdayInput);
  renderGraph();
});

function setDataText() {
  const lifeWeeks =
    tracker.weeksPerYear * tracker.currAge - tracker.bdayWeekNum;
  const totalWeeks = tracker.weeksPerYear * tracker.yearsPerLife;
  const lifePercentage = ((lifeWeeks / totalWeeks) * 100).toPrecision(3);
  dataText.innerHTML = `
    <p>Out of the ${tracker.hoursPerYear} total hours in a year, you have about ${tracker.annualFree()} waking hours to use freely.</p>
    <p>Which means you get roughly ${tracker.lifetimeFree()} hours in your entire life to use as you wish.</p>
    <p>Choose wisely!</p>`;
}

function renderGraph() {
  let dimensions = getObjectFitSize(
    true,
    canvas.clientWidth,
    canvas.clientHeight,
    canvas.width,
    canvas.height,
  );
  const dpr = window.devicePixelRatio || 1;
  canvas.width = dimensions.width * dpr;
  canvas.height = dimensions.height * dpr;

  let ratio = Math.min(
    canvas.clientWidth / originalWidth,
    canvas.clientHeight / originalHeight,
  );
  ctx.scale(ratio * dpr, ratio * dpr);

  // ensure the canvas is cleared before rendering
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Base offset distance of 10
  const offset = 8;
  let beginAngle = 0;
  let endAngle = 0;

  // Used to calculate the X and Y offset
  let offsetX, offsetY, medianAngle;

  const canvasMidX = canvas.width / 5.8;
  const canvasMidY = canvas.height / 5.8;

  ctx.fillStyle = "currentColor";
  ctx.font = "0.5em Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("daily time spend", canvasMidX, canvasMidY / 4);

  Object.keys(tracker.humanAverages).forEach((el, idx) => {
    const activity = tracker.humanAverages[el];
    const activityPercent = activity / tracker.hoursPerDay;
    const activityColor = `hsl(${(idx + 1) * Math.ceil((Math.random() * Date.now()) / 100000)}, 40%, 50%)`;
    beginAngle = endAngle;
    endAngle = endAngle + Math.PI * 2 * activityPercent;
    // The medium angle is the average of two consecutive angles
    medianAngle = (endAngle + beginAngle) / 2;

    // X and Y calculations
    offsetX = Math.cos(medianAngle) * offset;
    offsetY = Math.sin(medianAngle) * offset;

    ctx.beginPath();
    ctx.fillStyle = activityColor;

    // Adding the offsetX and offsetY to the center of the arc
    ctx.moveTo(canvasMidX + offsetX, canvasMidY + offsetY);
    ctx.arc(
      canvasMidX + offsetX,
      canvasMidY + offsetY,
      canvasMidX * 0.5,
      beginAngle,
      endAngle,
    );
    ctx.lineTo(canvasMidX + offsetX, canvasMidY + offsetY);
    ctx.stroke();
    ctx.fill();

    ctx.fillStyle = "currentColor";
    ctx.font = "0.5em Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `${el}: ${activity}hrs`,
      canvasMidX + (Math.cos(medianAngle) * canvasMidX) / 3,
      canvasMidY + (Math.sin(medianAngle) * canvasMidX) / 3,
    );
  });
}

// adapted from: https://www.npmjs.com/package/intrinsic-scale
function getObjectFitSize(
  contains /* true = contain, false = cover */,
  containerWidth,
  containerHeight,
  width,
  height,
) {
  var doRatio = width / height;
  var cRatio = containerWidth / containerHeight;
  var targetWidth = 0;
  var targetHeight = 0;
  var test = contains ? doRatio > cRatio : doRatio < cRatio;

  if (test) {
    targetWidth = containerWidth;
    targetHeight = targetWidth / doRatio;
  } else {
    targetHeight = containerHeight;
    targetWidth = targetHeight * doRatio;
  }

  return {
    width: targetWidth,
    height: targetHeight,
    x: (containerWidth - targetWidth) / 2,
    y: (containerHeight - targetHeight) / 2,
  };
}

setDataText();
renderGraph();
