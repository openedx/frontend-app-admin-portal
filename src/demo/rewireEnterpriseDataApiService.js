import EnterpriseDataApiService from '../../src/data/services/EnterpriseDataApiService';
import { enrollments, overview } from './data';

const rewire = () => {
  EnterpriseDataApiService.fetchCourseEnrollments = (options) => {
    const pageSize = options.page_size || 50;
    const page = options.page || 1;
    const start = (page - 1) * pageSize;

    // A comparator function that uses the options.ordering field to determine sort order
    const sortByOptions = (a, b) => {
      const ordering = options.ordering || 'user_email';
      const isDesc = ordering.startsWith('-');
      const orderField = isDesc ? ordering.substring(1) : ordering;
      const result = (typeof a[orderField] === 'string') ? a[orderField].localeCompare(b[orderField]) :
        a[orderField] - b[orderField];

      return isDesc ? -result : result;
    };

    const results = enrollments.sort(sortByOptions).slice(start, start + pageSize);

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
