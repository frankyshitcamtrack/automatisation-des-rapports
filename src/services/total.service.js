const axios = require('axios');
const { devconfig } = require('../config/wialong.config');
const fs = require('fs');



const token = devconfig.totalToken;
const baseUrl = devconfig.baseUrl;
const ymaneTotalBaseUrl = devconfig.totalYmaneBaseUrl;
const ymaneToken = devconfig.ymaneToken

async function generateSessionId() {
    return await axios.get(
        `${baseUrl}svc=token/login&params={"token":"${token}"}`
    );
}

async function vehicleGroupRessourceId(groupResource, sid) {
    let groupId;

    const vehicleGroup = await axios
        .get(
            `${baseUrl}svc=core/update_data_flags&params={"spec":[{"type":"type","data":"avl_unit_group","flags":1025,"mode":1}]}&sid=${sid}`
        )
        .then((res) => res.data.filter((data) => data.d.nm === groupResource))
        .catch((err) => console.log(err));

    if (vehicleGroup) {

        groupId = vehicleGroup[0].d.id;
    }

    return groupId;
}

async function vehicleRessourceAndTemplateId(
    reportRessource,
    reportTemplate,
    sid
) {
    let ressourceId;
    let reportTemplateId;

    const ressourceTemplate = await axios
        .get(
            `${baseUrl}svc=core/update_data_flags&params={"spec":[{"type":"type","data":"avl_resource","flags":8193,"mode":1}]}&sid=${sid}`
        )
        .then((res) => res.data.filter((data) => data.d.nm === reportRessource))
        .catch((err) => console.log(err));

    if (ressourceTemplate) {
        ressourceId = ressourceTemplate[0]?.d?.id;
        const getReportTemplate = ressourceTemplate[0].d.rep;
        const templateValues = Object.values(getReportTemplate);


        const filtertemplateId = templateValues.filter(
            (data) => data.n === reportTemplate
        );



        if (filtertemplateId) reportTemplateId = filtertemplateId[0].id;
    }
    return { ressourceId, reportTemplateId };
}

async function generateReportDetails(sid, tableIndex, row, level) {
    const report = await axios
        .get(
            `${baseUrl}svc=report/select_result_rows&params={"tableIndex":${tableIndex},"config":{"type":"range","data":{"from":0,"to":${row},"level":${level},"unitInfo":1}}}&sid=${sid}`
        )
        .then((res) => res.data)
        .catch((err) => console.log(err));
    return report;
}

async function generateReportGlobal(
    reportResource,
    reportTemplate,
    reportObject,
    from,
    to,
    subRepport
) {
    let reportResourceId;
    let reportTemplateId;
    let reportObjectId;
    const sid = await generateSessionId()
        .then((res) => res.data.eid)
        .catch((error) => console.log(error));

    if (sid) {
        const reportResourceAndTemplateId = await vehicleRessourceAndTemplateId(
            reportResource,
            reportTemplate,
            sid
        );


        reportObjectId = await vehicleGroupRessourceId(reportObject, sid);
        reportResourceId = reportResourceAndTemplateId.ressourceId;
        reportTemplateId = reportResourceAndTemplateId.reportTemplateId;
    }

    if (reportResourceId && reportTemplateId && reportObjectId) {
        const generateReport = await axios
            .get(
                `${baseUrl}svc=report/exec_report&params={"reportResourceId":${reportResourceId},"reportTemplateId":${reportTemplateId},"reportObjectId":${reportObjectId},"reportObjectSecId":0,"interval":{"from":${from},"to":${to},"flags":0}}&sid=${sid}`
            )
            .then((res) => res.data)
            .catch((err) => console.log(err));

        if (generateReport?.reportResult?.tables) {
            let tableIndex;
            let row;
            let level;
            let group;
            const tables = generateReport.reportResult.tables;

            if (tables.length > 0) {
                if (subRepport) {
                    tableIndex = tables.findIndex((data) => data.label === subRepport);

                    if (tableIndex > -1) {
                        group = tables[tableIndex];
                        row = group.rows + 1;
                        level = group.level + 1;
                    }
                } else {
                    tableIndex = 0;
                    group = tables[tableIndex];
                    row = group.rows + 1;
                    level = group.level + 1;
                }

                const repportDetail = await generateReportDetails(
                    sid,
                    tableIndex,
                    row,
                    level
                );

                cleanRepport(sid);
                return { repportDetail, group };
            }
        }
    }
}

