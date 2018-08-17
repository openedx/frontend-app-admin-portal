import EnterpriseDataApiService from '../../src/data/services/EnterpriseDataApiService';
import { enrollments, overview } from './data';

const rewire = () => {
  EnterpriseDataApiService.fetchCourseEnrollments = (enterpriseId, options) => {
    const pageSize = options.page_size || 50;
    const page = options.page || 1;
    const start = (page - 1) * pageSize;
    const results = enrollments.slice(start, start + pageSize);
    return Promise.resolve({
      data: {
        count: enrollments.length,
        num_pages: Math.ceil(enrollments.length / pageSize),
        current_page: page,
        results,
      },
    });
  };

  EnterpriseDataApiService.fetchDashboardAnalytics = () => Promise.resolve({
    data: {
      ...overview,
    },
  });
};

export default rewire;
