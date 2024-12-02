function getDate(t) {
  const date = new Date(t);

  const day = date.getDate();
  const hr = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();
  const ms = date.getMilliseconds();

  return { day, hr, min, sec, ms };
}

function getStringDay(d) {
  const newDate = new Date(d);
  const day = newDate.getDay();
  if (day === 0) {
    return 'Dimanche';
  } else if (day === 1) {
    return 'Lundi';
  } else if (day === 2) {
    return 'Mardi';
  } else if (day === 3) {
    return 'Mercredi';
  } else if (day === 4) {
    return 'Jeudi';
  } else if (day === 5) {
    return 'Vendredi';
  } else if (day === 6) {
    return 'Samedi';
  }
}

module.exports = { getDate, getStringDay };
