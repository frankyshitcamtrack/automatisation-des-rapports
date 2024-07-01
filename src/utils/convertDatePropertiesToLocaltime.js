const {dateFormatPlusOneHour}=require('./dateFormat')
const {isValidDate}=require('./checkValidDate')


function changePropertiesDateTOLocal(objects) {
    return objects.map((object) => {
      const obj =object;
      Object.keys(obj).forEach((property) => {
        let item=obj[property];
        if (typeof item ==='object'){
          const validate=isValidDate(item.text);
          if(validate===true){
            const newlocalDate=dateFormatPlusOneHour(item.text);
            item.text=newlocalDate;
          }
        } else{
          const validate=isValidDate(item)
          if(validate===true){
            const newlocalDate=dateFormatPlusOneHour(item)
            item=newlocalDate
          }
        }
      });
       return obj
    });
}

module.exports={changePropertiesDateTOLocal}