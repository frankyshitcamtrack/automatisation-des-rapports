const { assignStyleToHeaders } = require('./assignStylesProps');
const { autoSizeColumnSheet } = require('../utils/autoSizeColumnSheet');
const { addAutoFilter } = require('./addAutofilter');


function addRowExistSheet(worksheet,data,dataHeader,excelColum){
    const autoFilter = addAutoFilter(dataHeader, 8);

    worksheet.views = [{ showGridLines: false }];

    worksheet.getRow(8).values = dataHeader;

    worksheet.columns = excelColum;

    worksheet.autoFilter = autoFilter;
    //Add data to rows
    data.map(item => {
        worksheet.addRow(item);
    })

    
    // Process each row for beautification 
    assignStyleToHeaders(worksheet);

    //autosize column width base on the content
    autoSizeColumnSheet(worksheet)
}


module.exports={addRowExistSheet}