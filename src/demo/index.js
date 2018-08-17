import rewireEnterpriseDataApiService from './rewireEnterpriseDataApiService';

const rewire = () => {
  rewireEnterpriseDataApiService();
};

// Explicitly exporting this as an IIFE so it gets bundled as a script that immediately gets called
export default rewire();
