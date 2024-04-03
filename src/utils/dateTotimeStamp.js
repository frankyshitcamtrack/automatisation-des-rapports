function convertDateToTimeStamp(date){
   const convert = new Date(date).getTime()/1000;

   return convert;
}

module.exports={convertDateToTimeStamp}