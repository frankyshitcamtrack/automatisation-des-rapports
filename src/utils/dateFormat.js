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

function convertDateToTimeStamp(dateString, timeZone = 'Africa/Lagos') {

  const localDate = new Date(`${dateString} GMT+0100`);

  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const localTimestamp = date.getTime() - (offset * 60 * 1000);

  return Math.floor(localTimestamp / 1000);
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


function formatToLocalTime(dateString, timeZone = 'Africa/Lagos') {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Si date invalide, retourne l'original

  // Formate en heure locale d'Africa/Lagos
  return date.toLocaleString('fr-FR', {
    timeZone: timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/[/]/g, '-').replace(/[,]/g, '');
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
  formatToLocalTime
};
