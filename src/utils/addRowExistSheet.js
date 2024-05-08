const { autoSizeColumnSheet } = require('../utils/autoSizeColumnSheet');

function addRowExistSheet(worksheet,data){
    
    //Add data to rows
    data.map(item => {
        worksheet.addRow(item)
    })

    //autosize column width base on the content
    autoSizeColumnSheet(worksheet)
}


module.exports={addRowExistSheet}