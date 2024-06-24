function getTime(time) {
    const arrTime = time.split(':');
    return [parseInt(arrTime[0]), parseInt(arrTime[1]), parseInt(arrTime[2])];
}


function calculateTime(Arr){
    const times=[];
    Arr.map(item=>{
      const time =item['Temps total'];
      const cvt = getTime(time);
      times.push(cvt);
    })

    if(times.length>0){
      const b = times?.reduce((a, b) => a.map((v, i) => v + b[i]));
      const c = new Date();
      c.setHours(...b);
      const s = c.getSeconds();
      const min =c.getMinutes();
      const hr =c.getHours();
      const minFormat = min>9?min:`0${min}`;
      const secFormat = s>9?s:`0${s}`;
      const totalTime=`${hr}:${minFormat}:${secFormat}`
      return totalTime;
    }
  }
module.exports ={calculateTime}