const {dateInYyyyMmDdHhMmSs,dateFormatMinusOneDay,convertDateToTimeStamp} = require('./dateFormat');


function getFistAndLastHourDay(){
    let startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    let firstHourDayFormat=dateFormatMinusOneDay(startOfDay);
    
    let firstHourDayTimestamp =convertDateToTimeStamp(firstHourDayFormat);

    let endofDay = new Date();
    endofDay.setHours(23, 59, 59, 999);   
    let lasthourDayFormat =dateFormatMinusOneDay(endofDay);
    let lastHourDayTimestamp =convertDateToTimeStamp(lasthourDayFormat);
    

    let date= new Date();

    let dateTitle=dateFormatMinusOneDay(date).split(' ')[0];
  

    return {firstHourDayTimestamp,lastHourDayTimestamp,dateTitle}

}


function getFistAndLastHourDay22H06H(){
    let startOfDay = new Date();
    
    startOfDay.setHours(21, 0, 0);
    let firstHourDayFormat=dateFormatMinusOneDay(startOfDay);
     
    let firstHourDayTimestamp06h =convertDateToTimeStamp(firstHourDayFormat);

    
    let endofDay = new Date();
    endofDay.setHours(7, 0, 0);  
    let lasthourDayFormat =dateInYyyyMmDdHhMmSs(endofDay);
   
    let lastHourDayTimestamp22h =convertDateToTimeStamp(lasthourDayFormat);

    let date= new Date();
    let dateTitle=dateFormatMinusOneDay(date).split(' ')[0];
  
    return {firstHourDayTimestamp06h,lastHourDayTimestamp22h,dateTitle}

}

module.exports={getFistAndLastHourDay,getFistAndLastHourDay22H06H}