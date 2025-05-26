export const mockEnrolledLearnersData = {
  isLoading: false,
  hasData: true,
  fetchData: jest.fn(),
  fetchDataImmediate: jest.fn(),
  data: {
    results: [
      {
        userEmail: 'learner1@example.com',
        lmsUserCreated: '2024-01-01T00:00:00Z',
        enrollmentCount: 3,
      },
      {
        userEmail: 'learner2@example.com',
        lmsUserCreated: '2024-01-02T00:00:00Z',
        enrollmentCount: 5,
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
