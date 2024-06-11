function addAffectationsColumn(arr){  
    const addAffectation = arr.map(item=>{
        if(item.Grouping.text !=='Total'){
            const affectations = item.Grouping.split('-')[3];
            return{
                Affectations:affectations,
                ...item
            }
        }else{
            return
        }
    })
    return addAffectation;
}

module.exports={addAffectationsColumn}