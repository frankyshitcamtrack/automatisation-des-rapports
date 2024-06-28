const fs = require('fs');

const XLSX = require('exceljs');
const { addImageBannerHeaderSheet, perencoHeaderSheet,guinnessHeaderSheet } = require('./bannerSheet');
const {asignStyleToPerencoInfraction,assignStylePrencoSynthese, asignStyleToSheet}=require('./assignStylesProps')
const { prepareSheet,prepareSheetForSynthese,addDataTosheet } = require('./prepareSheet');
const { addRowExistSheet } = require('./addRowExistSheet')


async function convertJsonToExcel(data, sheet, path, excelColum, colorSheet) {
    const dataHeader = []

    const isExistPath = fs.existsSync(path);

    let workbook = new XLSX.Workbook();

    const imageId2 = workbook.addImage({
        buffer: fs.readFileSync('rapport/Adax/assets/banner.png'),
        extension: 'png',
    });

    const logo1 = workbook.addImage({
        buffer: fs.readFileSync('rapport/Adax/assets/addax-logo.png'),
        extension: 'png',
    });

    const logo2 = workbook.addImage({
        buffer: fs.readFileSync('rapport/Adax/assets/camtrack-logo.png'),
        extension: 'png',
    });

    if (excelColum) {
        excelColum.map(item => {
            dataHeader.push(item.key);
        })
    }

    if (dataHeader.length > 0) {
        if (isExistPath) {
            setTimeout(async () => {
                console.log(`Generating file ${sheet} ...`);
                const readFile = await workbook.xlsx.readFile(path);
                if (readFile) {
                    const existWorkSheet = workbook.getWorksheet(sheet);
                    if (existWorkSheet) {
                        const existWorkSheetName= existWorkSheet.name;
                         if(existWorkSheetName===sheet){
                            addRowExistSheet(existWorkSheet, data);
                         } 
                    } else {
                        const worksheet = workbook.addWorksheet(sheet, { properties: { tabColor: { argb: colorSheet } } });

                        prepareSheet(worksheet, data, dataHeader, excelColum);
    
                        //Center image header banner depending on number of columns
                        addImageBannerHeaderSheet(worksheet, dataHeader, sheet, imageId2, logo1, logo2)

                    } 
                    // Export excel generated file
                    workbook.xlsx.writeFile(path, { type: 'buffer', bookType: 'xlsx' })
                        .then(response => {
                            console.log("file generated");
                        })
                        .catch(err => {
                            console.log(err);
                        });
                }
            }, 15000)

        } else {
            console.log(`Generating file ${sheet} ...`);

            // creation of new sheet
            const worksheet = workbook.addWorksheet(sheet, { properties: { tabColor: { argb: colorSheet } } });

            prepareSheet(worksheet, data, dataHeader, excelColum);

            //Center image header banner depending on number of columns
            addImageBannerHeaderSheet(worksheet, dataHeader, sheet, imageId2, logo1, logo2);

            // Export excel generated file
            workbook.xlsx.writeFile(path, { type: 'buffer', bookType: 'xlsx' })
                .then(response => {
                    console.log("file generated");
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

    const logo1 = workbook.addImage({
        buffer: fs.readFileSync('rapport/Adax/assets/addax-logo.png'),
        extension: 'png',
    });

    const logo2 = workbook.addImage({
        buffer: fs.readFileSync('rapport/Adax/assets/camtrack-logo.png'),
        extension: 'png',
    });


    if (isExistPath) {
        workbook.xlsx.readFile(path)
            .then(() => {
                const worksheet = workbook.addWorksheet(sheet);

                worksheet.views = [{ showGridLines: false }];

                worksheet.addImage(imageId2, 'A1:D5');

                worksheet.addImage(logo1, { tl: { col: 0, row: 0 }, ext: { width: 100, height: 100 }, editAs: 'oneCell' });

                worksheet.addImage(logo2, { tl: { col: 2, row: 0 }, ext: { width: 100, height: 100 }, editAs: 'oneCell' });

                worksheet.mergeCells('A5', 'D5');
                worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };
                worksheet.getCell('A5').font = { name: 'Arial', size: 12, bold: true };
                worksheet.getCell('A5').border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };
                worksheet.getCell('A5').value = sheet

                worksheet.getColumn(1).width = 70
                worksheet.getColumn(2).width = 60

                //first Array
                const A8 = worksheet.getCell('A8');
                const A9 = worksheet.getCell('A9');
                const A10 = worksheet.getCell('A10');
                const A11 = worksheet.getCell('A11');
                const A14 = worksheet.getCell('A14');
                const A17 = worksheet.getCell('A17');


                const B8 = worksheet.getCell('B8');
                const B9 = worksheet.getCell('B9');
                const B10 = worksheet.getCell('B10');
                const B11 = worksheet.getCell('B11');
                const B14 = worksheet.getCell('B14');
                const B15 = worksheet.getCell('B15');
                const B16 = worksheet.getCell('B16');
                const B17 = worksheet.getCell('B17');
                const B18 = worksheet.getCell('B18');


                const C14 = worksheet.getCell('C14')
                const C15 = worksheet.getCell('C15')
                const C16 = worksheet.getCell('C16')
                const C17 = worksheet.getCell('C17')
                const C18 = worksheet.getCell('C18')


                A8.font = { family: 4, bold: true }
                A9.font = { family: 4, bold: true }
                A10.font = { family: 4, bold: true }
                A11.font = { family: 4, bold: true }

                B8.font = { family: 4, bold: true }
                B9.font = { family: 4, bold: true }
                B10.font = { family: 4, bold: true }
                B11.font = { family: 4, bold: true }
                B14.font = { family: 4, bold: true }
                B15.font = { family: 4, bold: true }
                B16.font = { family: 4, bold: true }
                B17.font = { family: 4, bold: true }
                B18.font = { family: 4, bold: true }

                B8.alignment = { vertical: 'middle', horizontal: 'center' };
                B9.alignment = { vertical: 'middle', horizontal: 'center' };
                B10.alignment = { vertical: 'middle', horizontal: 'center' };
                B11.alignment = { vertical: 'middle', horizontal: 'center' };
                C14.alignment = { vertical: 'middle', horizontal: 'center' };
                C15.alignment = { vertical: 'middle', horizontal: 'center' };
                C16.alignment = { vertical: 'middle', horizontal: 'center' };
                C17.alignment = { vertical: 'middle', horizontal: 'center' };
                C18.alignment = { vertical: 'middle', horizontal: 'center' };



                C14.font = { family: 4, bold: true }
                C15.font = { family: 4, bold: true }
                C16.font = { family: 4, bold: true }
                C18.font = { family: 4, bold: true }
                C18.font = { family: 4, bold: true }


                A8.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };


                A9.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };

                A10.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };
                A11.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };

                B8.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };
                B9.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };
                B10.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };
                B11.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };




                A8.value = 'Total Number of Vehicle'
                A9.value = 'Number of vehicle communicating'
                A10.value = 'Number of vehicle used'
                A11.value = 'percentage of vehicle used'

                B8.value = data['Total Number of Vehicle'] ? data['Total Number of Vehicle'] : 0
                B9.value = data['Number of vehicle communicating'] ? data['Number of vehicle communicating'] : 0
                B10.value = data['Number of vehicle used'] ? data['Number of vehicle used'] : 0
                B11.value = data['percentage of vehicle used'] ? data['percentage of vehicle used'] : 0

                //Second Array
                worksheet.mergeCells('A14', 'A16');
                worksheet.mergeCells('A17', 'A18');


                A14.alignment = { vertical: 'middle', horizontal: 'center' };
                A14.font = { bold: true };
                A14.value = 'Total Km driven'

                A17.alignment = { vertical: 'middle', horizontal: 'center' };
                A17.font = { bold: true };
                A17.value = 'Safety'


                A14.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };

                A17.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };


                B14.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };
                B15.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };
                B16.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };
                B17.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };
                B18.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };



                C14.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };
                C15.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };
                C16.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };
                C17.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };
                C18.border = {
                    top: { style: 'medium', color: { argb: '000000' } },
                    left: { style: 'medium', color: { argb: '000000' } },
                    bottom: { style: 'medium', color: { argb: '000000' } },
                    right: { style: 'medium', color: { argb: '000000' } }
                };


                B14.value = 'Number of vehicles  used'
                B15.value = 'Total Km driven (Km)'
                B16.value = 'Average km driven per vehicle (Km)'
                B17.value = 'Number of vehicles in speeding'
                B18.value = 'max Speed'

                C14.value = data['Number of vehicle used'] ? data['Number of vehicle used'] : 0
                C15.value = data['Total Km driven (Km)'] ? data['Total Km driven (Km)'] : 0
                C16.value = data['Average km driven per vehicle (Km)'] ? data['Average km driven per vehicle (Km)'] : 0
                C17.value = data['Number of vehicles in speeding'] ? data['Number of vehicles in speeding'] : 0
                C18.value = data['max Speed'] ? data['max Speed'] : 0



                return workbook.xlsx.writeFile(path, { type: 'buffer', bookType: 'xlsx' })
                    .then(response => {
                        console.log("file is written");
                    })
                    .catch(err => {
                        console.log(err);
                    });

            });
    }
}


