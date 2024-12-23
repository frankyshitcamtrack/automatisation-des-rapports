function autoSizeColumnSheet(ws) {
  return ws.columns.forEach((column, i) => {
    let maxLength = 0;
    column['eachCell']({ includeEmpty: true }, (cell) => {
      let columnLength = cell.value ? cell.value.toString().length : 20;
      if (columnLength > maxLength && columnLength < 20) {
        maxLength = columnLength;
      }
      if (columnLength > maxLength && columnLength > 20) {
        maxLength = 25;
      }
    });
    column.width = maxLength < 20 ? 20 : maxLength;
  });
}

module.exports = { autoSizeColumnSheet };
