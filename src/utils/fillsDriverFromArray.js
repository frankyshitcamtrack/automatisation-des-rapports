function compensateDrivers(arr1, arr2) {
    // === 1. Fonction de normalisation robuste du grouping
    const normalize = (str) => str
        .toString()
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '')        // supprime tous les espaces
        .replace(/[^A-Z0-9]/g, ''); // supprime tout sauf lettres/chiffres

    // === 2. Créer une map de référence à partir de arr2 : grouping → { Conducteur, emplacement }
    const referenceMap = new Map();

    arr2.forEach(item => {
        const grouping = item.grouping || item.Grouping; // gère les majuscules
        if (!grouping) return;

        const key = normalize(grouping);

        const conducteur = item.Conducteur;
        const emplacement = item.emplacement || item.Emplacement;

        // On stocke même si un des deux est vide, pour ne pas perdre d'info
        const validDriver = conducteur &&
            typeof conducteur === 'string' &&
            conducteur.trim() !== '' &&
            !['--', '-', 'inconnu', 'n/a'].includes(conducteur.trim().toLowerCase());

        const validLocation = emplacement &&
            typeof emplacement === 'string' &&
            emplacement.trim() !== '' &&
            !['--', '-', 'inconnu', 'n/a'].includes(emplacement.trim().toLowerCase());

        // On stocke les valeurs nettoyées ou null si invalides
        referenceMap.set(key, {
            Conducteur: validDriver ? conducteur.trim() : null,
            emplacement: validLocation ? emplacement.trim() : null
        });
    });

    // === 3. Parcourir arr1 et compléter ce qui est manquant
    return arr1.map(item => {
        let newItem = { ...item }; // copie de l'objet
        const grouping = item.grouping || item.Grouping;

        if (!grouping) {
            return newItem; // rien à faire sans grouping
        }

        const key = normalize(grouping);
        const reference = referenceMap.get(key);

        if (!reference) {
            return newItem; // pas de référence pour ce grouping
        }

        const currentDriver = item.Conducteur;
        const currentLocation = item.emplacement || item.Emplacement;

        // --- Corriger Conducteur si vide ou invalide ---
        const isEmptyDriver = !currentDriver ||
            typeof currentDriver !== 'string' ||
            currentDriver.trim() === '' ||
            ['--', '-', 'inconnu', 'n/a'].includes(currentDriver.trim().toLowerCase());

        if (isEmptyDriver && reference.Conducteur) {
            newItem.Conducteur = reference.Conducteur;
        }

        // --- Corriger emplacement si vide ou invalide ---
        const isEmptyLocation = !currentLocation ||
            typeof currentLocation !== 'string' ||
            currentLocation.trim() === '' ||
            ['--', '-', 'inconnu', 'n/a'].includes(currentLocation.trim().toLowerCase());

        if (isEmptyLocation && reference.emplacement) {
            newItem.emplacement = reference.emplacement;
        }

        return newItem;
    });
}


module.exports = { compensateDrivers }