const {dateFormatPlusOneHour}=require('./dateFormat')
const {isValidDate}=require('./checkValidDate')


function changePropertiesDateTOLocal(objects) {
    return objects.map((object) => {
      Object.keys(object).forEach((property) => {
        let item=object[property]
        if (typeof item ==='object'){
          const validate=isValidDate(item.text)
          if(validate===true){
            const newlocalDate=dateFormatPlusOneHour(item.text)
            item=newlocalDate
          }
        } else{
          const validate=isValidDate(item)
          if(validate===true){
            const newlocalDate=dateFormatPlusOneHour(item)
            item=newlocalDate
          }
        }
      });
  
      return object;
    });
}

module.exports={changePropertiesDateTOLocal}