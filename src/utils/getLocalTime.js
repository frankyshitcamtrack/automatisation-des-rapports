const {dateInYyyyMmDdHhMmSs}=require('./dateFormat')

function getLocalTime(i){
    const date=new Date(i);
     let newDate = new Date(date.getFullYear(), date.getMonth(),date.getDay(),date.getHours()+1,date.getMinutes(),date.getSeconds() );
    let newLocalDate =dateInYyyyMmDdHhMmSs(newDate);
    return newLocalDate;
}

module.exports={getLocalTime}