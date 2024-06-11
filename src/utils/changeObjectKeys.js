const {getMapLink}=require('../utils/mapLinks')

function changeObjectKeys(header, obj) {
    obj.map(element => {
        if (element) {
            const keys = Object.keys(element);
            keys.forEach(item => {
                const i=element[item]
                if(typeof i === 'object'){
                    const val= Object.values(i);
                    let lat;
                    let lon;
                    if(val.length===4){
                        lat = val[1];
                        lon = val[2];
                    }
                    if(val.length>4){
                        lat = val[2];
                        lon = val[3];
                        
                    }
                    const link= getMapLink(lat,lon)
                    Object.assign(element, { [header[item]]:{text:Object.values(i)[0],hyperlink:link} });
                    delete element[item];
                }else{
                    Object.assign(element, { [header[item]]:i });
                    delete element[item];  
                }
               
            })
        }
    });
}


module.exports = { changeObjectKeys }