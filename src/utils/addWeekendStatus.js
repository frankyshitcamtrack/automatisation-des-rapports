
const {getHollydaysCameroun}=require ('../services/holliday.service')

 // add weekend and hollydays status tag by date in everydata
async function addWeekendStatus(arr) {
    // get all hollydays by google service calender
    const hollydays = []
    const actualDate = new Date();
    const actualYear = actualDate.getFullYear();
    const allHollydays = await getHollydaysCameroun();

    const hollidaysByActualYear = allHollydays.filter(item => item.start.date.includes(actualYear));

    hollidaysByActualYear.map(item => {
        const date = item.start.date;
        const newDate = new Date(date)
        hollydays.push(newDate);
    })


    //days array
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Satuday"];

    //maps trough arr of data and checks for hollydays and weekend
    const result = arr.map(item => {
        const date = item.Début.text;
        const newDate = new Date(date);
        const day = newDate.getDay();
        if (dayNames[day] === "Sunday" || dayNames[day] === "Satuday" || hollydays.includes(newDate)) {
            return {
                ...item,
                weekend: true
            }
        } else {
            return {
                ...item,
                weekend: false
            }
        }
    })
    return result;
}

module.exports={addWeekendStatus}