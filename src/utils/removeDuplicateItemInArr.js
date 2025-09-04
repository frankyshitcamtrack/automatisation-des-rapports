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

function extractDateTimeStr(item) {
  if (item.Heure) {
    if (typeof item.Heure === "string") return item.Heure;
    if (typeof item.Heure === "object" && item.Heure.text) return item.Heure.text;
  }

  if (item["Date et heure"]) {
    if (typeof item["Date et heure"] === "string") return item["Date et heure"];
    if (typeof item["Date et heure"] === "object" && item["Date et heure"].text) {
      return item["Date et heure"].text;
    }
  }

  return null;
}

function parseCustomDateTime(dateTimeStr) {
  if (!dateTimeStr || typeof dateTimeStr !== "string") return null;

  const [datePart, timePart] = dateTimeStr.split(" ");
  if (!datePart || !timePart) return null;

  const [year, month, day] = datePart.split("-").map(Number);
  const [hourStr, min, sec] = timePart.split(":").map(Number);

  if ([year, month, day, hourStr, min, sec].some(isNaN)) return null;

  const baseDate = new Date(year, month - 1, day);
  baseDate.setHours(baseDate.getHours() + hourStr, min, sec, 0);

  return baseDate;
}


function keepLatestNotifications(notifications) {
  const latestByGroup = new Map();

  for (const item of notifications) {
    const key = item.Grouping;
    if (!key) continue;

    const timeStr = extractDateTimeStr(item);
    const parsedDate = parseCustomDateTime(timeStr);
    if (!parsedDate) continue;

    const existing = latestByGroup.get(key);
    if (!existing || parsedDate > existing.date) {
      latestByGroup.set(key, { item, date: parsedDate });
    }
  }

  return Array.from(latestByGroup.values()).map((v) => v.item);
}



module.exports = { removeDuplicates, removeDuplicatesCustom, keepLatestNotifications };
