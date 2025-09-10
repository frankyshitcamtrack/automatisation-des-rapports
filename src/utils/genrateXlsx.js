const fs = require('fs');
const _ = require('lodash');
const XLSX = require('exceljs');
const { autoSizeColumnSheet } = require('../utils/autoSizeColumnSheet');
const {
  addImageBannerHeaderSheet,
  perencoHeaderSheet,
  guinnessHeaderSheet,
  cimencamHeaderSheet,
  razelHeaderSheet,
  DKTHeaderSheet,
  razelHeaderSheetSynthese,
} = require('./bannerSheet');
const {
  asignStyleToPerencoInfraction,
  assignStylePrencoSynthese,
  asignStyleToSheet,
  assignStyleToKPCDHeaders,
  assignStyleToHeadersSyntheseRazel,
  asignStyleorksheetGlobal
} = require('./assignStylesProps');
const {
  prepareSheet,
  prepareSheetForSynthese,
  addDataTosheet,
  prepareSheetCimencam,
  prepareSheetKPDC,
  prepareSheetRazel,
  prepareSheetRazelExcessVitesse,
  prepareSheetRazelForSynthese,
  prepareSheetDKT,
  prepareSheetDKTForSynthese,
} = require('./prepareSheet');
const { addRowExistSheet } = require('./addRowExistSheet');
const {
  createChart,
  createChartKPDC,
  createChartDureeKPDC,
} = require('./generateChart.js');
const { calculateTime } = require('../utils/sommeArrTimes');
const { Title } = require('chart.js');

