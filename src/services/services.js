const axios = require('axios');
const { devconfig } = require('../config/wialong.config');

const token = devconfig.token;
const baseUrl = devconfig.baseUrl

async function generateSessionId() {
    return await axios.get(`${baseUrl}svc=token/login&params={"token":"${token}"}`)
}



async function vehicleGroupRessourceId(groupResource, sid) {
    let groupId;

    const vehicleGroup = await axios.get(`${baseUrl}svc=core/update_data_flags&params={"spec":[{"type":"type","data":"avl_unit_group","flags":1025,"mode":1}]}&sid=${sid}`)
        .then(res => res.data.filter(data => data.d.nm === groupResource))
        .catch(err => console.log(err));

    if (vehicleGroup) {
        groupId = vehicleGroup[0].d.id;
    }

    return groupId;

}

 
async function vehicleRessourceAndTemplateId(reportRessource,reportTemplate, sid) {
    let ressourceId;
    let reportTemplateId;

    const ressourceTemplate = await axios.get(`${baseUrl}svc=core/update_data_flags&params={"spec":[{"type":"type","data":"avl_resource","flags":8193,"mode":1}]}&sid=${sid}`)
        .then(res => res.data.filter(data => data.d.nm === reportRessource))
        .catch(err => console.log(err));

    if (ressourceTemplate) {
        ressourceId = ressourceTemplate[0].d.id;
        const getReportTemplate = ressourceTemplate[0].d.rep
        const templateValues = Object.values(getReportTemplate);
        const filtertemplateId = templateValues.filter(data => data.n === reportTemplate);
        reportTemplateId = filtertemplateId[0].id;
    }
    return {ressourceId,reportTemplateId};
}


async function generateReportDetails(sid,tableIndex,row,level) {
    const report = await axios.get(`${baseUrl}svc=report/select_result_rows&params={"tableIndex":${tableIndex},"config":{"type":"range","data":{"from":0,"to":${row},"level":${level},"unitInfo":1}}}&sid=${sid}`)
        .then(res => res.data)
        .catch(err => console.log(err));
    return report;

}


async function generateReportGlobal(reportResource, reportTemplate, reportObject, from, to, subRepport) {
    let reportResourceId;
    let reportTemplateId;
    let reportObjectId;
    let group;
    const sid = await generateSessionId()
        .then(res => res.data.eid)
        .catch(error => console.log(error));

    if (sid) {
        const reportResourceAndTemplateId = await vehicleRessourceAndTemplateId(reportResource, reportTemplate, sid);

        reportObjectId = await vehicleGroupRessourceId(reportObject, sid);
        reportResourceId = reportResourceAndTemplateId.ressourceId;
        reportTemplateId = reportResourceAndTemplateId.reportTemplateId;
    }

    if (reportResourceId && reportTemplateId && reportObjectId) {
        const generateReport = await axios.get(`${baseUrl}svc=report/exec_report&params={"reportResourceId":${reportResourceId},"reportTemplateId":${reportTemplateId},"reportObjectId":${reportObjectId},"reportObjectSecId":0,"interval":{"from":${from},"to":${to},"flags":0}}&sid=${sid}`)
            .then(res => res.data)
            .catch(err => console.log(err))

        if (generateReport) {
            let tableIndex;
            let row;
            let level;
            let group;
            const tables = generateReport.reportResult.tables;
            
            if (tables.length > 0) {
                if (subRepport) {
                    tableIndex = tables.findIndex(data => data.label === subRepport);
                  
                    if(tableIndex>-1){
                        group = tables[tableIndex]
                        row = group.rows + 1;
                        level = group.level + 1;
                    }
                  
                } else {
                    tableIndex = 0;
                    group = tables[tableIndex]
                    row = group.rows + 1;
                    level = group.level + 1;
                }

                const repportDetail = await generateReportDetails(sid, tableIndex, row, level);

                cleanRepport(sid);
                return { repportDetail, group };
            }


        }
    }
}


async function cleanRepport(sid){
    const clean = await axios.get(`${baseUrl}svc=core/logout&params={}&sid=${sid}`)
    .then(res => res.data)
    .catch(err => console.log(err));
   return clean;
}

module.exports = { generateSessionId, vehicleGroupRessourceId, generateReportGlobal,cleanRepport }