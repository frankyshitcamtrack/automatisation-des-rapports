function changeObjectKeys(header, obj) {
    obj.map(element => {
        if (element) {
            const keys = Object.keys(element);
            keys.forEach(item => {
                const i=element[item]
                if(typeof i === 'object'){
                    Object.assign(element, { [header[item]]:Object.values(i)[0] });
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