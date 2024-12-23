const {
  assignStyleToHeadersSynthese,
  assignStyleToHeaders,
  asignStyleToSheet,
  assignStyleToHeadersSyntheseRazel,
  assignStyleToHeadersRazel,
  assignStyleToKPCDHeaders,
  assignStyleToHeadersCimencam,
} = require('./assignStylesProps');
const { autoSizeColumnSheet } = require('../utils/autoSizeColumnSheet');
const { addAutoFilter } = require('./addAutofilter');

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

async function addDataTosheet(worksheet, data, excelColum) {
  worksheet.columns = excelColum;
  data.map((item) => {
    worksheet.addRow(item).commit();
  });
  //autosize column width base on the content
  autoSizeColumnSheet(worksheet);
}

async function prepareSheet(worksheet, data, dataHeader, excelColum) {
  const autoFilter = addAutoFilter(dataHeader, 8);

  worksheet.views = [{ showGridLines: false }];

  worksheet.getRow(8).values = dataHeader;

  worksheet.autoFilter = autoFilter;

  //Add data to rows
  addDataTosheet(worksheet, data, excelColum);

  // Process each row for beautification
  assignStyleToHeaders(worksheet);

  //autosize column width base on the content
  autoSizeColumnSheet(worksheet);
}

async function prepareSheetKPDC(worksheet, data, dataHeader, excelColum) {
  const autoFilter = addAutoFilter(dataHeader, 2);

  worksheet.views = [{ showGridLines: false }];

  worksheet.getRow(2).values = dataHeader;

  worksheet.autoFilter = autoFilter;

  //Add data to rows
  addDataTosheet(worksheet, data, excelColum);

  // Process each row for beautification
  assignStyleToKPCDHeaders(worksheet);

  //autosize column width base on the content
  autoSizeColumnSheet(worksheet);
}

async function prepareSheetCimencam(
  worksheet,
  data,
  dataHeader,
  excelColum,
  date
) {
  const autoFilter = addAutoFilter(dataHeader, 9);

  worksheet.views = [{ showGridLines: false }];

  worksheet.getRow(9).values = dataHeader;

  worksheet.autoFilter = autoFilter;

  //Add data to rows
  addDataTosheet(worksheet, data, excelColum);

  // Process each row for beautification
  assignStyleToHeadersCimencam(worksheet, date);

  //autosize column width base on the content
  autoSizeColumnSheet(worksheet);
}

function prepareSheetForSynthese(worksheet, dataHeader, syntheseCol, data) {
  worksheet.views = [{ showGridLines: false }];
  row10 = worksheet.getRow(10);
  row10.values = dataHeader;

  worksheet.mergeCells('D8', 'E9');
  const vehicleUtiliation = worksheet.getCell('D8');
  vehicleUtiliation.value = 'Vehicle Usage';
  vehicleUtiliation.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'afbacc' },
  };

  worksheet.mergeCells('F8', 'K8');
  const exceptions = worksheet.getCell('F8');
  exceptions.value = 'Exceptions';

  worksheet.mergeCells('L8', 'M9');
  const nightDriving = worksheet.getCell('L8');
  nightDriving.value = 'Night Driving';

  worksheet.mergeCells('N8', 'O9');
  const ProhibitWorkingDay = worksheet.getCell('N8');
  ProhibitWorkingDay.value = 'Prohibit Working Day';

  worksheet.mergeCells('P8', 'U8');
  const speeding = worksheet.getCell('P8');
  speeding.value = 'Speedings';

  worksheet.mergeCells('P9', 'Q9');
  const ville = worksheet.getCell('P9');
  ville.value = 'Ville';
  ville.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'ffffff' },
  };

  worksheet.mergeCells('R9', 'S9');
  const horsVille = worksheet.getCell('R9');
  horsVille.value = 'Hors Ville';
  horsVille.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'ffffff' },
  };

  worksheet.mergeCells('T9', 'U9');
  const nat3 = worksheet.getCell('T9');
  nat3.value = 'Nat3';
  nat3.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'ffffff' },
  };

  worksheet.mergeCells('F9', 'G9');
  const Acceleration = worksheet.getCell('F9');
  Acceleration.value = 'Acceleration';
  Acceleration.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '023E8A' },
  };
  Acceleration.font = { color: { argb: 'ffffff' }, bold: true };

  worksheet.mergeCells('H9', 'I9');
  const turn = worksheet.getCell('H9');
  turn.value = 'Turn';
  turn.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '023E8A' },
  };
  turn.font = { color: { argb: 'ffffff' }, bold: true };

  worksheet.mergeCells('J9', 'K9');
  const brake = worksheet.getCell('J9');
  brake.value = 'Brake';
  brake.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '023E8A' },
  };
  brake.font = { color: { argb: 'ffffff' }, bold: true };

  worksheet.columns = syntheseCol;

  //Add data to rows
  data.map((item) => {
    worksheet.addRow(item).commit();
  });

  //autosize column width base on the content
  autoSizeColumnSheet(worksheet);

  // Process each row for beautification
  assignStyleToHeadersSynthese(worksheet);

  row10.height = 110;
}

