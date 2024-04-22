const {dateFormatPlusOneHour}=require('./dateFormat')
const {isValidDate}=require('./checkValidDate')


function changePropertiesDateTOLocal(objects) {
    return objects.map((object) => {
      Object.keys(object).forEach((property) => {
        const validate=isValidDate(object[property])
         if(validate===true){
           const newlocalDate=dateFormatPlusOneHour(object[property])
           object[property]=newlocalDate
         }
      });
  
      return object;
    });
}

module.exports={changePropertiesDateTOLocal}