async function cleanRepport(sid) {
    const clean = await axios
        .get(`${baseUrl}svc=core/logout&params={}&sid=${sid}`)
        .then((res) => res.data)
        .catch((err) => console.log(err));
    return clean;
}



async function getTotalAfiliate() {
    const affiliate = await axios
        .get(`${ymaneTotalBaseUrl}/affiliate?key=${ymaneToken}`)
        .then((res) => res.data)
        .catch((err) => console.log(err));
    return affiliate;
}


async function getTotalTransporter() {
    const transporter = await axios
        .get(`${ymaneTotalBaseUrl}/transporter?key=${ymaneToken}`)
        .then((res) => res.data)
        .catch((err) => console.log(err));
    return transporter;
}

async function getTotalTrucks() {
    const trucks = await axios
        .get(`${ymaneTotalBaseUrl}/trucks?key=${ymaneToken}`)
        .then((res) => res.data)
        .catch((err) => console.log(err));
    return trucks;
}


async function getTotalNigths(startOfDay, endofDay) {
    const trucks = await axios
        .post(`${ymaneTotalBaseUrl}/nights?key=${ymaneToken}&startime=${startOfDay}&endtime=${endofDay}`)
        .then((res) => res.data)
        .catch((err) => console.log(err));
    return trucks;
}


async function getPIO() {
    const filePath = 'src/storage/POI-TOTAL-CAMEROUN.geojson'
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const geoJSON = JSON.parse(data)?.features.map(item => item.properties.Name.trim());
        return geoJSON

    } catch (error) {
        console.error('Erreur de lecture:', error);
        return null;
    }

}

async function summaryTrip(startOfDay, endofDay) {
    const summaryTrip = await axios
        .post(`${ymaneTotalBaseUrl}/summarytrip?key=${ymaneToken}&startime=${startOfDay}&endtime=${endofDay}`)
        .then((res) => res.data)
        .catch((err) => console.log(err));
    return summaryTrip;
}

async function summaryException(startOfDay, endofDay) {
    const summaryException = await axios
        .post(`${ymaneTotalBaseUrl}/summaryexception?key=${ymaneToken}&startime=${startOfDay}&endtime=${endofDay}`)
        .then((res) => res.data)
        .catch((err) => console.log(err));
    return summaryException;
}

async function allExceptionType() {
    const allExceptionType = await axios
        .get(`${ymaneTotalBaseUrl}/allexceptiontype`)
        .then((res) => res.data)
        .catch((err) => console.log(err));
    return allExceptionType;
}


async function getpreventreposhebdo(nbrdays, sumaryordetails) {
    const reposHebdo = await axios
        .get(`${ymaneTotalBaseUrl}/preventreposhebdo?key=${ymaneToken}&nbrdays=${nbrdays}&sumaryordetails=${sumaryordetails}`)
        .then((res) => res.data)
        .catch((err) => console.log(err));
    return reposHebdo;
}


async function getpreventTestreposhebdo(nbrdays, sumaryordetails) {
    const reposHebdo = await axios
        .get(`${ymaneTotalBaseUrl}/testpreventreposhebdo?key=${ymaneToken}&nbrdays=${nbrdays}&sumaryordetails=${sumaryordetails}`)
        .then((res) => res.data)
        .catch((err) => console.log(err));
    return reposHebdo;
}

async function getTotalDrivers() {
    const drivers = await axios
        .get(`${ymaneTotalBaseUrl}/drivers?key=${ymaneToken}`)
        .then((res) => res.data)
        .catch((err) => console.log(err));
    return drivers;
}

async function getLastDriving() {
    const lastDayDriving = await axios
        .get(`${ymaneTotalBaseUrl}/lastdaydriving?key=${ymaneToken}`)
        .then((res) => res.data)
        .catch((err) => console.log(err));
    return lastDayDriving;
}


async function getLastDayTransporter() {
    const lastDayTransporter = await axios
        .get(`${ymaneTotalBaseUrl}/lastdaytransporter?key=${ymaneToken}`)
        .then((res) => res.data)
        .catch((err) => console.log(err));
    return lastDayTransporter;
}


module.exports = {
    generateSessionId,
    vehicleGroupRessourceId,
    generateReportGlobal,
    cleanRepport,
    getTotalAfiliate,
    getTotalTransporter,
    getTotalTrucks,
    getPIO,
    getTotalNigths,
    summaryTrip,
    summaryException,
    allExceptionType,
    getTotalDrivers,
    getpreventreposhebdo,
    getLastDriving,
    getpreventTestreposhebdo,
    getLastDayTransporter
};
