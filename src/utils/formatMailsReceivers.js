function formatMailReceivers(arr){
    const receivers= arr.map(item=>{
        const name =item.slice(0,5);
        return { name: name, address: item };
    });
    return receivers
}



module.exports={formatMailReceivers}