async function prepareSheetRazel(worksheet, data, dataHeader, excelColum) {
  const numberOfColunm = excelColum.length;
  //style worksheet
  const autoFilter = addAutoFilter(dataHeader, 9);

  worksheet.views = [{ showGridLines: false }];

  worksheet.getRow(9).values = dataHeader;

  worksheet.autoFilter = autoFilter;

  //Add data to rows
  addDataTosheet(worksheet, data, excelColum);

  // Process each row for beautification
  assignStyleToHeadersRazel(worksheet, numberOfColunm);
}

async function prepareSheetRazelExcessVitesse(
  worksheet,
  data,
  dataHeader,
  excelColum,
  GroupMarkerTitle //Hors agromeration ou agromeration
) {
  //style worksheet
  const autoFilter = addAutoFilter(dataHeader, 9);

  worksheet.views = [{ showGridLines: false }];

  worksheet.getRow(9).values = dataHeader;

  worksheet.autoFilter = autoFilter;

  //set titleGroupMarker row and cell
  const arrLength = dataHeader.length;
  const titleGroupMarker = [`${cols[0]}10`, `${cols[arrLength - 1]}11`];
  const titleGroupMarkerCell = worksheet.getCell(titleGroupMarker[0]);

  const titleGroupMarkerCellValue = titleGroupMarkerCell.value;

  if (titleGroupMarkerCellValue == '') {
    worksheet.mergeCells(titleGroupMarker[0], titleGroupMarker[1]);

    titleGroupMarkerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D3D3D3' },
    };

    titleGroupMarkerCell.height = titleGroupMarkerCell.value = GroupMarkerTitle;

    //Add data to rows
    addDataTosheet(worksheet, data, excelColum);
  }

  //add second marker at the botton of the sheet
  else {
    //search and merge last rows sheet and asign style
    const rows = worksheet.getColumn(1);
    const rowsCount = rows['_worksheet']['_rows'].length;
    const lastCell = `A${rowsCount + 1}`;

    const titleGroupMarker = [
      `${lastCell}`,
      `${cols[arrLength - 1]}${rowsCount + 2}`,
    ];
    worksheet.mergeCells(titleGroupMarker[0], titleGroupMarker[1]);
    const titleGroupMarkerCell = worksheet.getCell(titleGroupMarker[0]);

    titleGroupMarkerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D3D3D3' },
    };

    titleGroupMarkerCell.height = titleGroupMarkerCell.value = GroupMarkerTitle;

    //Add data to rows
    addDataTosheet(worksheet, data, excelColum);
  }

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      };
      if (rowNumber !== 7 && rowNumber !== 7 && rowNumber !== 8) {
        cell.font = { bold: false, size: 9 };
      }
      if (rowNumber === 9) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '023E8A' },
        };
        cell.font = { color: { argb: 'FFFFFF' }, bold: true, size: 10 };
      }
    });
  });
}

