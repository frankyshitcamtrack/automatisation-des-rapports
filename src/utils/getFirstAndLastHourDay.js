const {
  dateInYyyyMmDdHhMmSs,
  dateFormatMinusOneDay,
  convertDateToTimeStamp,
  dateFormatMinusTwoDay,
  dateFormatMinusSevenDay,
  dateFormatIso,
  dateFormat,
  dateFormatIsoMinusOneDay,
} = require('./dateFormat');

function getFistAndLastHourDayIso() {
  let startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  let firstHourDayFormat = dateFormatIsoMinusOneDay(startOfDay);

  let endofDay = new Date();
  endofDay.setHours(23, 59, 59, 999);
  let lasthourDayFormat = dateFormatIsoMinusOneDay(endofDay);

  let date = new Date();

  let dateTitle = dateFormatMinusOneDay(date).split(' ')[0];

  return { firstHourDayFormat, lasthourDayFormat, dateTitle };
}

function getfirstAndLastHourDay48H() {
  let startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  let firstHourDayFormat48H = dateFormatMinusTwoDay(startOfDay);
  let firstHourDayTimestamp48H = convertDateToTimeStamp(firstHourDayFormat48H);

  let endofDay = new Date();
  endofDay.setHours(23, 59, 59, 999);
  let lasthourDayFormat48H = dateInYyyyMmDdHhMmSs(endofDay);
  let lastHourDayTimestamp48H = convertDateToTimeStamp(lasthourDayFormat48H);

  let date = new Date();

  let dateTitle = dateFormatMinusOneDay(date).split(' ')[0];

  return { firstHourDayTimestamp48H, lastHourDayTimestamp48H, dateTitle };
}

function getFirstAndLastSevendays() {
  let startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  let firstHourDayFormat = dateFormatMinusSevenDay(startOfDay);

  //let firstHourDayFormat="2024-07-29 23:59:59";
  let firstHourDayTimestamp = convertDateToTimeStamp(firstHourDayFormat);

  let endofDay = new Date();
  endofDay.setHours(23, 59, 59, 999);
  let lasthourDayFormat = dateFormatMinusOneDay(endofDay);



  //let lasthourDayFormat ="2024-08-04 00:00:00";
  let lastHourDayTimestamp = convertDateToTimeStamp(lasthourDayFormat);

  let date = new Date();
  const date1 = dateFormatMinusOneDay(date).split(' ')[0];
  const date2 = dateFormatMinusSevenDay(date).split(' ')[0];
  let dateTitle = `${date2}-${date1}`;


  return { firstHourDayTimestamp, lastHourDayTimestamp, firstHourDayFormat, lasthourDayFormat, dateTitle };
}

function getFistAndLastHourDay() {
  let startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  let firstHourDayFormat = dateFormatMinusOneDay(startOfDay);
  let firstHourDayTimestamp = convertDateToTimeStamp(firstHourDayFormat);

  //const firstHourDayTimestamp = '1754607600';
  //const lastHourDayTimestamp = '1754693999';
  //const dateTitle = '2025-08-08'




  let endofDay = new Date();
  endofDay.setHours(23, 59, 59, 999);
  let lasthourDayFormat = dateFormatMinusOneDay(endofDay);
  let lastHourDayTimestamp = convertDateToTimeStamp(lasthourDayFormat);


  let date = new Date();
  let dateTitle1 = dateFormatMinusOneDay(date).split(' ')[0];
  let dateTitle2 = dateFormatMinusOneDay(date).split(' ')[1].split(':');
  const dateTitle = `${dateTitle1}-${dateTitle2[0]}H ${dateTitle2[1]}Min ${dateTitle2[2]}Sec`


  return { firstHourDayTimestamp, lastHourDayTimestamp, firstHourDayFormat, lasthourDayFormat, dateTitle };
}


function getFistAndLastHourDay22H06H() {
  let startOfDay = new Date();

  startOfDay.setHours(21, 0, 0);
  let firstHourDayFormat = dateFormatMinusOneDay(startOfDay);

  let firstHourDayTimestamp06h = convertDateToTimeStamp(firstHourDayFormat);

  let endofDay = new Date();
  endofDay.setHours(7, 0, 0);
  let lasthourDayFormat = dateInYyyyMmDdHhMmSs(endofDay);

  let lastHourDayTimestamp22h = convertDateToTimeStamp(lasthourDayFormat);

  let date = new Date();
  let dateTitle = dateFormatMinusOneDay(date).split(' ')[0];

  return { firstHourDayTimestamp06h, lastHourDayTimestamp22h, dateTitle };
}



function getFistAndLastHourDay18H05H() {
  let startOfDay = new Date();

  startOfDay.setHours(17, 0, 0);
  let firstHourDayFormat = dateFormatMinusOneDay(startOfDay);


  let endofDay = new Date();
  endofDay.setHours(6, 0, 0);
  let lasthourDayFormat = dateInYyyyMmDdHhMmSs(endofDay);



  let date = new Date();
  let dateTitle = dateFormatMinusOneDay(date).split(' ')[0];

  return { firstHourDayFormat, lasthourDayFormat, dateTitle };
}



function getFistAndLastHourActualDay() {
  let startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  let firstHourDayFormat = dateFormat(startOfDay);
  let firstHourDayTimestamp = convertDateToTimeStamp(firstHourDayFormat);

  let endofDay = new Date();
  endofDay.setHours(23, 59, 59, 999);
  let lasthourDayFormat = dateFormat(endofDay);
  let lastHourDayTimestamp = convertDateToTimeStamp(lasthourDayFormat);

  let date = new Date();

  let dateTitle = dateFormat(date).split(' ')[0];

  return { firstHourDayTimestamp, lastHourDayTimestamp, dateTitle };
}




module.exports = {
  getFistAndLastHourDay,
  getFistAndLastHourDay22H06H,
  getfirstAndLastHourDay48H,
  getFirstAndLastSevendays,
  getFistAndLastHourDayIso,
  getFistAndLastHourActualDay,
  getFistAndLastHourDay18H05H
};
