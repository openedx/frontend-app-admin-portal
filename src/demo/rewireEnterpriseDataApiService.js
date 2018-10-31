import EnterpriseDataApiService from '../data/services/EnterpriseDataApiService';
import {
  filterCompletedLearnerCourses,
  filteredEnrollments,
  filterEnrolledLearners,
  filterEnrolledLearnersForInactiveCourses,
  filterUnenrolledRegisteredLearners,
  getEnrollmentsCsv,
  overview,
} from './data';

const rewire = () => {
  const fetchData = (options, filterMethod) => {
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

    const courseEnrollments = filterMethod(options);

    const results = courseEnrollments.sort(sortByOptions).slice(start, start + pageSize);

    return Promise.resolve({
      data: {
        count: courseEnrollments.length,
        num_pages: Math.ceil(courseEnrollments.length / pageSize),
        current_page: page,
        results,
      },
    });
  };

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

    const courseEnrollments = filteredEnrollments(options);

    const results = courseEnrollments.sort(sortByOptions).slice(start, start + pageSize);

    return Promise.resolve({
      data: {
        count: courseEnrollments.length,
        num_pages: Math.ceil(courseEnrollments.length / pageSize),
        current_page: page,
        results,
      },
    });
  };

  EnterpriseDataApiService.fetchEnrolledLearners = options => fetchData(options, filterEnrolledLearners); // eslint-disable-line max-len
  EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses = options => fetchData(options, filterEnrolledLearnersForInactiveCourses); // eslint-disable-line max-len
  EnterpriseDataApiService.fetchUnenrolledRegisteredLearners = options => fetchData(options, filterUnenrolledRegisteredLearners); // eslint-disable-line max-len
  EnterpriseDataApiService.fetchCompletedLearners = options => fetchData(options, filterCompletedLearnerCourses); // eslint-disable-line max-len

  EnterpriseDataApiService.fetchDashboardAnalytics = () => Promise.resolve({
    data: {
      ...overview,
    },
  });

  // Csv download fetch methods.
  EnterpriseDataApiService.fetchCourseEnrollmentsCsv = () => Promise.resolve({
    data: getEnrollmentsCsv(),
  });
};

export default rewire;
