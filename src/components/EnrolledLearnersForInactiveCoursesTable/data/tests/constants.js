export const mockEnrolledLearnersData = {
  isLoading: false,
  hasData: true,
  fetchData: jest.fn(),
  fetchDataImmediate: jest.fn(),
  data: {
    results: [
      {
        userEmail: 'learner1@example.com',
        enrollmentCount: 3,
        courseCompletionCount: 2,
        lastActivityDate: '2025-01-01T00:00:00Z',
      },
      {
        userEmail: 'learner2@example.com',
        enrollmentCount: 5,
        courseCompletionCount: 5,
        lastActivityDate: '2025-02-01T00:00:00Z',
      },
    ],
    itemCount: 2,
    pageCount: 1,
  },
};

export const mockEmptyEnrolledLearnersData = {
  isLoading: false,
  hasData: false,
  fetchData: jest.fn(),
  fetchDataImmediate: jest.fn(),
  data: {
    results: [],
    itemCount: 0,
    pageCount: 0,
  },
};
