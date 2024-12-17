const {
  getTitleHeaderSheet,
  getTitleHeaderSheetPerenco,
  getTitleHeaderSheetGuinness,
} = require('./getTitleHeaderSheet');

const cols = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
];

function addLogos(worksheet, headerColArr, logo1, logo2) {
  const arrLength = headerColArr.length;
  const lastImgPosition = arrLength - 1;

  worksheet.addImage(logo1, {
    tl: { col: 0.999999999999, row: 0 },
    ext: { width: 100, height: 100 },
    editAs: 'oneCell',
  });
  worksheet.addImage(logo2, {
    tl: { col: lastImgPosition + 0.999999999999, row: 0 },
    ext: { width: 100, height: 100 },
    editAs: 'oneCell',
  });

  return arrLength;
}

function addImageBannerHeaderSheet(
  worksheet,
  headerColArr,
  sheet,
  banner,
  logo1,
  logo2
) {
  const addLogo = addLogos(worksheet, headerColArr, logo1, logo2);
  const imageCell = `${cols[0]}1:${cols[addLogo - 1]}6`;
  const titleHeader = [`${cols[0]}7`, `${cols[addLogo - 1]}7`];

  worksheet.addImage(banner, imageCell);

  worksheet.mergeCells(titleHeader[0], titleHeader[1]);

  const titleCell = worksheet.getCell(titleHeader[0]);

  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.font = { name: 'calibri', size: 15, bold: true };
  titleCell.border = {
    top: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
  };
  titleCell.value = getTitleHeaderSheet(sheet);
}

async function perencoHeaderSheet(
  worksheet,
  headerColArr,
  sheet,
  logo1,
  logo2
) {
  const addLogo = addLogos(worksheet, headerColArr, logo1, logo2);

  const title = [
    `${cols[1]}1`,
    `${cols[1]}2`,
    `${cols[1]}3`,
    `${cols[1]}4`,
    `${cols[addLogo - 3]}1`,
    `${cols[addLogo - 3]}2`,
    `${cols[addLogo - 3]}3`,
    `${cols[addLogo - 3]}4`,
  ];

  worksheet.mergeCells(title[1], title[7]);

  const titleCell = worksheet.getCell(title[1]);

  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '5c9bd5' },
  };

  titleCell.font = {
    color: { argb: 'FFFFFF' },
    bold: true,
    name: 'calibri',
    size: 15,
  };

  titleCell.value = getTitleHeaderSheetPerenco(sheet);
}

async function guinnessHeaderSheet(
  worksheet,
  headerColArr,
  sheet,
  logo1,
  logo2
) {
  const addLogo = addLogos(worksheet, headerColArr, logo1, logo2);

  const title = [
    `${cols[0]}1`,
    `${cols[1]}2`,
    `${cols[1]}3`,
    `${cols[1]}4`,
    `${cols[addLogo - 3]}1`,
    `${cols[addLogo - 3]}2`,
    `${cols[addLogo - 3]}3`,
    `${cols[addLogo - 1]}5`,
  ];

  worksheet.mergeCells(title[0], title[7]);

  const titleCell = worksheet.getCell(title[0]);

  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '00000' },
  };

  titleCell.font = {
    color: { argb: 'FFFFFF' },
    bold: true,
    name: 'calibri',
    size: 25,
  };

  titleCell.value = getTitleHeaderSheetGuinness(sheet);
}

async function cimencamHeaderSheet(worksheet, headerColArr, date, banner) {
  const arrLength = headerColArr.length;
  const imageCell = `${cols[0]}1:${cols[arrLength - 1]}6`;
  const titleHeader = [`${cols[0]}7`, `${cols[arrLength - 1]}7`];
  const dateHeader = [`${cols[0]}8`, `${cols[arrLength - 1]}8`];

  worksheet.addImage(banner, imageCell);

  worksheet.mergeCells(titleHeader[0], titleHeader[1]);

  worksheet.mergeCells(dateHeader[0], dateHeader[1]);

  const dateCell = worksheet.getCell(dateHeader[0]);

  const titleCell = worksheet.getCell(titleHeader[0]);

  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.font = {
    name: 'calibri',
    size: 15,
    bold: true,
    color: { argb: 'FFFFFF' },
  };
  titleCell.border = {
    top: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
  };

  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0000' },
  };

  titleCell.height = titleCell.value =
    'Rapport Geofence ENTREE / SORTIE : CIMENCAM';

  dateCell.alignment = { vertical: 'left', horizontal: 'center' };
  dateCell.font = {
    name: 'calibri',
    size: 12,
    bold: true,
    color: { argb: '008000' },
  };
  dateCell.border = {
    top: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '808080' } },
    right: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
  };

  dateCell.value = `Jour d'Activité:${date}`;
}

async function KPDCHeaderSheet(worksheet, headerColArr, sheet) {
  const addLogo = addLogos(worksheet, headerColArr, logo1, logo2);

  const title = [
    `${cols[0]}1`,
    `${cols[1]}2`,
    `${cols[1]}3`,
    `${cols[1]}4`,
    `${cols[addLogo - 3]}1`,
    `${cols[addLogo - 3]}2`,
    `${cols[addLogo - 3]}3`,
    `${cols[addLogo - 1]}5`,
  ];

  worksheet.mergeCells(title[0], title[7]);

  const titleCell = worksheet.getCell(title[0]);

  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '00000' },
  };

  titleCell.font = {
    color: { argb: 'FFFFFF' },
    bold: true,
    name: 'calibri',
    size: 25,
  };

  titleCell.value = getTitleHeaderSheetGuinness(sheet);
}

async function razelHeaderSheet(worksheet, headerColArr, banner, title) {
  const arrLength = headerColArr.length;
  const imageCell = `${cols[0]}1:${cols[arrLength - 1]}6`;
  const titleHeader = [`${cols[0]}7`, `${cols[arrLength - 1]}8`];

  worksheet.addImage(banner, imageCell);
  worksheet.mergeCells(titleHeader[0], titleHeader[1]);

  const titleCell = worksheet.getCell(titleHeader[0]);

  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.font = {
    name: 'calibri',
    size: 15,
    bold: true,
    color: { argb: 'FFFFFF' },
  };
  titleCell.border = {
    top: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
  };

  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '582900' },
  };

  titleCell.height = titleCell.value = title;
}

async function razelHeaderSheetSynthese(
  worksheet,
  headerColArr,
  banner,
  title
) {
  const arrLength = headerColArr.length;
  const imageCell = `${cols[3]}1:${cols[arrLength - 5]}6`;
  const titleHeader = [`${cols[0]}7`, `${cols[arrLength - 1]}8`];

  worksheet.addImage(banner, imageCell);
  worksheet.mergeCells(titleHeader[0], titleHeader[1]);

  const titleCell = worksheet.getCell(titleHeader[0]);

  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.font = {
    name: 'calibri',
    size: 15,
    bold: true,
    color: { argb: 'FFFFFF' },
  };
  titleCell.border = {
    top: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
  };

  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '582900' },
  };

  titleCell.height = titleCell.value = title;
}

module.exports = {
  addImageBannerHeaderSheet,
  perencoHeaderSheet,
  guinnessHeaderSheet,
  cimencamHeaderSheet,
  razelHeaderSheet,
  KPDCHeaderSheet,
  razelHeaderSheetSynthese,
};
