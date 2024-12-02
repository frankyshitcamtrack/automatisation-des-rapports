const {
  assignStyleToHeadersSynthese,
  assignStyleToHeaders,
  asignStyleToSheet,
  assignStyleToKPCDHeaders,
  assignStyleToHeadersCimencam,
} = require('./assignStylesProps');
const { autoSizeColumnSheet } = require('../utils/autoSizeColumnSheet');
const { addAutoFilter } = require('./addAutofilter');

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

module.exports = {
  prepareSheet,
  prepareSheetForSynthese,
  addDataTosheet,
  prepareSheetCimencam,
  prepareSheetKPDC,
};
