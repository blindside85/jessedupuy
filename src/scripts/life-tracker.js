export class LifeTracker {
  constructor() {
    const self = this;
    this.url = new URL(window.location.href);
    this.today = new Date();
    this.params = new URLSearchParams(this.url.search);

    // date / time values
    this.yearsPerLife = 77;
    this.weeksPerYear = 52;
    this.monthsPerYear = 12;
    this.daysPerYear = 365.25;
    this.daysPerMonth = 30.44;
    this.daysPerWeek = 7;
    this.hoursPerDay = 24;
    this.hoursPerWeek = this.hoursPerDay * this.daysPerWeek;
    this.hoursPerYear = this.hoursPerWeek * this.weeksPerYear;
    this.millsPerDay = 1000 * 60 * 60 * this.hoursPerDay; // = 86400000
    this.millsPerYear = this.millsPerDay * this.daysPerYear;
    this.bday;
    this.bdayWeekNum = 0;
    this.currAge = 99;
    this.currWeekNum = this.getWeekNum(this.today);

    // human avg values
    this.humanAverages = {
      sleeping: 8,
      working: 5.7,
      eating: 1,
    };
    this.annualFree = () =>
      Math.floor(
        this.hoursPerYear -
          (this.humanAverages.sleeping +
            this.humanAverages.working +
            this.humanAverages.eating) *
            this.daysPerYear,
      );
    this.lifetimeFree = () => this.annualFree() * this.yearsPerLife;
    this.humanAverages.free =
      this.hoursPerDay -
      (this.humanAverages.sleeping +
        this.humanAverages.working +
        this.humanAverages.eating);

    this.lifeStages = [
      {
        name: "childhood",
        years: [0, 12],
      },
      {
        name: "adolescence",
        years: [13, 19],
      },
      {
        name: "early adulthood",
        years: [20, 34],
      },
      {
        name: "middle adulthood",
        years: [35, 49],
      },
      {
        name: "mature adulthood",
        years: [50, 79],
      },
      {
        name: "late adulthood",
        years: [80, 100],
      },
    ];
  }

  updateParams(input) {
    this.params.set("bday", input.value);
    this.url.search = this.params.toString();
    history.replaceState({}, "bdayVal", this.url);
  }

  getWeekNum(day) {
    const firstDayOfYear = new Date(day.getFullYear(), 0, 1);
    const daysSinceFirstDayOfYear = (day - firstDayOfYear) / this.millsPerDay;
    const daysSinceFirstDayOfWeek =
      daysSinceFirstDayOfYear + firstDayOfYear.getDay() + 1;
    return Math.ceil(daysSinceFirstDayOfWeek / this.daysPerWeek);
  }

  setBdayValues(bdayDate) {
    // edge case: avoid breaking on impossible dates like 02/30
    if (bdayDate === null) return;
    // edge case: avoid bday being set to 12/31/1999 when the input is set to 1/1/2000
    this.bday = new Date(
      bdayDate.getUTCFullYear(),
      bdayDate.getUTCMonth(),
      bdayDate.getUTCDate(),
    );
    this.currAge = Math.floor((this.today - this.bday) / this.millsPerYear);
    this.bdayWeekNum = this.getWeekNum(this.bday);
  }
}