async function perencoXlsx(data, sheet, path, excelColum, colorSheet) {

    const dataHeader = []

    const isExistPath = fs.existsSync(path);

    let workbook = new XLSX.Workbook();

    const logo1 = workbook.addImage({
        buffer: fs.readFileSync('rapport/Perenco/assets/tractafric.png'),
        extension: 'png',
    });

    const logo2 = workbook.addImage({
        buffer: fs.readFileSync('rapport/Perenco/assets/perenco.png'),
        extension: 'png',
    });

    if (excelColum) {
        excelColum.map(item => {
            dataHeader.push(item.key);
        })
    }

    if (dataHeader.length > 0) {
        if (isExistPath) {
            setTimeout(async () => {
                console.log(`Generating file ${sheet} ...`);
                const readFile = await workbook.xlsx.readFile(path);
                if (readFile) {
                    const existWorkSheet = workbook.getWorksheet(sheet);
                    if (existWorkSheet) {
                        const existWorkSheetName=existWorkSheet.name;
                         if(existWorkSheetName===sheet){
                            await addDataTosheet(existWorkSheet,data, excelColum);
                            asignStyleToSheet(existWorkSheet);
                            await asignStyleToPerencoInfraction(existWorkSheet);  
                         } 
                    } else {
                        const worksheet = workbook.addWorksheet(sheet, { properties: { tabColor: { argb: colorSheet } } });

                        await prepareSheet(worksheet, data, dataHeader, excelColum);

                        //Center image header banner depending on number of columns
                        await perencoHeaderSheet(worksheet, dataHeader, sheet, logo1, logo2);

                        await asignStyleToPerencoInfraction(worksheet);
                    }
 
                    // Export excel generated file
                    workbook.xlsx.writeFile(path, { type: 'buffer', bookType: 'xlsx' })
                        .then(response => {
                            console.log("file generated");
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    
                 
                }
            }, 15000)

        } else {
            console.log(`Generating file ${sheet} ...`);

            // creation of new sheet
            const worksheet = workbook.addWorksheet(sheet, { properties: { tabColor: { argb: colorSheet } } });

            await prepareSheet(worksheet, data, dataHeader, excelColum);

             //Center image header banner depending on number of columns
            await perencoHeaderSheet(worksheet, dataHeader, sheet, logo1, logo2);

            await asignStyleToPerencoInfraction(worksheet);

            // Export excel generated file
            workbook.xlsx.writeFile(path, { type: 'buffer', bookType: 'xlsx' })
                .then(response => {
                    console.log("file generated");
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}


async function generateSyntheseSheetPerenco(path,data, sheet) {

    const isExistPath = fs.existsSync(path);

    let workbook = new XLSX.Workbook();

    const logo1 = workbook.addImage({
        buffer: fs.readFileSync('rapport/Perenco/assets/tractafric.png'),
        extension: 'png',
    });

    const logo2 = workbook.addImage({
        buffer: fs.readFileSync('rapport/Perenco/assets/perenco.png'),
        extension: 'png',
    });

    const thirdHeader = ['Imatriculations', 'Affectations', 'Utilisateurs', 'Distance', 'Duration', 'Harsh Acceleration','Several Acceleration', 'Harsh Turn','Several Turn', 'Harsh Brake','Several Brake', '22H24H', '24H04H', 'Distances', 'Durations', 'Severe-Ville', 'Legere-Ville', 'Severe-HorsVille', 'Legere-HorsVille', 'Severe-Nat3', 'Legere-Nat3'];


    if (isExistPath) {
        setTimeout(async () => {
            console.log(`Generating file ${sheet} ...`);
            const readFile = await workbook.xlsx.readFile(path);
            if (readFile) {
                const existWorkSheet = workbook.getWorksheet(sheet);
                if (existWorkSheet) {
                    const existWorkSheetName=existWorkSheet.name;
                     if(existWorkSheetName===sheet){
                        
                         //Add data to rows
                         data.map(item => {
                            existWorkSheet.addRow(item).commit()
                         })

                    } 
                } else {
                        // creation of new sheet
                    const worksheet = workbook.addWorksheet(sheet);
                    
                    worksheet.views = [{ showGridLines: false }];


                    const syntheseCol = thirdHeader.map(item => {
                        return { key: item }
                    })

                    prepareSheetForSynthese(worksheet, thirdHeader, syntheseCol, data);

                    assignStylePrencoSynthese(worksheet);

                    //Center image header banner depending on number of columns
                    perencoHeaderSheet(worksheet, thirdHeader, sheet, logo1, logo2);
                }
                // Export excel generated file
                workbook.xlsx.writeFile(path, { type: 'buffer', bookType: 'xlsx' })
                    .then(response => {
                        console.log("file generated");
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        }, 15000)

    }

}



async function guinnessXlsx(data, sheet, path, excelColum) {

    const dataHeader = []

    const isExistPath = fs.existsSync(path);

    let workbook = new XLSX.Workbook();

    const logo1 = workbook.addImage({
        buffer: fs.readFileSync('rapport/Guinness/assets/guinness.png'),
        extension: 'png',
    });

    const logo2 = workbook.addImage({
        buffer: fs.readFileSync('rapport/Guinness/assets/camtrack.png'),
        extension: 'png',
    });

    if (excelColum) {
        excelColum.map(item => {
            dataHeader.push(item.key);
        })
    }

    if (dataHeader.length > 0) {
        if (isExistPath) {
            setTimeout(async () => {
                console.log(`Generating file ${sheet} ...`);
                const readFile = await workbook.xlsx.readFile(path);
                if (readFile) {
                    const existWorkSheet = workbook.getWorksheet(sheet);
                    if (existWorkSheet) {
                        const existWorkSheetName=existWorkSheet.name;
                         if(existWorkSheetName===sheet){
                            await addDataTosheet(existWorkSheet,data, excelColum);
                            asignStyleToSheet(existWorkSheet);
                         } 
                    } else {
                        const worksheet = workbook.addWorksheet(sheet);

                        await prepareSheet(worksheet, data, dataHeader, excelColum);

                        //Center image header banner depending on number of columns
                        await guinnessHeaderSheet(worksheet, dataHeader, sheet, logo1, logo2);

                    }
 
                    // Export excel generated file
                    workbook.xlsx.writeFile(path, { type: 'buffer', bookType: 'xlsx' })
                        .then(response => {
                            console.log("file generated");
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    
                 
                }
            }, 15000)

        } else {
            console.log(`Generating file ${sheet} ...`);

            // creation of new sheet
            const worksheet = workbook.addWorksheet(sheet);

            await prepareSheet(worksheet, data, dataHeader, excelColum);

             //Center image header banner depending on number of columns
            await guinnessHeaderSheet(worksheet, dataHeader, sheet, logo1, logo2);

            // Export excel generated file
            workbook.xlsx.writeFile(path, { type: 'buffer', bookType: 'xlsx' })
                .then(response => {
                    console.log("file generated");
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}










module.exports = { convertJsonToExcel, generateSyntheseSheetAddax, perencoXlsx,generateSyntheseSheetPerenco,guinnessXlsx}