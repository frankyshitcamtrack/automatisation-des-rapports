function assignStyleToHeaders(ws,headersLength){
    const wsKeyArr= Object.keys(ws);
    const headerKeys=wsKeyArr.slice(Math.max((wsKeyArr.length-1) - headersLength, 0))
    headerKeys.map(item=>{
     Object.assign(ws[item],
         {s:{ fill: { bgColor: "48CAE4"},font: { bold: true, color: { rgb: "FFFFFF" } } }})
    });

}

module.exports={assignStyleToHeaders}