import { CHART_TYPES } from './constants';

const simulateURL = (activeTab, chartType) => {
  if (!Object.values(CHART_TYPES).includes(chartType)) {
    return activeTab;
  }
  return `${activeTab}/stats`;
};

export default simulateURL;
