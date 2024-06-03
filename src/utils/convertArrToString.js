function jsonstring(ar) {
    const res = ar.map(item=>{
    return JSON.stringify(item)
    })
    
    return res;
}




module.exports={jsonstring}