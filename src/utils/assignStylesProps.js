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

                if(cell.value==='Conducteur'){
                    cell.value='Utilisateurs'
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


function asignStyleToPerencoInfraction(ws){
    const wsName= ws.name
    if(wsName==='Eco driving'){
        ws.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
             const cellVal = cell.value;
             const includeSeveral =cellVal.includes('Several');
             const includeRapport =cellVal.includes('RAPPORT');
            if (colNumber==4 &&  rowNumber!==8 ){
                if(includeSeveral && !includeRapport){
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: "FF0000" }
                    }
                    cell.font = { color: { argb: 'FFFFFF' }}
                }
                
                if(!includeSeveral && !includeRapport){
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: "008000" }
                    }
                    cell.font = { color: { argb: 'FFFFFF' }}
                }
            }
           
            })
            //Commit the changed row to the stream
            row.commit();
        });
    }

    if(wsName==='Speeding Détail'){
        ws.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
             const cellVal = cell.value;
             const includeSeveral =cellVal.includes('Sévère');
             const includeSpeeding =cellVal.includes('Speeding');
            if (colNumber==5 &&  rowNumber!==8 ){
                if(includeSeveral && !includeSpeeding){
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: "FF0000" }
                    }
                    cell.font = { color: { argb: 'FFFFFF' }}
                }
                
                if(!includeSeveral && !includeSpeeding){
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: "008000" }
                    }
                    cell.font = { color: { argb: 'FFFFFF' }}
                }
            }
           
            })
            //Commit the changed row to the stream
            row.commit();
        });
    }

    if(wsName==='Conduite de NUIT'){
        ws.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
             const cellVal = cell.value;
             const include24H04 =cellVal.includes('24H-04H');
             const include22H24 =cellVal.includes('22H-24H');
             const includeRapport =cellVal.includes('RAPPORT');
            if (colNumber==4 &&  rowNumber!==8 ){
                if(include24H04 && !includeRapport){
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: "FF0000" }
                    }
                    cell.font = { color: { argb: 'FFFFFF' }}
                }
                
                if(include22H24 && !includeRapport){
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: "008000" }
                    }
                    cell.font = { color: { argb: 'FFFFFF' }}
                }
            }
           
            })
            //Commit the changed row to the stream
            row.commit();
        });
    }
  
  
}

module.exports={assignStyleToHeaders,asignStyleToPerencoInfraction}