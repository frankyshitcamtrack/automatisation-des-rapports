function assignStyleToHeaders(ws){
    const rows = ws.getColumn(1);
    const rowsCount = rows['_worksheet']['_rows'].length;
    const lastCell =`A${rowsCount}`;
    const lastValCell=ws.getCell(lastCell).value;

    ws.eachRow((row, rowNumber) => {
        row.height =40;
        row.eachCell((cell, colNumber) => {
            cellVal=cell.value;
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            };
            cell.font = { name: 'calibri', size: 8 };

            if (rowNumber == 8) {
                // First set the background of header row
                if(cell.value==='Grouping'){
                    cell.value='Véhicules'
                }
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: "023E8A" }
                }
                cell.font = { color: { argb: 'FFFFFF' }, bold: true }
            }

            if (rowNumber ==rowsCount &&  lastValCell=='Total') {
                // set background of Total row
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: "023E8A" }
                }
                cell.font = { color: { argb: 'FFFFFF' }, bold: true }
            }

        })
        //Commit the changed row to the stream
        row.commit();
    });

    

}

module.exports={assignStyleToHeaders}