async function assignStyleToHeaders(ws){
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

async function asignStyleToSheet(ws){
    ws.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
            })
            //Commit the changed row to the stream
            row.commit();
    });

}


async function asignStyleToPerencoInfraction(ws){
    const wsName= ws.name
    if(wsName==='Eco driving'){
        ws.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
             const cellVal =cell._value.toString();
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
             const cellVal = cell._value.toString();
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
             const cellVal = cell._value.toString();
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



async function assignStylePrencoSynthese(ws){
    ws.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            if (rowNumber == 12 || rowNumber == 14 || rowNumber == 16 || rowNumber == 18 || rowNumber == 20 || rowNumber == 22 || rowNumber == 24  || rowNumber == 26 || rowNumber == 28 || rowNumber == 30) {
                // First set the background of header row
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: "D3D3D3" }
                }
            }
            if (cell.value === 'Harsh Acceleration' || cell.value  === 'Several Acceleration' || cell.value  ===  'Harsh Turn' || cell.value  === 'Several Turn' || cell.value  === 'Harsh Brake' || cell.value  === 'Several Brake'|| cell.value  === '22H24H' || cell.value  ===  '24H04H'  || cell.value  ===  'Distances' || cell.value  === 'Durations' ) {
                // First set the background of header row
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: "d3f0b6" }
                }
                cell.alignment ={ textRotation: 90 ,vertical: 'middle', horizontal: 'center' };
                ws.getColumn(colNumber).width= 7
               
            }

           
            if (cell.value === 'Severe-Ville' || cell.value  === 'Legere-Ville' || cell.value  ===  'Severe-HorsVille' || cell.value  === 'Legere-HorsVille' || cell.value  === 'Severe-Nat3' || cell.value  === 'Legere-Nat3') {
                // First set the background of header row
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: "023E8A" }
                }

                cell.font = { color: { argb: 'FFFFFF' }}
                cell.alignment ={ textRotation: 90 ,vertical: 'middle', horizontal: 'center' };
                ws.getColumn(colNumber).width= 7
               
            }

            if (cell.value === 'Distance' || cell.value  === 'Duration') {
                cell.alignment ={ textRotation: 90 ,vertical: 'middle', horizontal: 'center' };
                ws.getColumn(colNumber).width= 7
            }
        })
        //Commit the changed row to the stream
        row.commit();
    });

}



async function assignStyleToHeadersSynthese(ws){
    const rows = ws.getColumn(1);
    const rowsCount = rows['_worksheet']['_rows'].length;
    const lastCell =`A${rowsCount}`; 

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
                cell.fill = {
                    type: 'gradient',
                    gradient: 'angle',
                    degree: 90,
                    stops: [
                        { position: 0, color: { argb: 'FFFFFFFF' } },
                        { position: 0.5, color: { argb: '37376b' } },
                        { position: 1, color: { argb: '37376b' } }
                    ]
                }
                cell.font = { color: { argb: 'FFFFFF' }, bold: true }
            }

         if(cellVal==='Vehicle Usage' || cellVal==='Night Driving' || cellVal==='Prohibit Working Day' || cellVal==='Speedings'|| cellVal==='Exceptions'){
              cell.font = { color: { argb: 'FFFFFF' }, bold: true }
            } 

            if(cellVal==='Acceleration' || cellVal==='Turn' || cellVal==='Brake'){
                cell.font = { color: { argb: 'FFFFFF' }, bold: true }
            } 

        })
        //Commit the changed row to the stream
        row.commit();
    });

}


async function assignStyleToHeadersCimencam(ws){
    const rows = ws.getColumn(1);
    const rowsCount = rows['_worksheet']['_rows'].length;
    const lastCell =`A${rowsCount}`;
    const lastValCell=ws.getCell(lastCell).value;

    ws.eachRow((row, rowNumber) => {
        row.height = 20;
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


            if (rowNumber == 7) {
                row.height =50;
                // First set the background of header row
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: "008000" }
                }
                cell.font = { color: { argb: 'FFFFFF' }, bold: true };
            }

            
            if (rowNumber == 9 ) {
                // First set the background of header row
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: "008000" }
                }
                cell.font = { color: { argb: 'FFFFFF' }, bold: true }
            }
        })
        //Commit the changed row to the stream
        row.commit();
    });

}


module.exports={assignStyleToHeaders,asignStyleToPerencoInfraction,assignStyleToHeadersSynthese,assignStylePrencoSynthese,asignStyleToSheet,assignStyleToHeadersCimencam}