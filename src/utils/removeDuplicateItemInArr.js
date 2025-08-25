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
  const anyByGroup = new Map(); // Pour garder *au moins une* notification par groupe

  for (const item of notifications) {
    const key = item.Grouping;
    if (!key) continue; // ignore si pas de Grouping

    // Enregistrer *toujours* une notification (pour le cas de secours)
    if (!anyByGroup.has(key)) {
      anyByGroup.set(key, item);
    }

    // Extraire l'heure
    const timeStr = item.Heure?.text;

    // Si pas d'heure, on ne fait rien ici → on garde le "any" comme fallback
    if (!timeStr) {
      continue;
    }

    // Parser la date
    const parsedDate = parseCustomDateTime(timeStr);
    if (isNaN(parsedDate.getTime())) {
      continue; // date invalide
    }

    // Comparer avec l'existant (qui a une heure)
    const existing = latestByGroup.get(key);
    if (!existing) {
      latestByGroup.set(key, item);
    } else {
      const existingDate = parseCustomDateTime(existing.Heure.text);
      if (parsedDate > existingDate) {
        latestByGroup.set(key, item);
      }
    }
  }

  // === Construire le résultat final ===
  const result = [];

  for (const [key, fallbackItem] of anyByGroup) {
    // Priorité 1 : notification avec heure la plus récente
    // Priorité 2 : première notification reçue (sans heure)
    const best = latestByGroup.get(key) || fallbackItem;
    result.push(best);
  }

  return result;
}


module.exports = { removeDuplicates, removeDuplicatesCustom, keepLatestNotifications };
