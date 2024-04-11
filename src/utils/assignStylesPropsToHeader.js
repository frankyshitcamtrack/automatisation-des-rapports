function assignStyleToHeaders(ws,headersLength){
    const wsKeyArr= Object.keys(ws);
    const headerKeys=wsKeyArr.slice(Math.max((wsKeyArr.length-1) - headersLength, 0))
    headerKeys.map(item=>{
     Object.assign(ws[item],
         {s:{ font: { bold: true, color: { rgb: "FFFFFF" } },fill: {pattern: "solid",fgColor:{rgb:"023E8A"} } }})
    });

}

module.exports={assignStyleToHeaders}