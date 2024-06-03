function convertArrToJson(arr){
    const res = arr.map(item=>{
        return JSON.parse(item)
        });
    return res;
}


module.exports={convertArrToJson}