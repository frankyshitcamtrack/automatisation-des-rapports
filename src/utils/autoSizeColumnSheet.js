function autoSizeColumnSheet(ws){
   return ws.columns.forEach( (column, i)=> {
        let maxLength = 0;
        column["eachCell"]({ includeEmpty: true },  (cell) =>{
            let columnLength = cell.value ? cell.value.toString().length : 15;
            if (columnLength > maxLength && columnLength<40 ) {
                maxLength = columnLength;
            }
            if(columnLength > maxLength && columnLength>40){
                maxLength = 40;
            }
        });
        column.width = maxLength < 15 ? 15 : maxLength;
    });

}

module.exports={autoSizeColumnSheet}