/* eslint-disable import/prefer-default-export */
export const checkForSelectedRows = (selectedRows, currentRows) => currentRows.every(v => selectedRows.includes(v.id));
