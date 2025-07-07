function padTwoDigits(num) {
  return num.toString().padStart(2, '0');
}

//format date with -
function dateInYyyyMmDdHhMmSs(date) {
  return (
    [
      date.getFullYear(),
      padTwoDigits(date.getMonth() + 1),
      padTwoDigits(date.getDate()),
    ].join('-') +
    ' ' +
    [
      padTwoDigits(date.getHours()),
      padTwoDigits(date.getMinutes()),
      padTwoDigits(date.getSeconds()),
    ].join(':')
  );
}

//format date with /
function dateInYyyyMmDdHhMmSsWithSlash(date) {
  return (
    [
      date.getFullYear(),
      padTwoDigits(date.getMonth() + 1),
      padTwoDigits(date.getDate()),
    ].join('/') +
    ' ' +
    [
      padTwoDigits(date.getHours()),
      padTwoDigits(date.getMinutes()),
      padTwoDigits(date.getSeconds()),
    ].join(':')
  );
}

function dateFormat(date) {
  return (
    [
      date.getFullYear(),
      padTwoDigits(date.getMonth() + 1),
      padTwoDigits(date.getDate()),
    ].join('-') +
    ' ' +
    [
      padTwoDigits(date.getHours()),
      padTwoDigits(date.getMinutes()),
      padTwoDigits(date.getSeconds()),
    ].join(':')
  );
}

function dateFormatMinusOneDay(date) {
  const today = date.getDate();
  if (today === 1) {
    date.setDate(0);
    return (
      [
        date.getFullYear(),
        padTwoDigits(date.getMonth() + 1),
        padTwoDigits(date.getDate()),
      ].join('-') +
      ' ' +
      [
        padTwoDigits(date.getHours()),
        padTwoDigits(date.getMinutes()),
        padTwoDigits(date.getSeconds()),
      ].join(':')
    );
  } else {
    return (
      [
        date.getFullYear(),
        padTwoDigits(date.getMonth() + 1),
        padTwoDigits(date.getDate() - 1),
      ].join('-') +
      ' ' +
      [
        padTwoDigits(date.getHours()),
        padTwoDigits(date.getMinutes()),
        padTwoDigits(date.getSeconds()),
      ].join(':')
    );
  }
}

function dateFormatMinusTwoDay(date) {
  const today = date.getDate();

  if (today === 1) {
    date.setDate(0);
    return (
      [
        date.getFullYear(),
        padTwoDigits(date.getMonth() + 1),
        padTwoDigits(date.getDate() - 2),
      ].join('-') +
      ' ' +
      [
        padTwoDigits(date.getHours()),
        padTwoDigits(date.getMinutes()),
        padTwoDigits(date.getSeconds()),
      ].join(':')
    );
  } else {
    return (
      [
        date.getFullYear(),
        padTwoDigits(date.getMonth() + 1),
        padTwoDigits(date.getDate() - 2),
      ].join('-') +
      ' ' +
      [
        padTwoDigits(date.getHours()),
        padTwoDigits(date.getMinutes()),
        padTwoDigits(date.getSeconds()),
      ].join(':')
    );
  }
}

function dateFormatMinusSevenDay(date) {
  const today = date.getDate();
  const d = today - 7;

  if (today === 1) {
    date.setDate(0);
    return (
      [
        date.getFullYear(),
        padTwoDigits(date.getMonth() + 1),
        padTwoDigits(date.getDate() - 7),
      ].join('-') +
      ' ' +
      [
        padTwoDigits(date.getHours()),
        padTwoDigits(date.getMinutes()),
        padTwoDigits(date.getSeconds()),
      ].join(':')
    );
  } else if (today !== 1 && d <= 0) {
    date.setDate(0);
    return (
      [
        date.getFullYear(),
        padTwoDigits(date.getMonth() + 1),
        padTwoDigits(date.getDate() + d),
      ].join('-') +
      ' ' +
      [
        padTwoDigits(date.getHours()),
        padTwoDigits(date.getMinutes()),
        padTwoDigits(date.getSeconds()),
      ].join(':')
    );
  } else {
    return (
      [
        date.getFullYear(),
        padTwoDigits(date.getMonth() + 1),
        padTwoDigits(date.getDate() - 7),
      ].join('-') +
      ' ' +
      [
        padTwoDigits(date.getHours()),
        padTwoDigits(date.getMinutes()),
        padTwoDigits(date.getSeconds()),
      ].join(':')
    );
  }
}

function dateFormatPlusOneHour(val) {
  const date = new Date(val);
  return (
    [
      date.getFullYear(),
      padTwoDigits(date.getMonth() + 1),
      padTwoDigits(date.getDate()),
    ].join('-') +
    ' ' +
    [
      padTwoDigits(date.getHours() + 1),
      padTwoDigits(date.getMinutes()),
      padTwoDigits(date.getSeconds()),
    ].join(':')
  );
}

function convertDateToTimeStamp(date) {
  const convert = new Date(date).getTime() / 1000;

  return convert;
}

function dateFormatIso(date) {
  return (
    [
      date.getFullYear(),
      padTwoDigits(date.getMonth() + 1),
      padTwoDigits(date.getDate()),
    ].join('') +
    [
      'T',
      padTwoDigits(date.getHours()),
      padTwoDigits(date.getMinutes()),
      padTwoDigits(date.getSeconds()),
    ].join('')
  );
}

function dateFormatIsoMinusOneDay(date) {
  const today = date.getDate();
  if (today === 1) {
    date.setDate(0);
    return (
      [
        date.getFullYear(),
        padTwoDigits(date.getMonth() + 1),
        padTwoDigits(date.getDate()),
      ].join(' ') +
      [
        'T',
        padTwoDigits(date.getHours()),
        padTwoDigits(date.getMinutes()),
        padTwoDigits(date.getSeconds()),
      ].join('')
    );
  } else {
    return (
      [
        date.getFullYear(),
        padTwoDigits(date.getMonth() + 1),
        padTwoDigits(date.getDate() - 1),
      ].join('') +
      [
        'T',
        padTwoDigits(date.getHours()),
        padTwoDigits(date.getMinutes()),
        padTwoDigits(date.getSeconds()),
      ].join('')
    );
  }
}

module.exports = {
  dateInYyyyMmDdHhMmSs,
  dateFormatMinusTwoDay,
  dateFormatMinusOneDay,
  convertDateToTimeStamp,
  dateFormatPlusOneHour,
  dateFormatMinusSevenDay,
  dateFormatIso,
  dateFormatIsoMinusOneDay,
  dateInYyyyMmDdHhMmSsWithSlash,
  dateFormat,
};
