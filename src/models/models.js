const {generateReportGlobal}=require('../services/services');
const {convertArrayObject}=require('../utils/ArrToObject');
const {changeObjectKeys}=require('../utils/changeObjectKeys');
const {convertJsonToExcel}=require('../utils/genrateXlsx');
const {changePropertiesDateTOLocal}= require('../utils/convertDatePropertiesToLocaltime');
const {removeProperties}= require('../utils/removeProperties');
const {changeHeaderToColum}= require('../utils/changeHeaderToColum')
const {replaceProps}=require('../utils/replaceProperties');


async function getRepportDataUnit(ressourceClient,template,client,from,to,subGroup){

  let items=[];
  let repportDetail;
  let group;
  const generateRepport =await generateReportGlobal(ressourceClient,template,client,from,to,subGroup);
  
 if(generateRepport){
 
    repportDetail = generateRepport.repportDetail;
    group = generateRepport.group;
    if(repportDetail && group){
     
     const header=group.header;
     const total= group.total;

     repportDetail.map((item)=>{
        const c=item.c;
           items.push(c)
     }); 

     if(total){
      items.push(total);
     }
   
    if (items.length > 0) {
      //change every arr to object

      const obj = convertArrayObject(items);
      
      const filterHeader= header.filter(item=>item!=='№');
      
     // Create excel colum base to header data
      const excelColum= changeHeaderToColum(filterHeader);
      
      //change all object key by the header group values
     changeObjectKeys(header,obj);


     //Convert GMT Date values to Local
     changePropertiesDateTOLocal(obj)
   
     //Remove all № item
     removeProperties(obj,'№');
     
     return {obj,excelColum}
     
    }

  }
 }
}


async function getRepportData(ressourceClient,template,client,from,to,subGroup){

   let items=[];
   let repportDetail;
   let group;
   const generateRepport =await generateReportGlobal(ressourceClient,template,client,from,to,subGroup);
   
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

       const obj = convertArrayObject(items);
       
       const filterHeader= header.filter(item=>item!=='№');
       
      // Create excel colum base to header data
       const excelColum= changeHeaderToColum(filterHeader);
       
       //change all object key by the header group values
      changeObjectKeys(header,obj);
 

      //Convert GMT Date values to Local
      changePropertiesDateTOLocal(obj)
    
      //Remove all № item
      removeProperties(obj,'№');

      //replace Groupe props by Vehicules
      //replaceProps(obj,"Grouping","Véhicules");
      
      return {obj,excelColum}
      
     }

   }
  }
}



async function generateRepport(ressourceClient,path,template,client,sheet,from,to,reportTitleDate,subGroup,colorSheet){
  const dataRepport = await getRepportData(ressourceClient,template,client,from,to,subGroup)
  
  if(dataRepport){
     //console.log(dataRepport.obj);
    const data=dataRepport.obj;
    const columns=dataRepport.excelColum
    convertJsonToExcel(data,sheet,`${path}-${reportTitleDate}.xlsx`,columns,colorSheet);
  }else{
    console.log(`no data found in ${template} ${subGroup}`);
  }

}

module.exports={generateRepport,getRepportData,getRepportDataUnit}
