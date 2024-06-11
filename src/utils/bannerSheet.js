const { getTitleHeaderSheet,getTitleHeaderSheetPerenco } = require('./getTitleHeaderSheet');

const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];


function addLogos(worksheet, headerColArr, logo1, logo2) {
    const arrLength = headerColArr.length;
    const lastImgPosition = arrLength-1;
    worksheet.addImage(logo1, { tl: { col: 0, row: 0 }, ext: { width: 100, height: 100 }, editAs: 'oneCell' });
    worksheet.addImage(logo2, { tl: { col: lastImgPosition, row: 0 }, ext: { width: 100, height: 100 }, editAs: 'oneCell' });

    return arrLength
}


function addImageBannerHeaderSheet(worksheet, headerColArr, sheet, banner, logo1, logo2) {
    const addLogo = addLogos(worksheet, headerColArr, logo1, logo2);
    const imageCell = `${cols[0]}1:${cols[addLogo - 1]}6`;
    const titleHeader = [`${cols[0]}7`, `${cols[addLogo - 1]}7`];

    worksheet.addImage(banner, imageCell);

    worksheet.mergeCells(titleHeader[0], titleHeader[1]);

    const titleCell =worksheet.getCell(titleHeader[0]);

    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.font = { name: 'calibri', size: 15, bold: true };
    titleCell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } }
    };
    titleCell.value = getTitleHeaderSheet(sheet);
}



function perencoHeaderSheet(worksheet, headerColArr, sheet, logo1, logo2) {
    
    
    const addLogo = addLogos(worksheet, headerColArr, logo1, logo2);

    const title = [`${cols[1]}1`,`${cols[1]}2`,`${cols[1]}3`,`${cols[1]}4`,`${cols[addLogo-3]}1`,`${cols[addLogo-3]}2` ,`${cols[addLogo-3]}3`,`${cols[addLogo-3]}4`];

    worksheet.mergeCells(title[1],title[7]);
   

    const titleCell = worksheet.getCell(title[1]);


    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: "5c9bd5" }
    }

    titleCell.font = { color: { argb: "FFFFFF" }, bold: true, name: 'calibri', size: 15};

    titleCell.value = getTitleHeaderSheetPerenco(sheet);
}


module.exports = { addImageBannerHeaderSheet,perencoHeaderSheet }