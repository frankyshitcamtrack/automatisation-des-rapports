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
  if (!dateTimeStr || typeof dateTimeStr !== 'string') {
    return NaN;
  }

  // Normaliser : remplacer 24:00 par 00:00 du jour suivant si nécessaire
  const has24 = dateTimeStr.includes('24:');
  if (has24) {
    // Remplacer 24:xx par 00:xx et ajouter 1 jour
    dateTimeStr = dateTimeStr.replace('24:', '00:');
  }

  const parts = dateTimeStr.trim().split(' ');
  let datePart, timePart;

  if (parts.length === 2) {
    [datePart, timePart] = parts;
  } else if (parts.length === 1) {
    // Pas de date → utiliser aujourd'hui
    datePart = new Date().toISOString().split('T')[0]; // "2024-05-17"
    timePart = parts[0];
  } else {
    return NaN;
  }

  // Parser date
  const [year, month, day] = datePart.split('-').map(Number);
  if (![year, month, day].every(Number.isFinite)) {
    return NaN;
  }

  // Parser heure
  const timeParts = timePart.split(':').map(Number);
  const hour = timeParts[0];
  const minute = timeParts[1] ?? 0;
  const second = timeParts[2] ?? 0;

  if (![hour, minute, second].every(Number.isFinite)) {
    return NaN;
  }

  // Créer la date
  const date = new Date(year, month - 1, day, hour, minute, second);

  // Vérifier validité
  if (isNaN(date.getTime())) {
    return NaN;
  }

  // Si on avait 24:xx, ajouter 1 jour
  if (has24) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

function keepLatestNotifications(notifications) {
  const latestByGroup = new Map();
  const anyByGroup = new Map();
  const driverNameByGroup = new Map();

  for (const item of notifications) {
    const key = item.Grouping;
    if (!key) continue;


    if (!driverNameByGroup.has(key)) {
      const driverName = item.driverName || item['Nom Conducteur'] || item.Drivers || null;
      if (driverName) {
        driverNameByGroup.set(key, driverName);
      }
    }


    if (!anyByGroup.has(key)) {
      anyByGroup.set(key, item);
    }


    let timeStr = null;
    if (item.Heure && typeof item.Heure === 'object' && item.Heure.text) {
      timeStr = item.Heure.text;
    } else if (item['Date et heure'] && typeof item['Date et heure'] === 'object' && item['Date et heure'].text) {
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
      if (existing.Heure?.text) {
        existingTimeStr = existing.Heure.text;
      } else if (existing['Date et heure']?.text) {
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


    let driverName = best.driverName ||
      best['Nom Conducteur'] ||
      best.Drivers;


    if (!driverName) {
      driverName = driverNameByGroup.get(key) || null;
    }


    const finalItem = { ...best };


    if (driverName) {

      finalItem.driverName = driverName;

      if (!finalItem['Nom Conducteur']) finalItem['Nom Conducteur'] = driverName;
    }

    result.push(finalItem);
  }

  return result;
}


module.exports = { removeDuplicates, removeDuplicatesCustom, keepLatestNotifications };