function prepareSheetRazelForSynthese(
  worksheet,
  dataHeader,
  syntheseCol,
  data
) {
  worksheet.views = [{ showGridLines: false }];
  row12 = worksheet.getRow(12);
  row12.values = dataHeader;

  //legendes
  const legende = `LEGENDE 
                  heure moteur : Heure pendant la quelle le moteur du véhicule a été en marche  
                  En mouvement: Heure pendant la quelle le véhicule a été en mouvement
                  Ralenti Moteur: Heure pendant la quelle le véhicule a été en arrêt 
                `;
  worksheet.mergeCells('A1', 'B6');
  const legendCel = worksheet.getCell('A1');
  legendCel.value = legende;
  legendCel.font = { color: { argb: '00FF00' }, bold: true };
  legendCel.alignment = {
    vertical: 'center',
    horizontal: 'left',
    wrapText: true,
  };

  //Vehicules
  worksheet.mergeCells('A11', 'A12');
  const vehicle = worksheet.getCell('A11');
  vehicle.value = 'Véhicules';

  vehicle.font = {
    name: 'calibri',
    size: 8,
    bold: true,
  };

  //Utilisation vehicule
  worksheet.mergeCells('B11', 'E11');
  const vehicleUtiliation = worksheet.getCell('B11');
  vehicleUtiliation.value = 'Utilisation Véhicule';

  vehicleUtiliation.font = {
    name: 'calibri',
    size: 14,
    bold: true,
  };

  //EXCES DE vitesse
  worksheet.mergeCells('F11', 'G11');
  const ExcesVitesse = worksheet.getCell('F11');
  ExcesVitesse.value = 'Exess de vitesse';

  ExcesVitesse.font = {
    name: 'calibri',
    size: 14,
    bold: true,
  };

  //infractions (eco driving)
  worksheet.mergeCells('H11', 'J11');
  const infraction = worksheet.getCell('H11');
  infraction.value = 'éco driving';

  infraction.font = {
    name: 'calibri',
    size: 14,
    bold: true,
  };

  //Ralenti moteur
  worksheet.mergeCells('K11', 'L11');
  const ralentiMoteur = worksheet.getCell('K11');
  ralentiMoteur.value = 'Ralenti Moteur';

  ralentiMoteur.font = {
    name: 'calibri',
    size: 14,
    bold: true,
  };

  //conduite de weekend
  worksheet.mergeCells('M11', 'N11');
  const conduiteWeekend = worksheet.getCell('M11');
  conduiteWeekend.value = 'Conduite de Weekend';

  conduiteWeekend.font = {
    name: 'calibri',
    size: 14,
    bold: true,
  };

  //conduite de nuit
  worksheet.mergeCells('O11', 'P11');
  const conduiteNuit = worksheet.getCell('O11');
  conduiteNuit.value = 'Conduite de Nuit';

  conduiteNuit.font = {
    name: 'calibri',
    size: 14,
    bold: true,
  };

  //Productivité
  worksheet.mergeCells('Q11', 'R11');
  const productivité = worksheet.getCell('R11');
  productivité.value = 'Productivité';

  productivité.font = {
    name: 'calibri',
    size: 14,
    bold: true,
  };

  worksheet.columns = syntheseCol;

  //Add data to rows
  data.map((item) => {
    worksheet.addRow(item).commit();
  });

  //autosize column width base on the content
  autoSizeColumnSheet(worksheet);

  // Process each row for beautification
  assignStyleToHeadersSyntheseRazel(worksheet);
}

module.exports = {
  prepareSheet,
  prepareSheetForSynthese,
  addDataTosheet,
  prepareSheetCimencam,
  prepareSheetKPDC,
  prepareSheetRazel,
  prepareSheetRazelExcessVitesse,
  prepareSheetRazelForSynthese,
};
