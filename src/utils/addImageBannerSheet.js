const { getTitleHeaderSheet } = require('../utils/getTitleHeaderSheet');


function addImageBannerHeaderSheet(worksheet, headerColArr, sheet,banner,logo1,logo2) {
    const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T']
    const arrLength = headerColArr.length;

    const imageCell =`${cols[0]}1:${cols[arrLength-1]}6`
    const titleHeader = [`${cols[0]}7`, `${cols[arrLength-1]}7`]
    
    worksheet.addImage(banner, imageCell);

    worksheet.addImage(logo1, { tl: { col: 0}, ext: { width: 100, height: 100}});

   
    worksheet.mergeCells(titleHeader[0], titleHeader[1]);
    worksheet.getCell(titleHeader[0]).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell(titleHeader[0]).font = { name: 'calibri', size: 15, bold: true };
    worksheet.getCell(titleHeader[0]).border = {
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } }
    };

    worksheet.getCell(titleHeader[0]).value = getTitleHeaderSheet(sheet);

    worksheet.addImage(logo2, { tl: { col: arrLength-1}, ext: { width: 100, height: 100}});

}

module.exports={addImageBannerHeaderSheet}