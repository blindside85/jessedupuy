((win, doc) => {
    const url = new URL(win.location.href);
    const canvas = doc.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const bdayInput = document.querySelector('input');
    const dataText = document.querySelector('.life-math');
    const dayMillis = 1000 * 60 * 60 * 24; // = 86400000
    const yearMillis = dayMillis * 365;
    const today = new Date();
    const currWeekNum = getWeekNum(today);
    const weeksPerYear = 52;
    const yearsPerLife = 77; // average life expectancy in the US in 2023 for males

    const bubbleRadius = canvas.width * 0.008;
    const bubbleSpacing = canvas.width * 0.002;
    const bubbleStartX = bubbleRadius * 3;
    const bubbleStartY = bubbleRadius * 2;
    const labelX = bubbleStartX + (weeksPerYear + 1) * (bubbleRadius * 2);

    const stages = [
        {
            name: 'childhood',
            years: [0, 12]
        },
        {
            name: 'adolescence',
            years: [13, 19]
        },
        {
            name: 'early adulthood',
            years: [20, 34]
        },
        {
            name: 'middle adulthood',
            years: [35, 49]
        },
        {
            name: 'mature adulthood',
            years: [50, 79]
        },
        {
            name: 'late adulthood',
            years: [80, 100]
        }
    ];


    let params = new URLSearchParams(url.search);

    if (params.has('bday')) {
        bdayInput.value = params.get('bday');
    }

    let bday = bdayInput.valueAsDate;
    let currAge = Math.floor((today - bday) / yearMillis);
    let bdayWeekNum = getWeekNum(bday);

    bdayInput.addEventListener('change', evt => {
        bday = evt.target.valueAsDate;
        currAge = Math.floor((today - bday) / yearMillis);
        bdayWeekNum = getWeekNum(bday);
        setDataText();
        updateParams();
        renderCal();
    });

    function getWeekNum(day) {
        const firstDayOfYear = new Date(day.getFullYear(), 0, 1);
        const daysSinceFirstDayOfYear = (day - firstDayOfYear) / dayMillis;
        const daysSinceFirstDayOfWeek = daysSinceFirstDayOfYear + firstDayOfYear.getDay() + 1;
        return Math.ceil(daysSinceFirstDayOfWeek / 7);
    };

    function updateParams() {
        params.set('bday', bdayInput.value);
        url.search = params.toString();
        history.replaceState({}, 'durr', url);
    }

    function setDataText() {
        const lifeWeeks = weeksPerYear * currAge - bdayWeekNum;
        const totalWeeks = weeksPerYear * yearsPerLife;
        const lifePercentage = (lifeWeeks/totalWeeks*100).toPrecision(3);
        dataText.innerHTML = `You've lived ${lifeWeeks.toLocaleString()} weeks (${lifePercentage}%) of the ${totalWeeks.toLocaleString()} possible weeks of an average ${yearsPerLife}-year human life.`;
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
        ctx.font = '0.8em Arial';
        ctx.textAlign = 'left';
        ctx.save();
        ctx.translate(labelX, labelY - bubbleRadius);
        ctx.rotate(Math.PI / 2);
        ctx.fillText(`${stageName}`, 0, 0);
        ctx.restore();
    }

    function printYearLabels(rowY, year) {
        ctx.fillStyle = 'black';
        ctx.font = '0.8em Arial';
        ctx.textAlign = 'right';
        ctx.fillText(year, bubbleStartX, rowY + bubbleSpacing * 2);
    }

    function renderCal() {
        // ensure the canvas is cleared before rendering
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'black';
        ctx.font = '2em Arial';

        for (const [idx, stage] of stages.entries()) {
            // auto-skip stages that are outside of the life span
            if (stage.years[0] >= yearsPerLife) {
                return;
            }

            const labelY = bubbleStartY + stage.years[0] * (bubbleRadius * 2.5);
            const stageColor = `hsl(${(idx + 1) * Math.ceil(Math.random() * Date.now() / 100000)}, 40%, 50%)`;

            printStageLabels(labelY, stageColor, stage.name);

            // handle individual years
            for (let year = stage.years[0]; year <= stage.years[1] && year <= yearsPerLife; year++) {
                const rowY = bubbleStartY + year * (bubbleRadius * 2.5);

                for (let week = 1; week <= weeksPerYear; week++) {
                    if (year === 0 && week > bdayWeekNum || year < currAge && year > 0 || year === currAge && week < currWeekNum) {
                        // fill in bubbles of weeks lived
                        fillCircle(bubbleStartX + week * (bubbleRadius * 2), rowY, bubbleRadius - bubbleSpacing, 1, stageColor, stageColor);
                    } else {
                        // empty bubbles for weeks not lived
                        fillCircle(bubbleStartX + week * (bubbleRadius * 2), rowY, bubbleRadius - bubbleSpacing, 1, 'transparent', stageColor);
                    }
                }

                printYearLabels(rowY, year);
            }
        }
    }

    canvas.height = (bubbleRadius * 2 + bubbleSpacing * 3) * yearsPerLife;
    setDataText();
    renderCal();

})(window, document);