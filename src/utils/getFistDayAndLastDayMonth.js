const {
  dateInYyyyMmDdHhMmSs,
  convertDateToTimeStamp,
} = require("./dateFormat");

function getFirstAndLastDayMonth() {
  let date = new Date();

  let firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  let fistDayFormat = dateInYyyyMmDdHhMmSs(firstDay);

  let firstDayTimestamp = convertDateToTimeStamp(fistDayFormat);

  let lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
  let lastDayFormat = dateInYyyyMmDdHhMmSs(lastDay);
  let lastDayTimestamp = convertDateToTimeStamp(lastDayFormat);

  let MonthString = new Date(fistDayFormat).toLocaleString("default", {
    month: "long",
  });
  let title = `${MonthString}-${date.getFullYear()}`;
  let dateTitle = title.toString().toLocaleUpperCase();
  return { firstDayTimestamp, lastDayTimestamp, dateTitle };
}

module.exports = { getFirstAndLastDayMonth };
