const mockUseCourseEnrollments = {
  isLoading: false,
  courseEnrollments: {
    itemCount: 2,
    pageCount: 1,
    results: [
      {
        id: 1,
        passedDate: '2018-09-23',
        courseTitle: 'Dive into ReactJS',
        courseKey: 'edX/ReactJS',
        userEmail: 'awesome.me@example.com',
        courseListPrice: '200',
        courseStartDate: '2017-10-21',
        courseEndDate: '2018-05-13',
        currentGrade: '0.66',
        progressStatus: 'Failed',
        lastActivityDate: '2018-09-22',
      },
      {
        id: 5,
        passedDate: '2018-09-22',
        courseTitle: 'Redux with ReactJS',
        courseKey: 'edX/Redux_ReactJS',
        userEmail: 'new@example.com',
        courseListPrice: '200',
        courseStartDate: '2017-10-21',
        courseEndDate: '2018-05-13',
        currentGrade: '0.80',
        progressStatus: 'Passed',
        lastActivityDate: '2018-09-25',
      },
    ],
  },
  fetchCourseEnrollments: jest.fn(),
};

export default mockUseCourseEnrollments;
