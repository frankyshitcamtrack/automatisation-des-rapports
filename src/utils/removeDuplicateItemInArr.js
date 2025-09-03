function removeDuplicates(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

function removeDuplicatesCustom(arr, keyFn) {
  const seen = new Set();
  return arr.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseCustomDateTime(dateTimeStr) {
  // Extraire date et heure
  const [datePart, timePart] = dateTimeStr.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hourStr, min, sec] = timePart.split(':').map(Number);

  // Gérer les heures > 23 (ex: 24:00 → 00:00 du jour suivant)
  const totalHours = hourStr;
  const baseDate = new Date(year, month - 1, day); // mois en JS = 0-11

  // Ajouter les heures, minutes, secondes
  baseDate.setHours(baseDate.getHours() + totalHours, min, sec, 0);

  return baseDate;
}

function keepLatestNotifications(notifications) {
  const latestByGroup = new Map();
  const anyByGroup = new Map();

  for (const item of notifications) {
    const key = item.Grouping;
    if (!key) continue;


    if (!anyByGroup.has(key)) {
      anyByGroup.set(key, item);
    }


    let timeStr = null;


    if (item.Heure && typeof item.Heure === 'object' && item.Heure.text) {
      timeStr = item.Heure.text;
    }


    else if (item['Date et heure'] && typeof item['Date et heure'] === 'object' && item['Date et heure'].text) {
      timeStr = item['Date et heure'].text;
    }


    if (!timeStr) {
      continue;
    }


    const parsedDate = parseCustomDateTime(timeStr);
    if (isNaN(parsedDate.getTime())) {
      continue;
    }


    const existing = latestByGroup.get(key);
    if (!existing) {
      latestByGroup.set(key, item);
    } else {

      let existingTimeStr = null;
      if (existing.Heure && existing.Heure.text) {
        existingTimeStr = existing.Heure.text;
      } else if (existing['Date et heure'] && existing['Date et heure'].text) {
        existingTimeStr = existing['Date et heure'].text;
      }

      if (!existingTimeStr) continue;

      const existingDate = parseCustomDateTime(existingTimeStr);
      if (isNaN(existingDate.getTime())) continue;

      if (parsedDate > existingDate) {
        latestByGroup.set(key, item);
      }
    }
  }


  const result = [];
  for (const [key, fallbackItem] of anyByGroup) {
    const best = latestByGroup.get(key) || fallbackItem;
    result.push(best);
  }

  return result;
}


module.exports = { removeDuplicates, removeDuplicatesCustom, keepLatestNotifications };