async function convertJsonToExcel(data, sheet, path, excelColum, colorSheet) {
  const dataHeader = [];

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
    excelColum.map((item) => {
      dataHeader.push(item.key);
    });
  }

  if (dataHeader.length > 0) {
    if (isExistPath) {
      setTimeout(async () => {
        console.log(`Generating file ${sheet} ...`);
        const readFile = await workbook.xlsx.readFile(path);
        if (readFile) {
          const existWorkSheet = workbook.getWorksheet(sheet);
          if (existWorkSheet) {
            const existWorkSheetName = existWorkSheet.name;
            if (existWorkSheetName === sheet) {
              addRowExistSheet(existWorkSheet, data);
            }
          } else {
            const worksheet = workbook.addWorksheet(sheet, {
              properties: { tabColor: { argb: colorSheet } },
            });

            prepareSheet(worksheet, data, dataHeader, excelColum);

            //Center image header banner depending on number of columns
            addImageBannerHeaderSheet(
              worksheet,
              dataHeader,
              sheet,
              imageId2,
              logo1,
              logo2
            );
          }


          // Export excel generated file
          workbook.xlsx
            .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
            .then((response) => {
              console.log('file generated');
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }, 15000);
    } else {
      console.log(`Generating file ${sheet} ...`);

      // creation of new sheet
      const worksheet = workbook.addWorksheet(sheet, {
        properties: { tabColor: { argb: colorSheet } },
      });

      prepareSheet(worksheet, data, dataHeader, excelColum);

      //Center image header banner depending on number of columns
      addImageBannerHeaderSheet(
        worksheet,
        dataHeader,
        sheet,
        imageId2,
        logo1,
        logo2
      );


      // Export excel generated file
      workbook.xlsx
        .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
        .then((response) => {
          console.log('file generated');
        })
        .catch((err) => {
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
    workbook.xlsx.readFile(path).then(() => {
      const worksheet = workbook.addWorksheet(sheet);

      worksheet.views = [{ showGridLines: false }];

      worksheet.addImage(imageId2, 'A1:D5');

      worksheet.addImage(logo1, {
        tl: { col: 0, row: 0 },
        ext: { width: 100, height: 100 },
        editAs: 'oneCell',
      });

      worksheet.addImage(logo2, {
        tl: { col: 2, row: 0 },
        ext: { width: 100, height: 100 },
        editAs: 'oneCell',
      });

      worksheet.mergeCells('A5', 'D5');
      worksheet.getCell('A5').alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      worksheet.getCell('A5').font = { name: 'Arial', size: 12, bold: true };
      worksheet.getCell('A5').border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };
      worksheet.getCell('A5').value = sheet;

      worksheet.getColumn(1).width = 70;
      worksheet.getColumn(2).width = 60;

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

      const C14 = worksheet.getCell('C14');
      const C15 = worksheet.getCell('C15');
      const C16 = worksheet.getCell('C16');
      const C17 = worksheet.getCell('C17');
      const C18 = worksheet.getCell('C18');

      A8.font = { family: 4, bold: true };
      A9.font = { family: 4, bold: true };
      A10.font = { family: 4, bold: true };
      A11.font = { family: 4, bold: true };

      B8.font = { family: 4, bold: true };
      B9.font = { family: 4, bold: true };
      B10.font = { family: 4, bold: true };
      B11.font = { family: 4, bold: true };
      B14.font = { family: 4, bold: true };
      B15.font = { family: 4, bold: true };
      B16.font = { family: 4, bold: true };
      B17.font = { family: 4, bold: true };
      B18.font = { family: 4, bold: true };

      B8.alignment = { vertical: 'middle', horizontal: 'center' };
      B9.alignment = { vertical: 'middle', horizontal: 'center' };
      B10.alignment = { vertical: 'middle', horizontal: 'center' };
      B11.alignment = { vertical: 'middle', horizontal: 'center' };
      C14.alignment = { vertical: 'middle', horizontal: 'center' };
      C15.alignment = { vertical: 'middle', horizontal: 'center' };
      C16.alignment = { vertical: 'middle', horizontal: 'center' };
      C17.alignment = { vertical: 'middle', horizontal: 'center' };
      C18.alignment = { vertical: 'middle', horizontal: 'center' };

      C14.font = { family: 4, bold: true };
      C15.font = { family: 4, bold: true };
      C16.font = { family: 4, bold: true };
      C18.font = { family: 4, bold: true };
      C18.font = { family: 4, bold: true };

      A8.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };

      A9.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };

      A10.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };
      A11.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };

      B8.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };
      B9.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };
      B10.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };
      B11.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };

      A8.value = 'Total Number of Vehicle';
      A9.value = 'Number of vehicle communicating';
      A10.value = 'Number of vehicle used';
      A11.value = 'percentage of vehicle used';

      B8.value = data['Total Number of Vehicle']
        ? data['Total Number of Vehicle']
        : 0;
      B9.value = data['Number of vehicle communicating']
        ? data['Number of vehicle communicating']
        : 0;
      B10.value = data['Number of vehicle used']
        ? data['Number of vehicle used']
        : 0;
      B11.value = data['percentage of vehicle used']
        ? data['percentage of vehicle used']
        : 0;

      //Second Array
      worksheet.mergeCells('A14', 'A16');
      worksheet.mergeCells('A17', 'A18');

      A14.alignment = { vertical: 'middle', horizontal: 'center' };
      A14.font = { bold: true };
      A14.value = 'Total Km driven';

      A17.alignment = { vertical: 'middle', horizontal: 'center' };
      A17.font = { bold: true };
      A17.value = 'Safety';

      A14.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };

      A17.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };

      B14.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };
      B15.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };
      B16.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };
      B17.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };
      B18.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };

      C14.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };
      C15.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };
      C16.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };
      C17.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };
      C18.border = {
        top: { style: 'medium', color: { argb: '000000' } },
        left: { style: 'medium', color: { argb: '000000' } },
        bottom: { style: 'medium', color: { argb: '000000' } },
        right: { style: 'medium', color: { argb: '000000' } },
      };

      B14.value = 'Number of vehicles  used';
      B15.value = 'Total Km driven (Km)';
      B16.value = 'Average km driven per vehicle (Km)';
      B17.value = 'Number of vehicles in speeding';
      B18.value = 'max Speed';

      C14.value = data['Number of vehicle used']
        ? data['Number of vehicle used']
        : 0;
      C15.value = data['Total Km driven (Km)']
        ? data['Total Km driven (Km)']
        : 0;
      C16.value = data['Average km driven per vehicle (Km)']
        ? data['Average km driven per vehicle (Km)']
        : 0;
      C17.value = data['Number of vehicles in speeding']
        ? data['Number of vehicles in speeding']
        : 0;
      C18.value = data['max Speed'] ? data['max Speed'] : 0;

      return workbook.xlsx
        .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
        .then((response) => {
          console.log('file is written');
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
}

async function perencoXlsx(data, sheet, path, excelColum, colorSheet) {
  const dataHeader = [];

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
    excelColum.map((item) => {
      dataHeader.push(item.key);
    });
  }

  if (dataHeader.length > 0) {
    if (isExistPath) {
      setTimeout(async () => {
        console.log(`Generating file ${sheet} ...`);
        const readFile = await workbook.xlsx.readFile(path);
        if (readFile) {
          const existWorkSheet = workbook.getWorksheet(sheet);
          if (existWorkSheet) {
            const existWorkSheetName = existWorkSheet.name;
            if (existWorkSheetName === sheet) {
              await addDataTosheet(existWorkSheet, data, excelColum);
              asignStyleToSheet(existWorkSheet);
              await asignStyleToPerencoInfraction(existWorkSheet);
            }
          } else {
            const worksheet = workbook.addWorksheet(sheet, {
              properties: { tabColor: { argb: colorSheet } },
            });

            await prepareSheet(worksheet, data, dataHeader, excelColum);

            //Center image header banner depending on number of columns
            await perencoHeaderSheet(
              worksheet,
              dataHeader,
              sheet,
              logo1,
              logo2
            );

            await asignStyleToPerencoInfraction(worksheet);
          }

          // Export excel generated file
          workbook.xlsx
            .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
            .then((response) => {
              console.log('file generated');
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }, 15000);
    } else {
      console.log(`Generating file ${sheet} ...`);

      // creation of new sheet
      const worksheet = workbook.addWorksheet(sheet, {
        properties: { tabColor: { argb: colorSheet } },
      });

      await prepareSheet(worksheet, data, dataHeader, excelColum);

      //Center image header banner depending on number of columns
      await perencoHeaderSheet(worksheet, dataHeader, sheet, logo1, logo2);

      await asignStyleToPerencoInfraction(worksheet);

      // Export excel generated file
      workbook.xlsx
        .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
        .then((response) => {
          console.log('file generated');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
}

async function generateDashbordSpeedingPerenco(data, sheet, path) {
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

  const severeNat3 = data.filter((item) => item.template === 'severeNat3');
  const legereNat3 = data.filter((item) => item.template === 'legereNat3');
  const legereVille = data.filter((item) => item.template === 'villeLegere');
  const severeVille = data.filter((item) => item.template === 'villeSevere');
  const severeHorsVille = data.filter(
    (item) => item.template === 'horsVilleSevere'
  );
  const legereHorsVille = data.filter(
    (item) => item.template === 'horsVilleLegere'
  );

  //Group notifications By VehicleID
  const groupItemByVehicleGroupSevereNat3 = _.groupBy(
    severeNat3,
    (item) => item['Grouping']
  );

  const groupItemByVehicleGroupLegereNat3 = _.groupBy(
    legereNat3,
    (item) => item['Grouping']
  );

  const groupItemByVehicleGroupLegereVille = _.groupBy(
    legereVille,
    (item) => item['Grouping']
  );

  const groupItemByVehicleGroupSevereVille = _.groupBy(
    severeVille,
    (item) => item['Grouping']
  );

  const groupItemByVehicleGroupSevereHorsVille = _.groupBy(
    severeHorsVille,
    (item) => item['Grouping']
  );

  const groupItemByVehicleGroupLegereHorsVille = _.groupBy(
    legereHorsVille,
    (item) => item['Grouping']
  );

  //get labels and values ville legere
  const keyValuesVilleLegere = Object.keys(groupItemByVehicleGroupLegereVille);
  const valuesLenthVilleLegere = keyValuesVilleLegere.map((item) => {
    return groupItemByVehicleGroupLegereVille[item].length;
  });

  //get labels and values ville severe
  const keyValuesVilleSevere = Object.keys(groupItemByVehicleGroupSevereVille);
  const valuesLenthVilleSevere = keyValuesVilleSevere.map((item) => {
    return groupItemByVehicleGroupSevereVille[item].length;
  });

  //get labels and values severe Nat3
  const keyValuesSevereNat3 = Object.keys(groupItemByVehicleGroupSevereNat3);
  const valuesLenthSevereNat3 = keyValuesSevereNat3.map((item) => {
    return groupItemByVehicleGroupSevereNat3[item].length;
  });

  //get labels and values legere Nat3
  const keyValuesLegereNat3 = Object.keys(groupItemByVehicleGroupLegereNat3);
  const valuesLenthLegereNat3 = keyValuesLegereNat3.map((item) => {
    return groupItemByVehicleGroupLegereNat3[item].length;
  });

  //get labels and values legere horsville
  const keyValuesLegereHorsVille = Object.keys(
    groupItemByVehicleGroupLegereHorsVille
  );
  const valuesLenthLegereHorsVille = keyValuesLegereHorsVille.map((item) => {
    return groupItemByVehicleGroupLegereHorsVille[item].length;
  });

  //get labels and values severe horsville
  const keyValuesSevereHorsVille = Object.keys(
    groupItemByVehicleGroupSevereHorsVille
  );
  const valuesLenthSevereHorsVille = keyValuesSevereHorsVille.map((item) => {
    return groupItemByVehicleGroupSevereHorsVille[item].length;
  });

  if (isExistPath) {
    setTimeout(async () => {
      console.log(`Generating file ${sheet} ...`);
      const readFile = await workbook.xlsx.readFile(path);
      if (readFile) {
        // creation of new sheet
        const worksheet = workbook.addWorksheet(sheet);

        //remove grid lines
        worksheet.views = [{ showGridLines: false }];

        //add logo headers
        worksheet.addImage(logo1, {
          tl: { col: 3, row: 0 },
          ext: { width: 100, height: 100 },
          editAs: 'oneCell',
        });
        worksheet.addImage(logo2, {
          tl: { col: 23 + 0.999999999999, row: 0 },
          ext: { width: 100, height: 100 },
          editAs: 'oneCell',
        });

        worksheet.mergeCells(`F2`, `W5`);

        const titleCell = worksheet.getCell(`F2`);

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

        titleCell.value = 'Dashbord Exces De Vitesse';
        // Générer le graphique Exces de vitesse légère ville
        const chartImageVilleLegere = await createChart(
          'Exces de vitesse ville légère ',
          keyValuesVilleLegere,
          valuesLenthVilleLegere
        );

        // Ajouter le graphique dans une cellule
        const imageVilleLegere = workbook.addImage({
          buffer: chartImageVilleLegere,
          extension: 'png',
        });

        worksheet.addImage(imageVilleLegere, {
          tl: { col: 1, row: 8 },
          ext: { width: 500, height: 500 },
        });

        // Générer le graphique Exces de vitesse severe ville
        const chartImageVilleSevere = await createChart(
          'Exces de vitesse ville sévère',
          keyValuesVilleSevere,
          valuesLenthVilleSevere
        );

        // Ajouter le graphique dans une cellule
        const imageVilleSevere = workbook.addImage({
          buffer: chartImageVilleSevere,
          extension: 'png',
        });

        worksheet.addImage(imageVilleSevere, {
          tl: { col: 9, row: 8 },
          ext: { width: 500, height: 500 },
        });

        // Générer le graphique Exces de vitesse Legere Nat3
        const chartImageLegereNat3 = await createChart(
          'Exces de vitesse Nat3 légère',
          keyValuesLegereNat3,
          valuesLenthLegereNat3
        );

        // Ajouter le graphique dans une cellule
        const imageLegereNat3 = workbook.addImage({
          buffer: chartImageLegereNat3,
          extension: 'png',
        });

        worksheet.addImage(imageLegereNat3, {
          tl: { col: 1, row: 35 },
          ext: { width: 500, height: 500 },
        });

        // Générer le graphique Exces de vitesse Legere Nat3
        const chartImageSevereNat3 = await createChart(
          'Exces de vitesse Nat3 Sévère',
          keyValuesSevereNat3,
          valuesLenthSevereNat3
        );

        // Ajouter le graphique dans une cellule
        const imageSevereNat3 = workbook.addImage({
          buffer: chartImageSevereNat3,
          extension: 'png',
        });

        worksheet.addImage(imageSevereNat3, {
          tl: { col: 9, row: 35 },
          ext: { width: 500, height: 500 },
        });

        // Générer le graphique Exces de vitesse Hors ville severe
        const chartImageHorsVilleSevere = await createChart(
          'Exces de vitesse hors ville severe',
          keyValuesSevereHorsVille,
          valuesLenthSevereHorsVille
        );

        // Ajouter le graphique dans une cellule
        const imageHorsVilleSevere = workbook.addImage({
          buffer: chartImageHorsVilleSevere,
          extension: 'png',
        });

        worksheet.addImage(imageHorsVilleSevere, {
          tl: { col: 17, row: 35 },
          ext: { width: 500, height: 500 },
        });

        // Générer le graphique Exces de vitesse Hors ville legere
        const chartImageHorsVilleLegere = await createChart(
          'Exces de vitesse hors ville legere',
          keyValuesLegereHorsVille,
          valuesLenthLegereHorsVille
        );

        // Ajouter le graphique dans une cellule
        const imageHorsVilleLegere = workbook.addImage({
          buffer: chartImageHorsVilleLegere,
          extension: 'png',
        });

        worksheet.addImage(imageHorsVilleLegere, {
          tl: { col: 17, row: 8 },
          ext: { width: 500, height: 500 },
        });

        //Center image header banner depending on number of columns
        //perencoHeaderSheet(worksheet, thirdHeader, sheet, logo1, logo2);

        // Export excel generated file
        workbook.xlsx
          .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
          .then((response) => {
            console.log('file generated');
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }, 15000);
  }
}

async function generateSyntheseSheetPerenco(path, data, sheet) {
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

  const thirdHeader = [
    'Imatriculations',
    'Affectations',
    'Utilisateurs',
    'Distance',
    'Duration',
    'Harsh Acceleration',
    'Several Acceleration',
    'Harsh Turn',
    'Several Turn',
    'Harsh Brake',
    'Several Brake',
    '22H24H',
    '24H04H',
    'Distances',
    'Durations',
    'Severe-Ville',
    'Legere-Ville',
    'Severe-HorsVille',
    'Legere-HorsVille',
    'Severe-Nat3',
    'Legere-Nat3',
  ];

  if (isExistPath) {
    setTimeout(async () => {
      console.log(`Generating file ${sheet} ...`);
      const readFile = await workbook.xlsx.readFile(path);
      if (readFile) {
        const existWorkSheet = workbook.getWorksheet(sheet);
        if (existWorkSheet) {
          const existWorkSheetName = existWorkSheet.name;
          if (existWorkSheetName === sheet) {
            //Add data to rows
            data.map((item) => {
              existWorkSheet.addRow(item).commit();
            });
          }
        } else {
          // creation of new sheet
          const worksheet = workbook.addWorksheet(sheet);

          worksheet.views = [{ showGridLines: false }];

          const syntheseCol = thirdHeader.map((item) => {
            return { key: item };
          });

          prepareSheetForSynthese(worksheet, thirdHeader, syntheseCol, data);

          assignStylePrencoSynthese(worksheet);

          //Center image header banner depending on number of columns
          perencoHeaderSheet(worksheet, thirdHeader, sheet, logo1, logo2);
        }
        // Export excel generated file
        workbook.xlsx
          .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
          .then((response) => {
            console.log('file generated');
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }, 15000);
  }
}

async function guinnessXlsx(data, sheet, path, excelColum) {
  const dataHeader = [];

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
    excelColum.map((item) => {
      dataHeader.push(item.key);
    });
  }

  if (dataHeader.length > 0) {
    if (isExistPath) {
      setTimeout(async () => {
        console.log(`Generating file ${sheet} ...`);
        const readFile = await workbook.xlsx.readFile(path);
        if (readFile) {
          const existWorkSheet = workbook.getWorksheet(sheet);
          if (existWorkSheet) {
            const existWorkSheetName = existWorkSheet.name;
            if (existWorkSheetName === sheet) {
              await addDataTosheet(existWorkSheet, data, excelColum);
              asignStyleToSheet(existWorkSheet);
            }
          } else {
            const worksheet = workbook.addWorksheet(sheet);

            await prepareSheet(worksheet, data, dataHeader, excelColum);

            //Center image header banner depending on number of columns
            await guinnessHeaderSheet(
              worksheet,
              dataHeader,
              sheet,
              logo1,
              logo2
            );
          }

          // Export excel generated file
          workbook.xlsx
            .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
            .then((response) => {
              console.log('file generated');
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }, 15000);
    } else {
      console.log(`Generating file ${sheet} ...`);

      // creation of new sheet
      const worksheet = workbook.addWorksheet(sheet);

      await prepareSheet(worksheet, data, dataHeader, excelColum);

      //Center image header banner depending on number of columns
      await guinnessHeaderSheet(worksheet, dataHeader, sheet, logo1, logo2);

      // Export excel generated file
      workbook.xlsx
        .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
        .then((response) => {
          console.log('file generated');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
}

async function CotcoXlsx(data, sheet, path, excelColum) {
  const dataHeader = [];

  const isExistPath = fs.existsSync(path);

  let workbook = new XLSX.Workbook();

  const logo1 = workbook.addImage({
    buffer: fs.readFileSync('rapport/Cotco/assets/cotco.jpeg'),
    extension: 'png',
  });

  const logo2 = workbook.addImage({
    buffer: fs.readFileSync('rapport/Guinness/assets/camtrack.png'),
    extension: 'png',
  });

  if (excelColum) {
    excelColum.map((item) => {
      dataHeader.push(item.key);
    });
  }

  if (dataHeader.length > 0) {
    if (isExistPath) {
      setTimeout(async () => {
        console.log(`Generating file ${sheet} ...`);
        const readFile = await workbook.xlsx.readFile(path);
        if (readFile) {
          const existWorkSheet = workbook.getWorksheet(sheet);
          if (existWorkSheet) {
            const existWorkSheetName = existWorkSheet.name;
            if (existWorkSheetName === sheet) {
              await addDataTosheet(existWorkSheet, data, excelColum);
              asignStyleToSheet(existWorkSheet);
            }
          } else {
            const worksheet = workbook.addWorksheet(sheet);

            await prepareSheet(worksheet, data, dataHeader, excelColum);

            //Center image header banner depending on number of columns
            await guinnessHeaderSheet(
              worksheet,
              dataHeader,
              sheet,
              logo1,
              logo2
            );
          }

          // Export excel generated file
          workbook.xlsx
            .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
            .then((response) => {
              console.log('file generated');
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }, 15000);
    } else {
      console.log(`Generating file ${sheet} ...`);

      // creation of new sheet
      const worksheet = workbook.addWorksheet(sheet);

      await prepareSheet(worksheet, data, dataHeader, excelColum);

      //Center image header banner depending on number of columns
      await guinnessHeaderSheet(worksheet, dataHeader, sheet, logo1, logo2);

      // Export excel generated file
      workbook.xlsx
        .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
        .then((response) => {
          console.log('file generated');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
}

async function cimencamXlsx(data, sheet, path, excelColum, date) {
  const dataHeader = [];

  const isExistPath = fs.existsSync(path);

  let workbook = new XLSX.Workbook();

  const baner = workbook.addImage({
    buffer: fs.readFileSync('rapport/Cimencam/assets/baner.png'),
    extension: 'png',
  });

  if (excelColum) {
    excelColum.map((item) => {
      dataHeader.push(item.key);
    });
  }

  if (dataHeader.length > 0) {
    if (isExistPath) {
      setTimeout(async () => {
        console.log(`Generating file ${sheet} ...`);
        const readFile = await workbook.xlsx.readFile(path);
        if (readFile) {
          const existWorkSheet = workbook.getWorksheet(sheet);
          if (existWorkSheet) {
            const existWorkSheetName = existWorkSheet.name;
            if (existWorkSheetName === sheet) {
              await addDataTosheet(existWorkSheet, data, excelColum);
              asignStyleToSheet(existWorkSheet);
            }
          } else {
            const worksheet = workbook.addWorksheet(sheet);

            await prepareSheetCimencam(
              worksheet,
              data,
              dataHeader,
              excelColum,
              date
            );

            //Center image header banner depending on number of columns
            await cimencamHeaderSheet(worksheet, dataHeader, sheet, baner);
          }

          // Export excel generated file
          workbook.xlsx
            .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
            .then((response) => {
              console.log('file generated');
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }, 15000);
    } else {
      console.log(`Generating file ${sheet} ...`);

      // creation of new sheet
      const worksheet = workbook.addWorksheet(sheet);

      await prepareSheetCimencam(worksheet, data, dataHeader, excelColum, date);

      //Center image header banner depending on number of columns
      await cimencamHeaderSheet(worksheet, dataHeader, date, baner);

      // Export excel generated file
      workbook.xlsx
        .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
        .then((response) => {
          console.log('file generated');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
}

async function KPDCXlsx(data, sheet, path, excelColum) {
  const dataHeader = [];

  const isExistPath = fs.existsSync(path);

  let workbook = new XLSX.Workbook();

  if (excelColum) {
    excelColum.map((item) => {
      dataHeader.push(item.key);
    });
  }

  if (dataHeader.length > 0) {
    if (isExistPath) {
      setTimeout(async () => {
        console.log(`Generating file ${sheet} ...`);
        const readFile = await workbook.xlsx.readFile(path);
        if (readFile) {
          const existWorkSheet = workbook.getWorksheet(sheet);
          if (existWorkSheet) {
            const existWorkSheetName = existWorkSheet.name;
            if (existWorkSheetName === sheet) {
              await addDataTosheet(existWorkSheet, data, excelColum);
              assignStyleToKPCDHeaders(existWorkSheet);
            }
          } else {
            const worksheet = workbook.addWorksheet(sheet);

            await prepareSheetKPDC(worksheet, data, dataHeader, excelColum);
          }

          // Export excel generated file
          workbook.xlsx
            .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
            .then((response) => {
              console.log('file generated');
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }, 15000);
    } else {
      console.log(`Generating file ${sheet} ...`);

      // creation of new sheet
      const worksheet = workbook.addWorksheet(sheet);

      await prepareSheetKPDC(worksheet, data, dataHeader, excelColum);

      // Export excel generated file
      workbook.xlsx
        .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
        .then((response) => {
          console.log('file generated');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
}

async function generateDashbordKPDC(data, sheet, path) {
  const isExistPath = fs.existsSync(path);

  let workbook = new XLSX.Workbook();

  const trajet = data.filter((item) => item.template === 'trajet');
  const braking = data.filter((item) => item.template === 'braking');
  const arret = data.filter((item) => item.template === 'arret');
  const speeding = data.filter((item) => item.template === 'speeding');

  //Group notifications By VehicleID
  const groupTrajetByCoducteur = _.groupBy(
    trajet,
    (item) => item['Conducteur']
  );

  const groupBrakingByCoducteur = _.groupBy(
    braking,
    (item) => item['Noms des conducteurs']
  );

  const groupArretByCoducteur = _.groupBy(
    arret,
    (item) => item['Noms des conducteurs']
  );

  const groupSpeedingByCoducteur = _.groupBy(
    speeding,
    (item) => item['Noms des conducteurs']
  );

  //get labels and values distance
  const keyValuesTrajet = Object.keys(groupTrajetByCoducteur);
  const valuesLenthTrajet = keyValuesTrajet.map((item) => {
    return groupTrajetByCoducteur[item];
  });
  const distanceCluster = valuesLenthTrajet.map((item) => {
    return item.map((i) => i.Distance);
  });
  const sumDistanceCluster = distanceCluster.map((item) => {
    const sumDistance = item.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    return sumDistance;
  });

  //get values ville duree
  const dureeCluster = valuesLenthTrajet.map((item) => {
    return item.map((i) => i['Utilisation Vehicule']);
  });
  const sumDureeCluster = dureeCluster.map((item) => {
    const sumDuree = calculateTime(item);
    return sumDuree;
  });

  //get labels and values braking
  const keyValuesBraking = Object.keys(groupBrakingByCoducteur);
  const valuesLenthBraking = keyValuesBraking.map((item) => {
    return groupBrakingByCoducteur[item];
  });
  const recurrenceCluster = valuesLenthBraking.map((item) => {
    return item.map((i) => i['Nombre de recurrence']);
  });
  const sumReccurenceCluster = recurrenceCluster.map((item) => {
    const sumRecurence = item.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    return sumRecurence;
  });

  //get labels and values speeding
  const keyValuesSpeeding = Object.keys(groupSpeedingByCoducteur);
  const valuesLenthSpeeding = keyValuesSpeeding.map((item) => {
    return groupSpeedingByCoducteur[item];
  });
  const recurrenceClusterSpeeding = valuesLenthSpeeding.map((item) => {
    return item.map((i) => i['Nombre de recurrence']);
  });
  const sumReccurenceClusterSpeeding = recurrenceClusterSpeeding.map((item) => {
    const sumRecurence = item.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    return sumRecurence;
  });

  //get labels and values arret
  const keyValuesArret = Object.keys(groupArretByCoducteur);
  const valuesLenthArret = keyValuesArret.map((item) => {
    return groupArretByCoducteur[item];
  });
  const recurrenceClusterArret = valuesLenthArret.map((item) => {
    return item.map((i) => i['Nombre de recurrence']);
  });
  const sumReccurenceClusterArret = recurrenceClusterArret.map((item) => {
    const sumRecurence = item.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    return sumRecurence;
  });

  if (isExistPath) {
    setTimeout(async () => {
      console.log(`Generating file ${sheet} ...`);

      const readFile = await workbook.xlsx.readFile(path);

      if (readFile) {
        // creation of new sheet
        const worksheet = workbook.addWorksheet(sheet);

        //remove grid lines
        worksheet.views = [{ showGridLines: false }];

        worksheet.mergeCells(`F2`, `W5`);

        const titleCell = worksheet.getCell(`F2`);

        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        titleCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' },
        };

        titleCell.font = {
          color: { argb: '000000' },
          bold: true,
          name: 'calibri',
          size: 15,
        };

        titleCell.value = 'DASHBOARD SUIVI ACTIVITE CHAUFFEURS KPDC';
        // Générer le graphique Harsh Braking by Driver
        const chartImageBrake = await createChartKPDC(
          'Harsh Braking By driver',
          keyValuesBraking,
          sumReccurenceCluster
        );

        //add logo KPDC headers
        const logoKPDC = workbook.addImage({
          buffer: fs.readFileSync('rapport/kpdc/assets/globeleq.jpg'),
          extension: 'jpg',
        });
        worksheet.addImage(logoKPDC, {
          tl: { col: 4, row: 0 },
          ext: { width: 100, height: 100 },
        });

        //add logo camtrack
        const logoCamtrack = workbook.addImage({
          buffer: fs.readFileSync('rapport/kpdc/assets/camtrack.png'),
          extension: 'png',
        });
        worksheet.addImage(logoCamtrack, {
          tl: { col: 22 + 0.999999999999, row: 0 },
          ext: { width: 100, height: 100 },
        });

        // Ajouter le graphique dans une cellule
        const imageBrake = workbook.addImage({
          buffer: chartImageBrake,
          extension: 'png',
        });

        worksheet.addImage(imageBrake, {
          tl: { col: 5, row: 8 },
          ext: { width: 500, height: 500 },
        });

        // Générer le graphique speeding by driver
        const chartImageSpeeding = await createChartKPDC(
          'Speeding By Driver',
          keyValuesSpeeding,
          sumReccurenceClusterSpeeding
        );

        // Ajouter le graphique dans une cellule
        const imageSpeeding = workbook.addImage({
          buffer: chartImageSpeeding,
          extension: 'png',
        });

        worksheet.addImage(imageSpeeding, {
          tl: { col: 14, row: 8 },
          ext: { width: 500, height: 500 },
        });

        // Générer le graphique Stop by driver
        const chartImageStop = await createChartKPDC(
          'Stop by driver',
          keyValuesArret,
          sumReccurenceClusterArret
        );

        // Ajouter le graphique dans une cellule
        const imageStop = workbook.addImage({
          buffer: chartImageStop,
          extension: 'png',
        });

        worksheet.addImage(imageStop, {
          tl: { col: 5, row: 63 },
          ext: { width: 500, height: 500 },
        });

        // Générer le graphique Duree D'utilisation des véhicules
        const chartImageDuree = await createChartDureeKPDC(
          "Duree D'utilisation des véhicules en (heure)",
          keyValuesTrajet,
          sumDureeCluster
        );

        // Ajouter le graphique dans une cellule
        const imageDuree = workbook.addImage({
          buffer: chartImageDuree,
          extension: 'png',
        });

        worksheet.addImage(imageDuree, {
          tl: { col: 10, row: 35 },
          ext: { width: 500, height: 500 },
        });

        // Générer le graphique Exces distance driver
        const chartImageDistance = await createChartKPDC(
          'Distance by driver',
          keyValuesTrajet,
          sumDistanceCluster
        );

        // Ajouter le graphique dans une cellule
        const imageDistance = workbook.addImage({
          buffer: chartImageDistance,
          extension: 'png',
        });

        worksheet.addImage(imageDistance, {
          tl: { col: 14, row: 63 },
          ext: { width: 500, height: 500 },
        });

        // Export excel generated file
        workbook.xlsx
          .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
          .then((response) => {
            console.log('file generated');
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }, 30000);
  }
}

//generate razel sheets
async function razelXlsx(data, sheet, path, excelColum, title) {
  const dataHeader = [];

  const isExistPath = fs.existsSync(path);

  let workbook = new XLSX.Workbook();

  const baner = workbook.addImage({
    buffer: fs.readFileSync('rapport/razel/assets/baner.png'),
    extension: 'png',
  });

  if (excelColum) {
    excelColum.map((item) => {
      dataHeader.push(item.key);
    });
  }

  if (dataHeader.length > 0) {
    if (isExistPath) {
      setTimeout(async () => {
        console.log(`Generating file ${sheet} ...`);
        const readFile = await workbook.xlsx.readFile(path);
        if (readFile) {
          const existWorkSheet = workbook.getWorksheet(sheet);
          if (existWorkSheet) {
            const existWorkSheetName = existWorkSheet.name;
            if (existWorkSheetName === sheet) {
              asignStyleToSheet(existWorkSheet);
              await addDataTosheet(existWorkSheet, data, excelColum);
            }
          } else {
            const worksheet = workbook.addWorksheet(sheet);

            await prepareSheetRazel(worksheet, data, dataHeader, excelColum);

            //Center image header banner depending on number of columns
            await razelHeaderSheet(worksheet, dataHeader, baner, title);
          }

          // Export excel generated file
          workbook.xlsx
            .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
            .then((response) => {
              console.log('file generated');
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }, 15000);
    } else {
      console.log(`Generating file ${sheet} ...`);

      // creation of new sheet
      const worksheet = workbook.addWorksheet(sheet);

      await prepareSheetRazel(worksheet, data, dataHeader, excelColum);

      //Center image header banner depending on number of columns
      await razelHeaderSheet(worksheet, dataHeader, baner, title);

      // Export excel generated file
      workbook.xlsx
        .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
        .then((response) => {
          console.log('file generated');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
}

//generate razel exces de vitesse
async function razelExesVitesseXlsx(
  data,
  sheet,
  path,
  excelColum,
  title,
  titleMarker
) {
  const dataHeader = [];

  const isExistPath = fs.existsSync(path);

  let workbook = new XLSX.Workbook();

  const baner = workbook.addImage({
    buffer: fs.readFileSync('rapport/razel/assets/baner.png'),
    extension: 'png',
  });

  if (excelColum) {
    excelColum.map((item) => {
      dataHeader.push(item.key);
    });
  }

  if (dataHeader.length > 0) {
    if (isExistPath) {
      setTimeout(async () => {
        console.log(`Generating file ${sheet} ...`);
        const readFile = await workbook.xlsx.readFile(path);
        if (readFile) {
          const existWorkSheet = workbook.getWorksheet(sheet);
          if (existWorkSheet) {
            const existWorkSheetName = existWorkSheet.name;
            if (existWorkSheetName === sheet) {
              await prepareSheetRazelExcessVitesse(
                existWorkSheet,
                data,
                dataHeader,
                excelColum,
                titleMarker
              );
            }
          } else {
            const worksheet = workbook.addWorksheet(sheet);

            await prepareSheetRazelExcessVitesse(
              worksheet,
              data,
              dataHeader,
              excelColum,
              titleMarker
            );

            //Center image header banner depending on number of columns
            await razelHeaderSheet(worksheet, dataHeader, baner, title);
          }

          // Export excel generated file
          workbook.xlsx
            .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
            .then((response) => {
              console.log('file generated');
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }, 15000);
    } else {
      console.log(`Generating file ${sheet} ...`);

      // creation of new sheet
      const worksheet = workbook.addWorksheet(sheet);

      await prepareSheetRazelExcessVitesse(
        worksheet,
        data,
        dataHeader,
        excelColum,
        titleMarker
      );

      //Center image header banner depending on number of columns
      await razelHeaderSheet(worksheet, dataHeader, baner, title);

      // Export excel generated file
      workbook.xlsx
        .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
        .then((response) => {
          console.log('file generated');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
}

async function razelSynthese(path, data, sheet, Title) {
  const isExistPath = fs.existsSync(path);

  let workbook = new XLSX.Workbook();

  const baner = workbook.addImage({
    buffer: fs.readFileSync('rapport/razel/assets/baner.png'),
    extension: 'png',
  });

  const thirdHeader = [
    'Véhicules',
    'Heure moteur (heure)',
    'Ralenti moteur (heure)',
    'En Mouvement (heure)',
    'Kilométrage (km)',
    "Nbre d'exces de vitesse Agglomeration",
    "Nbre d'exces de vitesse Hors Agglomeration",
    'Acceleration excessives',
    'Freinage Brusque',
    'Virage',
    "Nbre D'arret",
    "Duree d'arret (heure)",
    'Duree Conduite weekend (heure)',
    'Kilometrage weekend (km)',
    'Duree Conduite nuit (heure)',
    'Kilometrage nuit (km)',
    'Ralenti Moteur (%)',
    'En mouvement (%)',
  ];

  if (isExistPath) {
    setTimeout(async () => {
      console.log(`Generating file ${sheet} ...`);
      const readFile = await workbook.xlsx.readFile(path);
      if (readFile) {
        const existWorkSheet = workbook.getWorksheet(sheet);
        if (existWorkSheet) {
          const existWorkSheetName = existWorkSheet.name;
          if (existWorkSheetName === sheet) {
            //Add data to rows
            data.map((item) => {
              existWorkSheet.addRow(item).commit();
            });
          }
        } else {
          // creation of new sheet
          const worksheet = workbook.addWorksheet(sheet);

          worksheet.views = [{ showGridLines: false }];

          const syntheseCol = thirdHeader.map((item) => {
            return { key: item };
          });

          prepareSheetRazelForSynthese(
            worksheet,
            thirdHeader,
            syntheseCol,
            data
          );

          assignStyleToHeadersSyntheseRazel(worksheet);

          //Center image header banner depending on number of columns
          razelHeaderSheetSynthese(worksheet, thirdHeader, baner, Title);
        }
        // Export excel generated file
        workbook.xlsx
          .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
          .then((response) => {
            console.log('file generated');
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }, 15000);
  }
}

//generate DKT sheets
async function DKTXlsx(data, sheet, path, excelColum, title) {
  const dataHeader = [];

  const isExistPath = fs.existsSync(path);

  let workbook = new XLSX.Workbook();

  const baner = workbook.addImage({
    buffer: fs.readFileSync('rapport/dkt/assets/baner.png'),
    extension: 'png',
  });

  if (excelColum) {
    excelColum.map((item) => {
      dataHeader.push(item.key);
    });
  }

  if (dataHeader.length > 0) {
    if (isExistPath) {
      setTimeout(async () => {
        console.log(`Generating file ${sheet} ...`);
        const readFile = await workbook.xlsx.readFile(path);
        if (readFile) {
          const existWorkSheet = workbook.getWorksheet(sheet);
          if (existWorkSheet) {
            const existWorkSheetName = existWorkSheet.name;
            if (existWorkSheetName === sheet) {
              asignStyleToSheet(existWorkSheet);
              await addDataTosheet(existWorkSheet, data, excelColum);
            }
          } else {
            const worksheet = workbook.addWorksheet(sheet);

            await prepareSheetDKT(worksheet, data, dataHeader, excelColum);

            //Center image header banner depending on number of columns
            await DKTHeaderSheet(worksheet, dataHeader, baner, title);
          }

          // Export excel generated file
          workbook.xlsx
            .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
            .then((response) => {
              console.log('file generated');
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }, 15000);
    } else {
      console.log(`Generating file ${sheet} ...`);

      // creation of new sheet
      const worksheet = workbook.addWorksheet(sheet);

      await prepareSheetDKT(worksheet, data, dataHeader, excelColum);

      //Center image header banner depending on number of columns
      await DKTHeaderSheet(worksheet, dataHeader, baner, title);

      // Export excel generated file
      workbook.xlsx
        .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
        .then((response) => {
          console.log('file generated');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
}

async function DKTSynthese(path, data, sheet, Title) {
  const isExistPath = fs.existsSync(path);

  let workbook = new XLSX.Workbook();

  const baner = workbook.addImage({
    buffer: fs.readFileSync('rapport/dkt/assets/baner.png'),
    extension: 'png',
  });

  const thirdHeader = [
    'Véhicules',
    'Durée Conduite (heure)',
    'Kilométrage (km)',
    "Nbre d'exces de vitesse",
    'Acceleration excessives',
    'Freinage Brusque',
    'Virage',
    "Nbre D'arret",
    "Duree d'arret (heure)",
    'Duree Conduite weekend (heure)',
    'Kilometrage weekend (km)',
    'Duree Conduite nuit (heure)',
    'Kilometrage nuit (km)',
    '%',
  ];

  if (isExistPath) {
    setTimeout(async () => {
      console.log(`Generating file ${sheet} ...`);
      const readFile = await workbook.xlsx.readFile(path);
      if (readFile) {
        const existWorkSheet = workbook.getWorksheet(sheet);
        if (existWorkSheet) {
          const existWorkSheetName = existWorkSheet.name;
          if (existWorkSheetName === sheet) {
            //Add data to rows
            data.map((item) => {
              existWorkSheet.addRow(item).commit();
            });
          }
        } else {
          // creation of new sheet
          const worksheet = workbook.addWorksheet(sheet);

          worksheet.views = [{ showGridLines: false }];

          const syntheseCol = thirdHeader.map((item) => {
            return { key: item };
          });

          prepareSheetDKTForSynthese(worksheet, thirdHeader, syntheseCol, data);

          assignStyleToHeadersSyntheseRazel(worksheet);

          //Center image header banner depending on number of columns
          razelHeaderSheetSynthese(worksheet, thirdHeader, baner, Title);
        }
        // Export excel generated file
        workbook.xlsx
          .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
          .then((response) => {
            console.log('file generated');
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }, 15000);
  }
}

async function generateDashbordDKT(data, sheet, path) {
  const isExistPath = fs.existsSync(path);

  let workbook = new XLSX.Workbook();

  //distance from detail trajet
  const trajet = data.filter((item) => item.template === 'detail-trajet');

  //harsh braking from eco-driving
  const ecodriving = data.filter((item) => item.template === 'eco-driving');
  const harshBraking = ecodriving.filter(
    (item) =>
      item.Violations === 'Freinage Brusque' ||
      item.Violations === 'Harsh Braking'
  );

  //harsh acceleration from eco-driving
  const harshAcceleration = ecodriving.filter(
    (item) =>
      item.Violations === 'Harsh acceleration' ||
      item.Violations === 'Accélération Excessif'
  );

  //conduite de weekend
  const conduiteWeekend = data.filter(
    (item) => item.template === 'conduit-weekend'
  );

  //conduite de nuit
  const conduiteNuit = data.filter((item) => item.template === 'conduite-nuit');

  //exces de vitesse
  const excesVitesse = data.filter((item) => item.template === 'exces-vitesse');

  //Group notifications By VehicleID
  const groupTrajetByCoducteur = _.groupBy(trajet, (item) => item['Véhicules']);

  const groupBrakingByCoducteur = _.groupBy(
    harshBraking,
    (item) => item['Véhicules']
  );

  const groupharshAccelerationByCoducteur = _.groupBy(
    harshAcceleration,
    (item) => item['Véhicules']
  );

  const groupConduiteWeekendtByCoducteur = _.groupBy(
    conduiteWeekend,
    (item) => item['Véhicules']
  );

  const groupConduiteNuitByCoducteur = _.groupBy(
    conduiteNuit,
    (item) => item['Véhicules']
  );

  const groupExcesVitesseByCoducteur = _.groupBy(
    excesVitesse,
    (item) => item['Véhicules']
  );

  //get labels and values distance
  const keyValuesTrajet = Object.keys(groupTrajetByCoducteur);
  const valuesLenthTrajet = keyValuesTrajet.map((item) => {
    return groupTrajetByCoducteur[item];
  });
  const distanceCluster = valuesLenthTrajet.map((item) => {
    return item.map((i) => i['Kilométrage']);
  });
  const sumDistanceCluster = distanceCluster.map((item) => {
    const sumDistance = item.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    return sumDistance;
  });

  //get labels and values harsh braking
  const keyValuesBraking = Object.keys(groupBrakingByCoducteur);
  const valuesLenthBraking = keyValuesBraking.map((item) => {
    return groupBrakingByCoducteur[item];
  });

  const countHasrbrakingCluster = valuesLenthBraking.map((item) => {
    return item.length;
  });

  //get labels and values harsh acceleration
  const keyValuesHarshAcceleration = Object.keys(
    groupharshAccelerationByCoducteur
  );
  const valuesLenthHarshAcceleration = keyValuesHarshAcceleration.map(
    (item) => {
      return groupharshAccelerationByCoducteur[item];
    }
  );

  const countHarshAccelerationCluster = valuesLenthHarshAcceleration.map(
    (item) => {
      return item.length;
    }
  );

  /* 
  console.log(keyValuesHarshAcceleration);
  console.log(countHarshAccelerationCluster); */

  //get labels and values conduite weekend
  const keyValuesConduiteWeekend = Object.keys(
    groupConduiteWeekendtByCoducteur
  );
  const valuesLenthConduiteWeekend = keyValuesConduiteWeekend.map((item) => {
    return groupConduiteWeekendtByCoducteur[item];
  });

  const distanceClusterConduiteWeekend = valuesLenthConduiteWeekend.map(
    (item) => {
      return item.map((i) => i['Kilométrage']);
    }
  );
  const sumDistanceClusterConduiteWeekend = distanceClusterConduiteWeekend.map(
    (item) => {
      const sumDistance = item.reduce((a, b) => parseInt(a) + parseInt(b), 0);
      return sumDistance;
    }
  );

  /*  
  console.log(keyValuesConduiteWeekend);
  console.log(sumDistanceClusterConduiteWeekend);
 */

  //get labels and conduite de nuit
  const keyValuesConduiteNuit = Object.keys(groupConduiteNuitByCoducteur);
  const valuesLenthConduiteNuit = keyValuesConduiteNuit.map((item) => {
    return groupConduiteNuitByCoducteur[item];
  });

  const distanceClusterConduiteNuit = valuesLenthConduiteNuit.map((item) => {
    return item.map((i) => i['Kilométrage']);
  });

  const sumDistanceClusterConduiteNuit = distanceClusterConduiteNuit.map(
    (item) => {
      const sumDistance = item.reduce((a, b) => parseInt(a) + parseInt(b), 0);
      return sumDistance;
    }
  );

  //get labels and Exces Vitesse
  const keyValuesExcessVitesse = Object.keys(groupExcesVitesseByCoducteur);
  const valuesLenthExcessVitesse = keyValuesExcessVitesse.map((item) => {
    return groupExcesVitesseByCoducteur[item];
  });

  const countExcessVitesseCluster = valuesLenthExcessVitesse.map((item) => {
    return item.length;
  });

  if (isExistPath) {
    setTimeout(async () => {
      console.log(`Generating file ${sheet} ...`);

      const readFile = await workbook.xlsx.readFile(path);

      if (readFile) {
        // creation of new sheet
        const worksheet = workbook.addWorksheet(sheet);

        //remove grid lines
        worksheet.views = [{ showGridLines: false }];

        worksheet.mergeCells(`F2`, `W5`);

        const titleCell = worksheet.getCell(`F2`);

        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        titleCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' },
        };

        titleCell.font = {
          color: { argb: '000000' },
          bold: true,
          name: 'calibri',
          size: 15,
        };

        titleCell.value = 'DASHBOARD SUIVI ACTIVITE CHAUFFEURS DKT';
        // Générer le graphique Distance by Driver
        const chartImageBrake = await createChartKPDC(
          'Total Distances By Driver',
          keyValuesTrajet,
          sumDistanceCluster
        );

        //add logo DKT headers
        const logoKPDC = workbook.addImage({
          buffer: fs.readFileSync('rapport/DKT/assets/dkt.png'),
          extension: 'png',
        });
        worksheet.addImage(logoKPDC, {
          tl: { col: 4, row: 0 },
          ext: { width: 100, height: 100 },
        });

        //add logo camtrack
        const logoCamtrack = workbook.addImage({
          buffer: fs.readFileSync('rapport/dkt/assets/camtrack.png'),
          extension: 'png',
        });
        worksheet.addImage(logoCamtrack, {
          tl: { col: 22 + 0.999999999999, row: 0 },
          ext: { width: 100, height: 100 },
        });

        // Ajouter le graphique dans une cellule
        const imageBrake = workbook.addImage({
          buffer: chartImageBrake,
          extension: 'png',
        });

        worksheet.addImage(imageBrake, {
          tl: { col: 5, row: 8 },
          ext: { width: 500, height: 500 },
        });

        // Générer le graphique  Harsh braking by driver
        const chartImageSpeeding = await createChartKPDC(
          'Harsh Braking By Driver',
          keyValuesBraking,
          countHasrbrakingCluster
        );

        // Ajouter le graphique dans une cellule
        const imageSpeeding = workbook.addImage({
          buffer: chartImageSpeeding,
          extension: 'png',
        });

        worksheet.addImage(imageSpeeding, {
          tl: { col: 14, row: 8 },
          ext: { width: 500, height: 500 },
        });

        // Générer le graphique harsh acceleration by driver
        const chartImageStop = await createChartKPDC(
          'Harsh Acceleration by driver',
          keyValuesHarshAcceleration,
          countHarshAccelerationCluster
        );

        // Ajouter le graphique dans une cellule
        const imageStop = workbook.addImage({
          buffer: chartImageStop,
          extension: 'png',
        });

        worksheet.addImage(imageStop, {
          tl: { col: 5, row: 38 },
          ext: { width: 500, height: 500 },
        });

        // Générer le graphique conduite weekend by driver
        const chartImageConduiteWeekend = await createChartKPDC(
          'Distances Conduite Weekend by driver',
          keyValuesConduiteWeekend,
          sumDistanceClusterConduiteWeekend
        );

        // Ajouter le graphique dans une cellule
        const ImageConduiteWeekend = workbook.addImage({
          buffer: chartImageConduiteWeekend,
          extension: 'png',
        });

        worksheet.addImage(ImageConduiteWeekend, {
          tl: { col: 14, row: 38 },
          ext: { width: 500, height: 500 },
        });

        // Générer le graphique conduite nuit by driver
        const chartImageConduiteNuit = await createChartKPDC(
          'Distances Conduite de nui by driver',
          keyValuesConduiteNuit,
          sumDistanceClusterConduiteNuit
        );

        // Ajouter le graphique dans une cellule
        const ImageConduiteNuit = workbook.addImage({
          buffer: chartImageConduiteNuit,
          extension: 'png',
        });

        worksheet.addImage(ImageConduiteNuit, {
          tl: { col: 5, row: 63 },
          ext: { width: 500, height: 500 },
        });

        // Générer le graphique Excess de vitesse by driver
        const chartImageExcessVitesse = await createChartKPDC(
          'Number of Speeding by driver',
          keyValuesExcessVitesse,
          countExcessVitesseCluster
        );

        // Ajouter le graphique dans une cellule
        const ImageExcessVitesse = workbook.addImage({
          buffer: chartImageExcessVitesse,
          extension: 'png',
        });

        worksheet.addImage(ImageExcessVitesse, {
          tl: { col: 14, row: 63 },
          ext: { width: 500, height: 500 },
        });

        // Export excel generated file
        workbook.xlsx
          .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
          .then((response) => {
            console.log('file generated');
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }, 30000);
  }
}

async function generateComAlios(data, sheet, path, excelColum, colorSheet) {
  const dataHeader = [];

  const isExistPath = fs.existsSync(path);

  let workbook = new XLSX.Workbook();

  const imageId2 = workbook.addImage({
    buffer: fs.readFileSync('rapport/alios/assets/banner.png'),
    extension: 'png',
  });

  const logo1 = workbook.addImage({
    buffer: fs.readFileSync('rapport/alios/assets/alios.png'),
    extension: 'png',
  });

  const logo2 = workbook.addImage({
    buffer: fs.readFileSync('rapport/alios/assets/camtrack.png'),
    extension: 'png',
  });

  if (excelColum) {
    excelColum.map((item) => {
      dataHeader.push(item.key);
    });
  }

  if (dataHeader.length > 0) {
    if (isExistPath) {
      setTimeout(async () => {
        console.log(`Generating file ${sheet} ...`);
        const readFile = await workbook.xlsx.readFile(path);
        if (readFile) {
          const existWorkSheet = workbook.getWorksheet(sheet);
          if (existWorkSheet) {
            const existWorkSheetName = existWorkSheet.name;
            if (existWorkSheetName === sheet) {
              addRowExistSheet(existWorkSheet, data);
            }
          } else {
            const worksheet = workbook.addWorksheet(sheet, {
              properties: { tabColor: { argb: colorSheet } },
            });

            prepareSheet(worksheet, data, dataHeader, excelColum);

            //Center image header banner depending on number of columns
            addImageBannerHeaderSheet(
              worksheet,
              dataHeader,
              sheet,
              imageId2,
              logo1,
              logo2
            );
          }
          // Export excel generated file
          workbook.xlsx
            .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
            .then((response) => {
              console.log('file generated');
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }, 15000);
    } else {
      console.log(`Generating file ${sheet} ...`);

      // creation of new sheet
      const worksheet = workbook.addWorksheet(sheet, {
        properties: { tabColor: { argb: colorSheet } },
      });

      prepareSheet(worksheet, data, dataHeader, excelColum);

      //Center image header banner depending on number of columns
      addImageBannerHeaderSheet(
        worksheet,
        dataHeader,
        sheet,
        imageId2,
        logo1,
        logo2
      );

      // Export excel generated file
      workbook.xlsx
        .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
        .then((response) => {
          console.log('file generated');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
}

/* async function convertJsonToExcelTotal(data, sheet, path, excelColum, colorSheet) {
  //  console.log(data[0])
  const dataHeader = [];

  const isExistPath = fs.existsSync(path);


  let workbook = new XLSX.Workbook();

  const imageId2 = workbook.addImage({
    buffer: fs.readFileSync('rapport/Total/assets/banner.png'),
    extension: 'png',
  });

  const logo1 = workbook.addImage({
    buffer: fs.readFileSync('rapport/Total/assets/total.png'),
    extension: 'png',
  });

  const logo2 = workbook.addImage({
    buffer: fs.readFileSync('rapport/Total/assets/camtrack-logo.png'),
    extension: 'png',
  });

  if (excelColum) {
    excelColum.map((item) => {
      dataHeader.push(item.key);
    });
  }

  if (dataHeader.length > 0) {
    if (isExistPath) {
      setTimeout(async () => {
        console.log(`Generating file ${sheet} ...`);

        const readFile = await workbook?.xlsx?.readFile(path);
        if (readFile) {
          const existWorkSheet = workbook?.getWorksheet(sheet);

          if (existWorkSheet) {
            const existWorkSheetName = existWorkSheet?.name || '';
            if (existWorkSheetName === sheet) {
              addRowExistSheet(existWorkSheet, data);
            }
          } else {

            const worksheet = workbook.addWorksheet(sheet, {
              properties: { tabColor: { argb: colorSheet } }
            });

            await prepareSheet(worksheet, data, dataHeader, excelColum);

            //Center image header banner depending on number of columns
            addImageBannerHeaderSheet(
              worksheet,
              dataHeader,
              sheet,
              imageId2,
              logo1,
              logo2
            );
          }
          // Export excel generated file
          workbook.xlsx
            .writeFile(path)
            .then((response) => {
              console.log('file generated');
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }, 15000);
    } else {
      console.log(`Generating file ${sheet} ...`);

      // creation of new sheet
      const worksheet = workbook.addWorksheet(sheet, {
        properties: { tabColor: { argb: colorSheet } },
      });

      await prepareSheet(worksheet, data, dataHeader, excelColum);

      //Center image header banner depending on number of columns
      addImageBannerHeaderSheet(
        worksheet,
        dataHeader,
        sheet,
        imageId2,
        logo1,
        logo2
      );

      // Export excel generated file
      workbook.xlsx
        .writeFile(path, { type: 'buffer', bookType: 'xlsx' })
        .then((response) => {
          console.log('file generated');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
} */


async function convertJsonToExcelTotal(data, sheet, path, excelColum, colorSheet) {
  const dataHeader = [];

  if (excelColum) {
    excelColum.forEach((item) => {
      dataHeader.push(item.key);
    });
  }

  if (dataHeader.length === 0) {
    console.warn('Aucune colonne définie pour', sheet);
    return;
  }

  let workbook = new XLSX.Workbook();
  const fileExists = fs.existsSync(path);

  try {
    if (fileExists) {
      console.log(`Lecture du fichier existant: ${path}`);
      try {
        await workbook.xlsx.readFile(path);
      } catch (readError) {
        console.warn('Impossible de lire le fichier existant, création d\'un nouveau:', readError);
        // Continuer avec un nouveau workbook
      }
    }

    // Ajouter les images seulement si le workbook est vide
    const imageId2 = workbook.addImage({
      buffer: fs.readFileSync('rapport/Total/assets/banner.png'),
      extension: 'png',
    });

    const logo1 = workbook.addImage({
      buffer: fs.readFileSync('rapport/Total/assets/total.png'),
      extension: 'png',
    });

    const logo2 = workbook.addImage({
      buffer: fs.readFileSync('rapport/Total/assets/camtrack-logo.png'),
      extension: 'png',
    });

    let worksheet = workbook.getWorksheet(sheet);

    if (worksheet) {
      console.log(`Ajout de données à la feuille existante: ${sheet}`);
      addRowExistSheet(worksheet, data);
    } else {
      console.log(`Création d'une nouvelle feuille: ${sheet}`);
      worksheet = workbook.addWorksheet(sheet, {
        properties: { tabColor: { argb: colorSheet } }
      });

      await prepareSheet(worksheet, data, dataHeader, excelColum);

      // Ajouter les images seulement pour les nouvelles feuilles
      addImageBannerHeaderSheet(
        worksheet,
        dataHeader,
        sheet,
        imageId2,
        logo1,
        logo2
      );
    }

    // Sauvegarder le fichier
    console.log(`Écriture du fichier: ${path}`);
    await workbook.xlsx.writeFile(path);
    console.log(`Fichier généré avec succès: ${sheet}`);

  } catch (error) {
    console.error(`Erreur lors de la génération de ${sheet}:`, error);
    throw error;
  }
}

async function legendeRankingTotal(path, sheet) {
  console.log(`Generating file ${sheet} ...`);

  try {
    const workbook = new XLSX.Workbook();
    const worksheet = workbook.addWorksheet(sheet);
    worksheet.views = [{ showGridLines: true }];

    const criteria = [
      { 'Type de violation': 'Conduite de nuit', Alerte: 1, Alarme: 2 },
      { 'Type de violation': 'Conduite journalière', Alerte: 1, Alarme: 2 },
      { 'Type de violation': 'Conduite continue', Alerte: 1, Alarme: 2 },
      { 'Type de violation': 'Repos journalier', Alerte: 1, Alarme: 2 },
      { 'Type de violation': 'Travail journalier', Alerte: 1, Alarme: 2 },
      { 'Type de violation': 'Excès de Vitesse', Alerte: 1, Alarme: 2 },
      { 'Type de violation': 'Conduite hebdomadaire', Alerte: 1, Alarme: 2 },
      { 'Type de violation': 'Repos hebdomadaire', Alerte: 1, Alarme: 2 },
      { 'Type de violation': 'Travail hebdomadaire', Alerte: 1, Alarme: 2 },
      { 'Type de violation': 'HB', Alerte: 1, Alarme: 2 },
      { 'Type de violation': 'HA', Alerte: 1, Alarme: 2 },
      { 'Type de violation': 'Ceinture de Sécurité', Alerte: 1, Alarme: null },
      { 'Type de violation': 'Téléphone au volant', Alerte: 1, Alarme: null },
      { 'Type de violation': 'Cigarette', Alerte: 1, Alarme: null },
      { 'Type de violation': 'Fatigue', Alerte: 1, Alarme: null }
    ];

    // En-têtes
    const headerRow = worksheet.getRow(5);
    headerRow.getCell(1).value = 'Type de violation';
    headerRow.getCell(2).value = 'Alarme';
    headerRow.getCell(3).value = 'Alerte';

    // Style des en-têtes
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Ajout des données
    criteria.forEach((item, index) => {
      const row = worksheet.getRow(6 + index);
      row.getCell(1).value = item['Type de violation'];
      row.getCell(2).value = item.Alarme !== null ? item.Alarme : '';
      row.getCell(3).value = item.Alerte;

      // Alignement des cellules de données
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    });

    // Fusion des cellules et contenu
    const merges = [
      { range: 'B4:C4', value: 'Pénalité (Retrait de Points)', font: { bold: true } },
      { range: 'A2:C2', value: 'Critère de Perte de Points', font: { bold: true, underline: true } },
      { range: 'E2:H2', value: 'Critère de Calcul du Ratio (Formule)', font: { bold: true, underline: true }, alignment: { horizontal: 'center' } },
      { range: 'E4:H4', value: 'Nombre totale de points perdu sur la période = X ;' },
      { range: 'E5:H5', value: 'Distance totale Parcouru sur la période = Y ;' },
      { range: 'E6:H6', value: 'Ratio (nombres de point perdu au 100 km) = (X/Y)*100 .' },
      { range: 'E9:H9', value: 'Critère de Ranking Chauffeur', font: { bold: true, underline: true } },
      { range: 'E11:H11', value: 'Meilleur Chauffeur = Plus petit ratio.' },
      { range: 'E12:H12', value: 'Pour les Ratio Identiques, Meilleurs chauffeur correspondra à celui avec la plus grande durée de conduite.' }
    ];

    merges.forEach(merge => {
      worksheet.mergeCells(merge.range);
      const cell = worksheet.getCell(merge.range.split(':')[0]);
      cell.value = merge.value;
      if (merge.font) {
        cell.font = { name: 'Arial', size: 11, ...merge.font };
      }
      if (merge.alignment) {
        cell.alignment = { vertical: 'middle', ...merge.alignment };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });

    // Ajustement automatique des colonnes
    autoSizeColumnSheet(worksheet);

    // Sauvegarde du fichier
    await workbook.xlsx.writeFile(path);
    console.log('File generated successfully');

  } catch (err) {
    console.error('Error generating file:', err);
    throw err;
  }
}






module.exports = {
  convertJsonToExcel,
  generateSyntheseSheetAddax,
  perencoXlsx,
  generateSyntheseSheetPerenco,
  guinnessXlsx,
  CotcoXlsx,
  cimencamXlsx,
  generateDashbordSpeedingPerenco,
  KPDCXlsx,
  generateDashbordKPDC,
  razelXlsx,
  razelExesVitesseXlsx,
  razelSynthese,
  DKTSynthese,
  DKTXlsx,
  generateDashbordDKT,
  generateComAlios,
  convertJsonToExcelTotal,
  legendeRankingTotal
};
