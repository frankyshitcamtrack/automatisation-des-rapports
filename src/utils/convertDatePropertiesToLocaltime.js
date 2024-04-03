const {getLocalTime}= require('./getLocalTime')


function isValidDate (str) {
      let [y,M,d,h,m,s] = str.split(/[- : T Z]/);
      return (y && M <= 12 && d <= 31 && h<=23 && m<=60 && s<=60) ? true : false;
  
  }
  

function changePropertiesDateTOLocal(objects) {
    return objects.map((object) => {
      Object.keys(object).forEach((property) => {
        const validate=isValidDate(object[property])
         if(validate===true){
           const newlocalDate=getLocalTime(object[property])
           object[property]=newlocalDate
         }
      });
  
      return object;
    });
}

module.exports={changePropertiesDateTOLocal}