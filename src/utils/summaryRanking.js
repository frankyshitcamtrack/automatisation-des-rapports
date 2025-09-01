
function filtrerExceptions(exceptionsArray) {
    const nomsRecherches = new Set([
        'Night Driving',
        'Weekly Drive',
        'Weekly Rest',
        'Weekly Work',
        'Daily Work',
        'Continuous Drive',
        'Harsh Braking',
        'Harsh Acceleration',
        'Phone Call',
        'Smoking',
        'No SeatBelt',
        'Fatigue',
        'Distraction'
    ]);

    return exceptionsArray.filter(exception => nomsRecherches.has(exception.nm));
}

function analyzeDrivers(drivers, exceptions, exceptionsSummary, tripsSummary, transporteurs) {

    const driversMap = {};
    drivers.forEach(driver => {
        driversMap[driver.drivid] = { name: driver.drivnm, trpid: driver.trpid };
    });


    const filteredExceptions = filtrerExceptions(exceptions);

    const exceptionById = {};
    filteredExceptions.forEach(ex => {
        exceptionById[ex.exceptionid] = ex;
    });


    const categoryMap = {
        4: 'nightDriving',
        9: 'weeklyDrive',
        8: 'weeklyRest',
        17: 'weeklyWork',
        16: 'dailyWork',
        5: 'continuousDrive',
        3: 'harshBraking',
        2: 'harshAcceleration',
        10: 'phoneCall',
        15: 'smoking',
        11: 'seatBelt',
        13: 'fatigue',
        20: 'distraction'
    };


    const driverStats = {};
    Object.keys(driversMap).forEach(driverId => {
        driverStats[driverId] = {
            points: 0,
            nightDrivingAlert: 0, nightDrivingAlarm: 0,
            weeklyDriveAlert: 0, weeklyDriveAlarm: 0,
            weeklyRestAlert: 0, weeklyRestAlarm: 0,
            weeklyWorkAlert: 0, weeklyWorkAlarm: 0,
            dailyWorkAlert: 0, dailyWorkAlarm: 0,
            continuousDriveAlert: 0, continuousDriveAlarm: 0,
            harshBrakingAlert: 0, harshBrakingAlarm: 0,
            harshAccelerationAlert: 0, harshAccelerationAlarm: 0,
            phoneCall: 0,
            smoking: 0,
            seatBelt: 0,
            fatigue: 0,
            distraction: 0
        };
    });


    exceptionsSummary.forEach(ex => {
        const driverId = String(ex.driverid);
        const exceptionId = ex.alertid;
        const level = ex.level;
        const count = ex.nbrexep || 0;

        if (!driversMap[driverId]) return;
        const stat = driverStats[driverId];
        if (!stat) return;

        const exception = exceptionById[exceptionId];
        if (exception) {
            const points = level === 1 ? exception.sanctionsalert : exception.sanctionsalarm;
            stat.points += points * count;
        }

        const addCount = (baseName, cnt) => {
            const key = level === 1 ? `${baseName}Alert` : `${baseName}Alarm`;
            stat[key] = (stat[key] || 0) + cnt;
        };

        const category = categoryMap[exceptionId];
        if (!category) return;

        const alertAlarmCategories = [
            'nightDriving', 'weeklyDrive', 'weeklyRest', 'weeklyWork',
            'dailyWork', 'continuousDrive', 'harshBraking', 'harshAcceleration'
        ];

        if (alertAlarmCategories.includes(category)) {
            addCount(category, count);
        } else {
            stat[category] = (stat[category] || 0) + count;
        }
    });


    const tripsPerDriver = {};
    tripsSummary.forEach(trip => {
        const driverId = String(trip.driverid);
        tripsPerDriver[driverId] = {
            distance: parseFloat(trip.totdist) || 0,
            duration: parseFloat(trip.dur) || 0
        };
    });


    const allDriverResults = [];

    Object.keys(driversMap).forEach(driverId => {
        const driver = driversMap[driverId];
        const stats = driverStats[driverId];
        const tripInfo = tripsPerDriver[driverId] || { distance: 0, duration: 0 };

        const distance = tripInfo.distance;
        const duration = tripInfo.duration;
        const isActive = distance > 0;
        const ratio = isActive ? stats.points / distance : 0;

        allDriverResults.push({
            Driver: driver.name.trim(),
            ...stats,
            "Distance totale Parcouru sur la période": distance,
            "Durée de Conduite sur la période": duration,
            "Ratio": ratio,
            driverId: parseInt(driverId),
            trpid: driver.trpid,
            isActive
        });
    });


    const mergedResultsMap = {};

    allDriverResults.forEach(result => {
        const name = result.Driver;

        if (!mergedResultsMap[name]) {
            mergedResultsMap[name] = { ...result };
            Object.keys(mergedResultsMap[name]).forEach(key => {
                if (typeof mergedResultsMap[name][key] === 'number' && key !== 'driverId') {
                    mergedResultsMap[name][key] = 0;
                }
            });
            mergedResultsMap[name].driverIds = [];
        }

        const merged = mergedResultsMap[name];
        Object.keys(result).forEach(key => {
            if (typeof result[key] === 'number' && key !== 'driverId') {
                merged[key] += result[key];
            }
        });
        merged.driverIds.push(result.driverId);
    });

    const mergedResults = Object.values(mergedResultsMap);


    const activeResults = [];
    const inactiveResults = [];

    mergedResults.forEach(result => {
        const distance = result["Distance totale Parcouru sur la période"];
        const isActive = distance > 0;
        const totalPoints = result.points;
        const ratio = isActive ? parseFloat((totalPoints / distance).toFixed(4)) : 0;

        if (isActive) {
            activeResults.push({
                Driver: result.Driver,
                ...result,
                "Ratio": ratio,
                "Distance totale Parcouru sur la période": parseFloat(distance.toFixed(3)),
                "Durée de Conduite sur la période": result["Durée de Conduite sur la période"]
            });
        } else {
            inactiveResults.push({
                Driver: result.Driver,
                points: "--",
                nightDrivingAlert: "--", nightDrivingAlarm: "--",
                weeklyDriveAlert: "--", weeklyDriveAlarm: "--",
                weeklyRestAlert: "--", weeklyRestAlarm: "--",
                weeklyWorkAlert: "--", weeklyWorkAlarm: "--",
                dailyWorkAlert: "--", dailyWorkAlarm: "--",
                continuousDriveAlert: "--", continuousDriveAlarm: "--",
                harshBrakingAlert: "--", harshBrakingAlarm: "--",
                harshAccelerationAlert: "--", harshAccelerationAlarm: "--",
                phoneCall: "--", smoking: "--", seatBelt: "--", fatigue: "--", distraction: "--",
                "Distance totale Parcouru sur la période": "--",
                "Durée de Conduite sur la période": "--",
                "Ratio": "--"
            });
        }
    });


    activeResults.sort((a, b) => {
        if (a.Ratio !== b.Ratio) return a.Ratio - b.Ratio;
        return b["Durée de Conduite sur la période"] - a["Durée de Conduite sur la période"];
    });

    activeResults.forEach((r, i) => r.Ranking = i + 1);
    inactiveResults.forEach((r, i) => r.Ranking = activeResults.length + 1 + i);

    const allResults = [...activeResults, ...inactiveResults];


    function formatDuration(hours) {
        if (hours === "--") return "--";
        const totalSeconds = Math.floor(hours * 3600);
        const days = Math.floor(totalSeconds / 86400);
        const h = Math.floor((totalSeconds % 86400) / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${days}Jrs ${String(h).padStart(2, '0')}H ${String(m).padStart(2, '0')}Min ${String(s).padStart(2, '0')}Sec`;
    }

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
        "Nombres d'Alertes Travail journalier": r.dailyWorkAlert,
        "Nombres d'Alarme Travail journalier": r.dailyWorkAlarm,
        "Nombres d'Alertes Conduite continue": r.continuousDriveAlert,
        "Nombres d'Alarme Conduite continue": r.continuousDriveAlarm,
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
        "Distance totale Parcouru sur la période (km)": r["Distance totale Parcouru sur la période"],
        "Durée de Conduite sur la période": formatDuration(r["Durée de Conduite sur la période"]),
        "Durée de Conduite sur la période en heure": r["Durée de Conduite sur la période"],
        "Ratio": r.Ratio,
        "Ranking": r.Ranking
    }));


    const rankingOnly = allResults.map(r => ({
        Ranking: r.Ranking,
        Driver: r.Driver,
        "Nombre de points perdus au 100km": (r.Ratio === 0 || parseFloat(r.Ratio)) ? parseFloat((r.Ratio * 100).toFixed(2)) : '--',
    }));


    const carriersMap = {};
    transporteurs.forEach(carrier => {
        carriersMap[carrier.trpid] = carrier.nm;
    });


    const carrierStats = {};

    mergedResults.forEach(result => {
        const driverData = drivers.find(d => String(d.drivid) === String(result.driverId));
        if (!driverData || !driverData.trpid) return;

        const trpid = driverData.trpid;
        const carrierName = carriersMap[trpid];
        if (!carrierName) return;

        if (!carrierStats[trpid]) {
            carrierStats[trpid] = {
                trpid,
                carrierName,
                points: 0,
                nightDrivingAlert: 0, nightDrivingAlarm: 0,
                weeklyDriveAlert: 0, weeklyDriveAlarm: 0,
                weeklyRestAlert: 0, weeklyRestAlarm: 0,
                weeklyWorkAlert: 0, weeklyWorkAlarm: 0,
                dailyWorkAlert: 0, dailyWorkAlarm: 0,
                continuousDriveAlert: 0, continuousDriveAlarm: 0,
                harshBrakingAlert: 0, harshBrakingAlarm: 0,
                harshAccelerationAlert: 0, harshAccelerationAlarm: 0,
                phoneCall: 0,
                smoking: 0,
                seatBelt: 0,
                fatigue: 0,
                distraction: 0,
                totalDistance: 0,
                totalDuration: 0,
                driverCount: 0
            };
        }

        const carrier = carrierStats[trpid];

        Object.keys(result).forEach(key => {
            if (typeof result[key] === 'number' && !['driverId', 'Ranking', 'isActive'].includes(key)) {
                carrier[key] = (carrier[key] || 0) + result[key];
            }
        });

        carrier.totalDistance += result["Distance totale Parcouru sur la période"];
        carrier.totalDuration += result["Durée de Conduite sur la période"];
        carrier.driverCount++;
    });

    const carrierResults = Object.values(carrierStats);

    const activeCarriers = [];
    const inactiveCarriers = [];

    carrierResults.forEach(carrier => {
        const isActive = carrier.totalDistance > 0;
        const ratio = isActive ? parseFloat((carrier.points / carrier.totalDistance).toFixed(4)) : 0;

        if (isActive) {
            activeCarriers.push({
                ...carrier,
                Ratio: ratio,
                "Distance totale Parcouru sur la période": parseFloat(carrier.totalDistance.toFixed(3)),
                "Durée de Conduite sur la période": carrier.totalDuration,
                Ranking: 0
            });
        } else {
            inactiveCarriers.push({
                ...carrier,
                points: "--",
                nightDrivingAlert: "--", nightDrivingAlarm: "--",
                weeklyDriveAlert: "--", weeklyDriveAlarm: "--",
                weeklyRestAlert: "--", weeklyRestAlarm: "--",
                weeklyWorkAlert: "--", weeklyWorkAlarm: "--",
                dailyWorkAlert: "--", dailyWorkAlarm: "--",
                continuousDriveAlert: "--", continuousDriveAlarm: "--",
                harshBrakingAlert: "--", harshBrakingAlarm: "--",
                harshAccelerationAlert: "--", harshAccelerationAlarm: "--",
                phoneCall: "--", smoking: "--", seatBelt: "--", fatigue: "--", distraction: "--",
                "Distance totale Parcouru sur la période": "--",
                "Durée de Conduite sur la période": "--",
                "Ratio": "--",
                Ranking: 0
            });
        }
    });


    activeCarriers.sort((a, b) => {
        if (a.Ratio !== b.Ratio) return a.Ratio - b.Ratio;
        return b.totalDuration - a.totalDuration;
    });


    activeCarriers.forEach((c, i) => c.Ranking = i + 1);
    inactiveCarriers.forEach((c, i) => c.Ranking = activeCarriers.length + 1 + i);

    const allCarrierResults = [...activeCarriers, ...inactiveCarriers];


    const detailedResultsByCarrier = allCarrierResults.map(c => ({
        Transporteur: c.carrierName,
        "Nombres d'Alertes Conduite de nuit": c.nightDrivingAlert,
        "Nombres d'Alarme Conduite de nuit": c.nightDrivingAlarm,
        "Nombres d'Alertes conduite hebdomadaire": c.weeklyDriveAlert,
        "Nombres d'Alarme conduite hebdomadaire": c.weeklyDriveAlarm,
        "Nombres d'Alertes Repos hebdomadaire": c.weeklyRestAlert,
        "Nombres d'Alarme Repos hebdomadaire": c.weeklyRestAlarm,
        "Nombres d'Alertes Travail hebdomadaire": c.weeklyWorkAlert,
        "Nombres d'Alarme Travail hebdomadaire": c.weeklyWorkAlarm,
        "Nombres d'Alertes Travail journalier": c.dailyWorkAlert,
        "Nombres d'Alarme Travail journalier": c.dailyWorkAlarm,
        "Nombres d'Alertes Conduite continue": c.continuousDriveAlert,
        "Nombres d'Alarme Conduite continue": c.continuousDriveAlarm,
        "Nombres d'Alertes HB": c.harshBrakingAlert,
        "Nombres d'Alarme HB": c.harshBrakingAlarm,
        "Nombres d'Alertes HA": c.harshAccelerationAlert,
        "Nombres d'Alarme HA": c.harshAccelerationAlarm,
        "Nombres de Téléphone au volant": c.phoneCall,
        "Nombres de smoking": c.smoking,
        "Nombres de Ceinture de Sécurité": c.seatBelt,
        "Nombres de fatigues": c.fatigue,
        "Nombres de distraction": c.distraction,
        "Nombre totale de points perdu sur la période": c.points,
        "Distance totale Parcouru sur la période (km)": c["Distance totale Parcouru sur la période"],
        "Durée de Conduite sur la période": formatDuration(c["Durée de Conduite sur la période"]),
        "Durée de Conduite sur la période en heure": c["Durée de Conduite sur la période"],
        "Ratio": c.Ratio,
        //"Nombre de chauffeurs": c.driverCount,
        "Ranking": c.Ranking
    }));


    const rankingOnlyByCarrier = allCarrierResults.map(c => ({
        Ranking: c.Ranking,
        Transporteur: c.carrierName,
        "Nombre de points perdus au 100km": (c.Ratio === 0 || parseFloat(c.Ratio)) ? parseFloat((c.Ratio * 100).toFixed(2)) : '--',
        "Nombre de chauffeurs": c.driverCount
    }));



    return {
        detailedResults,
        rankingOnly,
        detailedResultsByCarrier,
        rankingOnlyByCarrier
    };
}

module.exports = { analyzeDrivers }
