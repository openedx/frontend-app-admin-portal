
export const convertToSelectedRowsObject = (selectedRows) => selectedRows.reduce((acc, row) => { acc[row.id] = true; return acc; }, {})
