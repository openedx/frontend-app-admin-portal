export const mockUseCourseEnrollments = {
  isLoading: false,
  data: {
    itemCount: 2,
    pageCount: 1,
    results: [
      {
        userEmail: 'awesome.me@example.com',
        courseTitle: 'Dive into ReactJS',
        courseListPrice: 200,
        courseStartDate: '2017-10-21',
        courseEndDate: '2018-05-13',
        passedDate: '2018-09-23',
        currentGrade: 0.66,
        progressStatus: 'Failed',
        lastActivityDate: '2018-09-22',
      },
      {
        userEmail: 'new@example.com',
        courseTitle: 'Redux with ReactJS',
        courseListPrice: 200,
        courseStartDate: '2017-10-21',
        courseEndDate: '2018-05-13',
        passedDate: '2018-09-22',
        currentGrade: 0.8,
        progressStatus: 'Passed',
        lastActivityDate: '2018-09-25',
      },
    ],
  },
  fetchData: jest.fn(),
  fetchDataImmediate: jest.fn(),
  hasData: true,
};

export const mockEmptyCourseEnrollmentsData = {
  isLoading: false,
  data: {
    itemCount: 0,
    pageCount: 0,
    results: [],
  },
  fetchData: jest.fn(),
  fetchDataImmediate: jest.fn(),
  hasData: false,
};
