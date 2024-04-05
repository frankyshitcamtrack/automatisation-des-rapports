const fs = require('fs');
const XLSX = require('xlsx-js-style')
const {assignStyleToHeaders}= require('../utils/assignStylesPropsToHeader');

function convertJsonToExcel(data,sheet,path) {
    //count header properties
    const dataHeaderLength=Object.keys(data[0]).length;

    let isGenerated=false;
   console.log(`Generating file ${sheet} ...`);

   const isExistPath =fs.existsSync(path);

    if(isExistPath){
        const workBook = XLSX.readFile(path);
        const workSheet = XLSX.utils.json_to_sheet(data,{ origin: 1});
        
      
        //Assign style properties to headers sheet
        assignStyleToHeaders(workSheet,dataHeaderLength);

        XLSX.utils.book_append_sheet(workBook, workSheet,sheet);

        // Generate buffer
        XLSX.write(workBook, { bookType: 'xlsx', type: "buffer" })
    
        // Binary string
        XLSX.write(workBook, { bookType: "xlsx", type: "binary" })
       
    
        XLSX.writeFile(workBook, path)
        console.log(`${sheet} Generated successfully`);
        isGenerated=true
        return isGenerated

    }else{
    
        const workBook = XLSX.utils.book_new();
        
        const workSheet = XLSX.utils.json_to_sheet(data,{ origin: 1});

        //Assign style properties to headers sheet
        assignStyleToHeaders(workSheet,dataHeaderLength);

        XLSX.utils.book_append_sheet(workBook, workSheet,sheet);
 
        // Generate buffer
        XLSX.write(workBook, { bookType: 'xlsx', type: "buffer" });
    
        // Binary string
        XLSX.write(workBook, { bookType: "xlsx", type: "binary" });
       
    
        XLSX.writeFile(workBook, path);
        
        isGenerated=true
        return isGenerated
    }

} 





module.exports={convertJsonToExcel}