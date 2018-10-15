import rewireEnterpriseDataApiService from './rewireEnterpriseDataApiService';
import rewireEcommerceApiService from './rewireEcommerceApiService';

const rewire = () => {
  rewireEnterpriseDataApiService();
  rewireEcommerceApiService();
};

// Explicitly exporting this as an IIFE so it gets bundled as a script that immediately gets called
export default rewire();
