function addAutoFilter(arr,rowData){
    const columns=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T']

    const arrLength=arr.length;
    const endRowFilter=columns[arrLength-1]

    const autoFilter= `A${rowData}:${endRowFilter}${rowData}`

    return autoFilter;
}

module.exports={addAutoFilter}