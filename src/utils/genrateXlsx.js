const fs = require('fs');

const XLSX = require('exceljs');

const { getTitleHeaderSheet } = require('../utils/getTitleHeaderSheet')

const { addAutoFilter } = require('./addAutofilter')

async function convertJsonToExcel(data, sheet, path, excelColum, colorSheet) {
    const dataHeader = []
    console.log(`Generating file ${sheet} ...`);

    const isExistPath = fs.existsSync(path);

    let workbook = new XLSX.Workbook();


    const imageId2 = workbook.addImage({
        filename: 'rapport/Adax/assets/header.PNG',
        extension: 'png',
    });


    if (excelColum) {
        excelColum.map(item => {
            dataHeader.push(item.key);
        })
    }

    if (isExistPath) {
        workbook.xlsx.readFile(path)
            .then(() => {
                if (dataHeader.length > 0) {
                    const autoFilter = addAutoFilter(dataHeader, 10)
                    const worksheet = workbook.addWorksheet(sheet, { properties: { tabColor: { argb: colorSheet } } });
                    worksheet.getRow(10).values = dataHeader;
                    worksheet.addImage(imageId2, 'A1:J6');

                    worksheet.columns = excelColum;
                    worksheet.autoFilter = autoFilter;

                    //Add data to rows
                    data.map(item => {
                        worksheet.addRow(item)
                    })

                    // Process each row for beautification 
                    worksheet.eachRow((row, rowNumber) => {
                        row.height = 25;
                        row.eachCell((cell, colNumber) => {
                            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                            cell.font = { name: 'calibri', size: 8 };
                            if (rowNumber == 10) {
                                // First set the background of header row
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


                    worksheet.mergeCells('A7', 'J7',);
                    worksheet.getCell('A7').alignment = { vertical: 'middle', horizontal: 'center' };
                    worksheet.getCell('A7').font = { name: 'calibri', size: 15, bold: true };
                    worksheet.getCell('A7').border = {
                        top: { style: 'thin', color: { argb: '000000' } },
                        bottom: { style: 'thin', color: { argb: '000000' } },
                        right: { style: 'thin', color: { argb: '000000' } }
                    };
                    worksheet.getCell('A7').value = getTitleHeaderSheet(sheet);

                    //set Auto Column Width
                    worksheet.columns.forEach(column => {
                        const header=column.header
                        if(header){
                            column.width = column.header.length < 12 ? 12 : column.header.length
                        }
                       
                    })
        
                    return workbook.xlsx.writeFile(path)
                        .then(response => {
                            console.log("file is written");
                        })
                        .catch(err => {
                            console.log(err);
                        });
                }

            });
    } else {
        const worksheet = workbook.addWorksheet(sheet, { properties: { tabColor: { argb: colorSheet } } });
        if (dataHeader.length > 0) {
            const autoFilter = addAutoFilter(dataHeader, 10)
            worksheet.getRow(10).values = dataHeader;
            worksheet.addImage(imageId2, 'A1:J6');

            worksheet.columns = excelColum;

            worksheet.autoFilter = autoFilter;

            //Add data to rows
            data.map(item => {
                worksheet.addRow(item)
            })

            // Process each row for beautification 
            worksheet.eachRow((row, rowNumber) => {
                row.height = 25;
                row.eachCell((cell, colNumber) => {
                    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    cell.font = { name: 'calibri', size: 8 };
                    if (rowNumber == 10) {
                        // First set the background of header row
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


            worksheet.mergeCells('A7', 'J7',);
            worksheet.getCell('A7').alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.getCell('A7').font = { name: 'calibri', size: 15, bold: true };
            worksheet.getCell('A7').border = {
                top: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            };

            worksheet.getCell('A7').value = getTitleHeaderSheet(sheet);

            //set Auto Column Width
            worksheet.columns.forEach(column => {
                const header=column.header
                if(header){
                    column.width = column.header.length < 12 ? 12 : column.header.length
                }
               
            })


            workbook.xlsx.writeFile(path)
                .then(response => {
                    console.log("file is written");
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }

}

async function generateSyntheseSheetAddax(data, path, sheet) {

    console.log(`Generating file ${sheet} ...`);

    const isExistPath = fs.existsSync(path);

    let workbook = new XLSX.Workbook();

    const imageId2 = workbook.addImage({
        filename: 'rapport/Adax/assets/header.PNG',
        extension: 'png',
    });

    if (isExistPath) {
        workbook.xlsx.readFile(path)
            .then(() => {
                const worksheet = workbook.addWorksheet(sheet);

                worksheet.addImage(imageId2, 'A1:D4');

                worksheet.mergeCells('A5', 'D5');
                worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };
                worksheet.getCell('A5').font = { name: 'Arial', size: 12, bold: true };
                worksheet.getCell('A5').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('A5').value = sheet

                worksheet.getColumn(1).width = 70
                worksheet.getColumn(2).width = 60

                //first Array
                worksheet.getCell('A8').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('A9').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('A10').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('A11').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };

                worksheet.getCell('B8').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('B9').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('B10').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('B11').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };




                worksheet.getCell('A8').value = 'Total Number of Vehicle'
                worksheet.getCell('A9').value = 'Number of vehicle communicating'
                worksheet.getCell('A10').value = 'Number of vehicle used'
                worksheet.getCell('A11').value = 'percentage of vehicle used'

                worksheet.getCell('B8').value = data['Total Number of Vehicle']
                worksheet.getCell('B9').value = data['Number of vehicle communicating']
                worksheet.getCell('B10').value = data['Number of vehicle used']
                worksheet.getCell('B11').value = data['percentage of vehicle used']

                //Second Array
                worksheet.mergeCells('A14', 'A16');
                worksheet.mergeCells('A17', 'A18');


                worksheet.getCell('A14').alignment = { vertical: 'middle', horizontal: 'center' };
                worksheet.getCell('A14').font = { bold: true };
                worksheet.getCell('A14').value = 'Total Km driven'

                worksheet.getCell('A17').alignment = { vertical: 'middle', horizontal: 'center' };
                worksheet.getCell('A17').font = { bold: true };
                worksheet.getCell('A17').value = 'Safety'


                worksheet.getCell('A14').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };

                worksheet.getCell('A17').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };


                worksheet.getCell('B14').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('B15').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('B16').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('B17').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('B18').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };



                worksheet.getCell('C14').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('C15').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('C16').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('C17').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
                worksheet.getCell('C18').border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };


                worksheet.getCell('B14').value = 'Number of vehicles  used'
                worksheet.getCell('B15').value = 'Total Km driven (Km)'
                worksheet.getCell('B16').value = 'Average km driven per vehicle (Km)'
                worksheet.getCell('B17').value = 'Number of vehicles in speeding'
                worksheet.getCell('B18').value = 'max Speed'

                worksheet.getCell('C14').value = data['Number of vehicle used']
                worksheet.getCell('C15').value = data['Total Km driven (Km)']
                worksheet.getCell('C16').value = data['Average km driven per vehicle (Km)']
                worksheet.getCell('C17').value = data['Number of vehicles in speeding']
                worksheet.getCell('C18').value = data['max Speed']



                return workbook.xlsx.writeFile(path)
                    .then(response => {
                        console.log("file is written");
                    })
                    .catch(err => {
                        console.log(err);
                    });

            });
    }
}





module.exports = { convertJsonToExcel, generateSyntheseSheetAddax }