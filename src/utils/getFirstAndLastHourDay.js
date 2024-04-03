const {dateInYyyyMmDdHhMmSs} = require('./dateFormat');
const {convertDateToTimeStamp} =require('./dateTotimeStamp');

function getFistAndLastHourDay(){
    let startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    let firstHourDay = new Date(startOfDay.getFullYear(), startOfDay.getMonth(),startOfDay.getDay()-1,startOfDay.getHours(),startOfDay.getMinutes(),startOfDay.getSeconds());
    let firstHourDayFormat=dateInYyyyMmDdHhMmSs(firstHourDay);
    let firstHourDayTimestamp =convertDateToTimeStamp(firstHourDayFormat);

    let endofDay = new Date();
    endofDay.setHours(23, 59, 59, 999);   
    let lastHourDay = new Date(endofDay.getFullYear(), endofDay.getMonth(),endofDay.getDay()-1,endofDay.getHours(),endofDay.getMinutes(),endofDay.getSeconds() );
    let lasthourDayFormat =dateInYyyyMmDdHhMmSs(lastHourDay);
    let lastHourDayTimestamp =convertDateToTimeStamp(lasthourDayFormat);
    

    let date= new Date();

    let title= new Date(date.getFullYear(), date.getMonth(),date.getDay()-1);

    let dateTitle=dateInYyyyMmDdHhMmSs(title).split(' ')[0];
  

    return {firstHourDayTimestamp,lastHourDayTimestamp,dateTitle}

}


function getFistAndLastHourDay22H06H(){
    let startOfDay = new Date();
    startOfDay.setHours(23, 0, 0, 0);
    let firstHourDay = new Date(startOfDay.getFullYear(), startOfDay.getMonth(),startOfDay.getDay()-1,startOfDay.getHours(),startOfDay.getMinutes(),startOfDay.getSeconds());
    let firstHourDayFormat=dateInYyyyMmDdHhMmSs(firstHourDay);
    let firstHourDayTimestamp06h =convertDateToTimeStamp(firstHourDayFormat);

    let endofDay = new Date();
    endofDay.setHours(7, 0, 0, 0);   
    let lastHourDay = new Date(endofDay.getFullYear(), endofDay.getMonth(),endofDay.getDay(),endofDay.getHours(),endofDay.getMinutes(),endofDay.getSeconds() );
    let lasthourDayFormat =dateInYyyyMmDdHhMmSs(lastHourDay);
    let lastHourDayTimestamp22h =convertDateToTimeStamp(lasthourDayFormat);
    

    let date= new Date();

    let title= new Date(date.getFullYear(), date.getMonth(),date.getDay()-1);

    let dateTitle=dateInYyyyMmDdHhMmSs(title).split(' ')[0];
  

    return {firstHourDayTimestamp06h,lastHourDayTimestamp22h,dateTitle}

}

module.exports={getFistAndLastHourDay,getFistAndLastHourDay22H06H}