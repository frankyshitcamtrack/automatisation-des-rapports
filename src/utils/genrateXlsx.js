const fs = require('fs');
const XLSX = require('xlsx')


function convertJsonToExcel(data,sheet,path) {
   console.log(`Generating file ${sheet} ...`);

   const isExistPath =fs.existsSync(path);

    if(isExistPath){
        const workBook = XLSX.readFile(path);
        const workSheet = XLSX.utils.json_to_sheet(data,{ origin: 1});

        XLSX.utils.book_append_sheet(workBook, workSheet,sheet);

        // Generate buffer
        XLSX.write(workBook, { bookType: 'xlsx', type: "buffer" })
    
        // Binary string
        XLSX.write(workBook, { bookType: "xlsx", type: "binary" })
       
    
        XLSX.writeFile(workBook, path)
        console.log(`${sheet} Generated successfully`);

    }else{
    
        const workBook = XLSX.utils.book_new();
 
        const workSheet = XLSX.utils.json_to_sheet(data,{ origin: 1});
       

        XLSX.utils.book_append_sheet(workBook, workSheet,sheet);

        // Generate buffer
        XLSX.write(workBook, { bookType: 'xlsx', type: "buffer" });
    
        // Binary string
        XLSX.write(workBook, { bookType: "xlsx", type: "binary" });
       
    
        XLSX.writeFile(workBook, path);
        console.log(`${sheet} Generated successfully`);
    }

} 





module.exports={convertJsonToExcel}