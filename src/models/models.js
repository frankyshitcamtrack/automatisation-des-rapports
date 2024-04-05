const {generateReportGlobal}=require('../services/services');
const {convertArrayObject}=require('../utils/ArrToObject');
const {changeObjectKeys}=require('../utils/changeObjectKeys');
const {convertJsonToExcel}=require('../utils/genrateXlsx');
const {changePropertiesDateTOLocal}= require('../utils/convertDatePropertiesToLocaltime');
const {removeProperties}= require('../utils/removeProperties');
const {replaceProps}=require('../utils/replaceProperties');

async function generateRepport(ressourceClient,path,template,client,sheet,from,to,reportTitleDate,subGroup){
   let items=[];
   let repportDetail;
   let group;
   const generateRepport = await generateReportGlobal(ressourceClient,template,client,from,to,subGroup);
   
  if(generateRepport){
     repportDetail = generateRepport.repportDetail;
     group = generateRepport.group;
     if(repportDetail && group){
      
      const header=group.header;
      const total= group.total;

      repportDetail.map((item)=>{
         const r=item.r;
         const c=item.c;
         if(r){
           r.map(item=>{
            items.push(item.c)
           })
         }else{
            items.push(c)
         }
      }); 

      if(total){
       items.push(total);
      }
    
     if (items.length > 0) {
       //change every arr to object
       const obj = convertArrayObject(items)
       
       //change all object key by the header group values
      changeObjectKeys(header,obj);

      //Convert GMT Date values to Local
      changePropertiesDateTOLocal(obj)
     
      //Remove all № item
      removeProperties(obj,'№');
      
      const convert=  convertJsonToExcel(obj,sheet,`${path}-${reportTitleDate}.xlsx`);
      return convert
     }

   }
  }
   

   
}


module.exports={generateRepport}
