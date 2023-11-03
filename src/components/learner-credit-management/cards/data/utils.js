/* eslint-disable import/prefer-default-export */

export const getBudgetDisplayName = (subsidyAccessPolicy) => {
  let budgetDisplayName = 'budget';
  if (subsidyAccessPolicy.displayName) {
    budgetDisplayName = `${subsidyAccessPolicy.displayName} ${budgetDisplayName}`;
  }
  return budgetDisplayName;
};
