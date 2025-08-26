
function filtrerExceptions(exceptionsArray) {
    const nomsRecherches = new Set([
        'Night Driving',
        'Weekly Drive',
        'Weekly Rest',
        'Weekly Work',
        'Harsh Braking',
        'Harsh Acceleration',
        'Phone Call',
        'Smoking',
        'No SeatBelt',
        'Fatigue',
        'Distraction'
        // Les autres ('Continuous Drive', 'Daily Rest', etc.) sont retirés car non utilisés
    ]);

    return exceptionsArray.filter(exception => nomsRecherches.has(exception.nm));
}

function analyzeDrivers(drivers, exceptions, exceptionsSummary, tripsSummary) {
    // === 1. Map des chauffeurs
    const driversMap = {};
    drivers.forEach(driver => {
        driversMap[driver.drivid] = {
            name: driver.drivnm
        };
    });


    // === 2. Filtrer les exceptions pertinentes
    const filteredExceptions = filtrerExceptions(exceptions);

    // === 3. Map exceptionid → exception (pour accès rapide)
    const exceptionById = {};
    filteredExceptions.forEach(ex => {
        exceptionById[ex.exceptionid] = ex;
    });

    // === 4. Map ID → catégorie
    const categoryMap = {
        4: 'nightDriving',           // Night Driving
        9: 'weeklyDrive',            // Weekly Drive
        8: 'weeklyRest',             // Weekly Rest
        17: 'weeklyWork',            // Weekly Work
        3: 'harshBraking',           // Harsh Braking
        2: 'harshAcceleration',      // Harsh Acceleration
        10: 'phoneCall',             // Phone Call
        15: 'smoking',               // Smoking
        11: 'seatBelt',              // No SeatBelt
        13: 'fatigue',               // Fatigue
        20: 'distraction'            // Distraction
    };

    // === 5. Initialiser les stats pour tous les chauffeurs
    const driverStats = {};
    Object.keys(driversMap).forEach(driverId => {
        driverStats[driverId] = {
            points: 0,
            nightDrivingAlert: 0, nightDrivingAlarm: 0,
            weeklyDriveAlert: 0, weeklyDriveAlarm: 0,
            weeklyRestAlert: 0, weeklyRestAlarm: 0,
            weeklyWorkAlert: 0, weeklyWorkAlarm: 0,
            harshBrakingAlert: 0, harshBrakingAlarm: 0,
            harshAccelerationAlert: 0, harshAccelerationAlarm: 0,
            phoneCall: 0,
            smoking: 0,
            seatBelt: 0,
            fatigue: 0,
            distraction: 0
        };
    });

    // === 6. Remplir les stats à partir de exceptionsSummary
    exceptionsSummary.forEach(ex => {
        const driverId = String(ex.driverid);
        const exceptionId = ex.alertid;
        const level = ex.level;  // 1 = alert, 2 = alarm
        const count = ex.nbrexep || 0;

        if (!driversMap[driverId]) return;
        if (!driverStats[driverId]) return;

        const stat = driverStats[driverId];
        const exception = exceptionById[exceptionId];

        // === Ajouter les points
        if (exception) {
            const points = level === 1 ? exception.sanctionsalert : exception.sanctionsalarm;
            stat.points += points * count;
        }

        // === Fonction utilitaire pour ajouter alert/alarm
        const addCount = (baseName, cnt) => {
            const key = level === 1 ? `${baseName}Alert` : `${baseName}Alarm`;
            stat[key] = (stat[key] || 0) + cnt;
        };

        // === Compter par catégorie
        const category = categoryMap[exceptionId];
        if (!category) return;

        switch (category) {
            case 'nightDriving':
            case 'weeklyDrive':
            case 'weeklyRest':
            case 'weeklyWork':
            case 'harshBraking':
            case 'harshAcceleration':
                addCount(category, count);
                break;
            case 'phoneCall':
            case 'smoking':
            case 'seatBelt':
            case 'fatigue':
            case 'distraction':
                stat[category] = (stat[category] || 0) + count;
                break;
        }
    });

    // === 7. Map des trajets
    const tripsPerDriver = {};
    tripsSummary.forEach(trip => {
        const driverId = String(trip.driverid);
        tripsPerDriver[driverId] = {
            distance: trip.totdist != null ? parseFloat(trip.totdist) : 0,
            duration: trip.dur != null ? parseFloat(trip.dur) : 0
        };
    });

    // === 8. Construire les résultats
    const activeResults = [];
    const inactiveResults = [];

    Object.keys(driversMap).forEach(driverId => {
        const driver = driversMap[driverId];
        const stats = driverStats[driverId];
        const tripInfo = tripsPerDriver[driverId] || { distance: 0, duration: 0 };

        const distance = tripInfo.distance || 0;
        const duration = tripInfo.duration || 0;

        // === Déterminer si actif
        const isActive = distance > 0;

        // Calcul du ratio (si actif)
        const ratio = isActive ? stats.points / distance : Infinity;

        const baseResult = {
            Driver: driver.name,
            ...stats,
            "Distance totale Parcouru sur la période": isActive ? parseFloat(distance.toFixed(3)) : "--",
            "Durée de Conduite sur la période": isActive ? duration : "--",
            "Ratio": isActive ? parseFloat(ratio.toFixed(4)) : "--",
            "driverId": parseInt(driverId)
        };

        if (isActive) {
            activeResults.push(baseResult);
        } else {
            // Pour les inactifs : remplacer aussi les stats par "--" ?
            // Option : garder les stats à 0 mais afficher "--" pour les métriques clés
            // Ici, on garde les stats internes, mais on remplace les affichages
            const inactiveDisplay = {
                ...baseResult,
                points: "--",
                nightDrivingAlert: "--", nightDrivingAlarm: "--",
                weeklyDriveAlert: "--", weeklyDriveAlarm: "--",
                weeklyRestAlert: "--", weeklyRestAlarm: "--",
                weeklyWorkAlert: "--", weeklyWorkAlarm: "--",
                harshBrakingAlert: "--", harshBrakingAlarm: "--",
                harshAccelerationAlert: "--", harshAccelerationAlarm: "--",
                phoneCall: "--", smoking: "--", seatBelt: "--", fatigue: "--", distraction: "--"
            };
            inactiveResults.push(inactiveDisplay);
        }
    });

    // === 9. Trier les actifs : ratio croissant, puis durée décroissante
    activeResults.sort((a, b) => {
        if (a.Ratio !== b.Ratio) {
            return a.Ratio - b.Ratio;
        }
        return b["Durée de Conduite sur la période"] - a["Durée de Conduite sur la période"];
    });

    // === 10. Ajouter le classement aux actifs
    activeResults.forEach((r, i) => {
        r.Ranking = i + 1;
    });

    // === 11. Classement pour les inactifs : à partir du dernier actif + 1
    const lastRank = activeResults.length;
    inactiveResults.forEach((r, i) => {
        r.Ranking = lastRank + 1 + i;
    });

    // === 12. Fusionner : actifs d'abord, inactifs après
    const allResults = [...activeResults, ...inactiveResults];

    // === 13. Fonction de formatage de durée
    function formatDuration(hours) {
        if (hours === "--") return "--";
        const totalSeconds = Math.floor(hours * 3600);
        const days = Math.floor(totalSeconds / (24 * 3600));
        const hoursRemain = Math.floor((totalSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${days}Jrs ${String(hoursRemain).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}Min ${String(seconds).padStart(2, '0')}Sec`;
    }

    // === 14. Générer detailedResults
    const detailedResults = allResults.map(r => ({
        Driver: r.Driver,
        "Nombres d'Alertes Conduite de nuit": r.nightDrivingAlert,
        "Nombres d'Alarme Conduite de nuit": r.nightDrivingAlarm,
        "Nombres d'Alertes conduite hebdomadaire": r.weeklyDriveAlert,
        "Nombres d'Alarme conduite hebdomadaire": r.weeklyDriveAlarm,
        "Nombres d'Alertes Repos hebdomadaire": r.weeklyRestAlert,
        "Nombres d'Alarme Repos hebdomadaire": r.weeklyRestAlarm,
        "Nombres d'Alertes Travail hebdomadaire": r.weeklyWorkAlert,
        "Nombres d'Alarme Travail hebdomadaire": r.weeklyWorkAlarm,
        "Nombres d'Alertes HB": r.harshBrakingAlert,
        "Nombres d'Alarme HB": r.harshBrakingAlarm,
        "Nombres d'Alertes HA": r.harshAccelerationAlert,
        "Nombres d'Alarme HA": r.harshAccelerationAlarm,
        "Nombres de Téléphone au volant": r.phoneCall,
        "Nombres de smoking": r.smoking,
        "Nombres de Ceinture de Sécurité": r.seatBelt,
        "Nombres de fatigues": r.fatigue,
        "Nombres de distraction": r.distraction,
        "Nombre totale de points perdu sur la période": r.points,
        "Distance totale Parcouru sur la période": r["Distance totale Parcouru sur la période"],
        "Durée de Conduite sur la période": formatDuration(r["Durée de Conduite sur la période"]),
        "Ratio": r.Ratio,
        "Ranking": r.Ranking
    }));

    // === 15. Classement simplifié
    const rankingOnly = allResults.map(r => ({
        Driver: r.Driver,
        Ranking: r.Ranking
    }));

    return {
        detailedResults,
        rankingOnly
    };
}
module.exports = { analyzeDrivers }
