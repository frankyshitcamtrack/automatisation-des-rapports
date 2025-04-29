const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

function validatePrivateKey(key) {
  if (!key) throw new Error('Aucune clé privée fournie');
  if (!key.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('Format de clé privée invalide');
  }
}

async function getData(group, col) {
  try {
    // Vérification et formatage de la clé privée
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    validatePrivateKey(privateKey);
    
    const formattedKey = privateKey
      .replace(/\\n/g, '\n')
      .replace(/"/g, '')
      .trim();

    // Configuration de l'authentification
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Accès au document
    const doc = new GoogleSpreadsheet(
      "1arVJYZUYzeA1O1O715p-i-_HcYItHPoAkoplUsU3Wq8",
      serviceAccountAuth
    );

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    if (!rows || rows.length === 0) {
      throw new Error('Aucune donnée trouvée dans la feuille');
    }

    const filteredRows = rows.filter((item) => 
      item._rawData && item._rawData.includes(group)
    );

    if (!filteredRows || filteredRows.length === 0) {
      throw new Error(`Aucune ligne ne correspond au groupe "${group}"`);
    }

    const rowNumber = filteredRows[0]._rowNumber;
    await sheet.loadCells(`A${rowNumber}:${col}${rowNumber}`);

    const cell = sheet.getCellByA1(`${col}${rowNumber}`);
    
    if (!cell._rawData?.effectiveValue?.stringValue) {
      throw new Error(`La cellule ${col}${rowNumber} ne contient pas de valeur texte valide`);
    }

    return cell._rawData.effectiveValue.stringValue.split(';');

  } catch (error) {
    console.error('Erreur dans getData:', error.message);
    throw error;
  }
}

module.exports = { getData };