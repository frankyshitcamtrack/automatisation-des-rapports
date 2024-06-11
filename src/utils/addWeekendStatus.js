function addWeekendStatus(arr){
    const dayNames = ["Sunday", "Monday", "Tuesday","Wednesday", "Thursday", "Friday","Satuday"];
    const result = arr.map(item=>{
        const date = item.Début;
        const newDate  = new Date(date)
        const day = newDate.getDay()
        if(dayNames[day]==="Sunday" || dayNames[day]==="Satuday"){
            return {
                ...item,
                weekend:true
            }
        }else{
            return{
                ...item,
                weekend:false
            }
        }
    })

    return result;
}

module.exports={addWeekendStatus}