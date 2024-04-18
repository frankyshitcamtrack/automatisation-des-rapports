const {getDate}=require('../utils/getDateProps');



function filterData48h(arr){

  const todayDate= new Date();
    
  const filterData=arr.filter(data=>{
   const dt=data['DateTime'];
   const propsDate=getDate(dt);
  
   const d=propsDate.day;
   const h=propsDate.hr;
   const m=propsDate.min;
   const s=propsDate.sec;
   const ms=propsDate.ms;
   
   return ((todayDate.getDate()-1===d && h>=21)  || (todayDate.getDate()===d && h>=0 && h<=7)) ;
   
  })

  return filterData
}


module.exports={filterData48h}
  