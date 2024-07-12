import { LifeTracker } from "./life-tracker.js";

const bdayInput = document.querySelector("input");
const dataText = document.querySelector(".life-math");

const tracker = new LifeTracker();

const canvas = document.querySelector("canvas");
const originalHeight = canvas.height;
const originalWidth = canvas.width;
const ctx = canvas.getContext("2d");

const bubbleRadius = canvas.width * 0.008;
const bubbleSpacing = canvas.width * 0.002;
const bubbleStartX = bubbleRadius * 3;
const bubbleStartY = bubbleRadius * 2;
const labelX = bubbleStartX + (tracker.weeksPerYear + 1) * (bubbleRadius * 2);

const px = 20 - ((1366 - canvas.width) / 1366) * 20;

if (tracker.params.has("bday")) {
  bdayInput.value = tracker.params.get("bday");
}

tracker.setBdayValues(bdayInput.valueAsDate);

bdayInput.addEventListener("change", (evt) => {
  tracker.setBdayValues(evt.target.valueAsDate);
  setDataText();
  tracker.updateParams(bdayInput);
  renderCal();
});

function setDataText() {
  const lifeWeeks =
    tracker.weeksPerYear * tracker.currAge - tracker.bdayWeekNum;
  const totalWeeks = tracker.weeksPerYear * tracker.yearsPerLife;
  const lifePercentage = ((lifeWeeks / totalWeeks) * 100).toPrecision(3);
  dataText.innerHTML = `You've lived ${lifeWeeks.toLocaleString()} weeks (${lifePercentage}%) of the ${totalWeeks.toLocaleString()} possible weeks of an average ${tracker.yearsPerLife}-year human life.`;
}

function fillCircle(midX, midY, radius, strokeWidth, fillColor, strokeColor) {
  ctx.beginPath();
  ctx.arc(midX, midY, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = strokeColor;
  ctx.stroke();
}

function printStageLabels(labelY, stageColor, stageName) {
  ctx.fillStyle = stageColor;
  ctx.font = `${px}px Arial`;
  ctx.textAlign = "left";
  ctx.save();
  ctx.translate(labelX, labelY - bubbleRadius);
  ctx.rotate(Math.PI / 2);
  ctx.fillText(`${stageName}`, 0, 0);
  ctx.restore();
}

function printYearLabels(rowY, year, stageColor) {
  ctx.fillStyle = stageColor;
  ctx.font = `${px}px Arial`;
  ctx.textAlign = "right";
  ctx.fillText(year, bubbleStartX, rowY + bubbleSpacing * 2);
}

function renderCal() {
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

  ctx.fillStyle = "currentColor";
  ctx.font = "2em Arial";

  for (const [idx, stage] of tracker.lifeStages.entries()) {
    // auto-skip stages that are outside of the life span
    if (stage.years[0] >= tracker.yearsPerLife) {
      return;
    }

    const labelY = bubbleStartY + stage.years[0] * (bubbleRadius * 2.5);
    const stageColor = `hsl(${(idx + 1) * Math.ceil((Math.random() * Date.now()) / 100000)}, 40%, 50%)`;

    printStageLabels(labelY, stageColor, stage.name);

    // handle individual years
    for (
      let year = stage.years[0];
      year <= stage.years[1] && year <= tracker.yearsPerLife;
      year++
    ) {
      const rowY = bubbleStartY + year * (bubbleRadius * 2.5);

      for (let week = 1; week <= tracker.weeksPerYear; week++) {
        if (
          (year === 0 && week >= tracker.bdayWeekNum) ||
          (year < tracker.currAge && year > 0) ||
          (year === tracker.currAge && week < tracker.currWeekNum)
        ) {
          // fill in bubbles of weeks lived
          fillCircle(
            bubbleStartX + week * (bubbleRadius * 2),
            rowY,
            bubbleRadius - bubbleSpacing,
            1,
            stageColor,
            stageColor,
          );
        } else {
          // empty bubbles for weeks not lived
          fillCircle(
            bubbleStartX + week * (bubbleRadius * 2),
            rowY,
            bubbleRadius - bubbleSpacing,
            1,
            "transparent",
            stageColor,
          );
        }
      }

      printYearLabels(rowY, year, stageColor);
    }
  }
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

canvas.height = (bubbleRadius * 2 + bubbleSpacing * 3) * tracker.yearsPerLife;
setDataText();
renderCal();
