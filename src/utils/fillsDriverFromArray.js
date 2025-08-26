function compensateDrivers(arr1, arr2) {

    // Fonction de normalisation robuste du Grouping
    const normalize = (str) => str
        .toString()
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '')        // supprime tous les espaces
        .replace(/[^A-Z0-9]/g, ''); // supprime tout sauf lettres/chiffres

    // Créer une map à partir de arr2 : grouping normalisé → conducteur
    const driverMap = new Map();

    arr2.forEach(item => {
        const key = normalize(item.Grouping);
        const driver = item.Conducteur;

        // Ne stocker que si le conducteur est non vide
        if (driver && driver.trim() !== '' && driver !== '--' && driver !== '-') {
            driverMap.set(key, driver.trim());
        }
    });

    // Parcourir arr1 et compléter uniquement le conducteur s'il est vide
    return arr1.map(item => {
        const key = normalize(item.Grouping);
        const currentDriver = item.Conducteur;


        // Vérifier si le conducteur est vide
        const isEmpty = !currentDriver || currentDriver.trim() === '' || currentDriver === '--' || currentDriver === '-';

        if (isEmpty && driverMap.has(key)) {
            return {
                ...item,
                Conducteur: driverMap.get(key)  // ← seul champ modifié
            };
        }

        // Sinon, on garde l'objet tel quel
        return item;
    });
}





module.exports = { compensateDrivers }