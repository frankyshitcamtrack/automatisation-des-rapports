function getTime(time) {
  const arrTime = time.split(':');
  return [parseInt(arrTime[0]), parseInt(arrTime[1]), parseInt(arrTime[2])];
}

// Helper function to convert HH:MM:SS to total seconds
function timeToSeconds(time) {
  if (time) {
    const arrTime = time.split(':');
    return (
      parseInt(arrTime[0]) * 3600 +
      parseInt(arrTime[1]) * 60 +
      parseInt(arrTime[2])
    );
  }
}

function calculateTime(Arr) {
  const times = [];
  Arr.map((item) => {
    if (item['Temps total']) {
      const time = item['Temps total'];
      const cvt = getTime(time);
      times.push(cvt);
    } else {
      const cvt = getTime(item);
      times.push(cvt);
    }
  });

  if (times.length > 0) {
    const b = times?.reduce((a, b) => a.map((v, i) => v + b[i]));
    const c = new Date();
    c.setHours(...b);
    const s = c.getSeconds();
    const min = c.getMinutes();
    const hr = c.getHours();
    const minFormat = min > 9 ? min : `0${min}`;
    const secFormat = s > 9 ? s : `0${s}`;
    const totalTime = `${hr}:${minFormat}:${secFormat}`;
    return totalTime;
  }
}

function calculateTimeGlobal(Arr, props) {
  const times = [];
  Arr.map((item) => {
    if (item[props]) {
      const time = item[props];
      const cvt = getTime(time);
      times.push(cvt);
    } else {
      const cvt = getTime(item);
      times.push(cvt);
    }
  });

  if (times.length > 0) {
    const b = times?.reduce((a, b) => a.map((v, i) => v + b[i]));
    const c = new Date();
    c.setHours(...b);
    const s = c.getSeconds();
    const min = c.getMinutes();
    const hr = c.getHours();
    const minFormat = min > 9 ? min : `0${min}`;
    const secFormat = s > 9 ? s : `0${s}`;
    const totalTime = `${hr}:${minFormat}:${secFormat}`;
    return totalTime;
  }
}

function divideTimesAsPercentage(time1, time2) {
  // Convert both times to seconds
  const seconds1 = timeToSeconds(time1);
  const seconds2 = timeToSeconds(time2);

  // Perform division, multiply by 100 for percentage, and return the result
  const result = (seconds1 / seconds2) * 100;

  return isNaN(result) ? 0 : result;
}

module.exports = {
  calculateTime,
  calculateTimeGlobal,
  divideTimesAsPercentage,
};
