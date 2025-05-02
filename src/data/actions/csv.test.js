import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { saveAs } from 'file-saver/FileSaver';
import { logError } from '@edx/frontend-platform/logging';

import { fetchCsv, clearCsv } from './csv';
import {
  FETCH_CSV_REQUEST,
  FETCH_CSV_SUCCESS,
  FETCH_CSV_FAILURE,
  CLEAR_CSV,
} from '../constants/csv';
import store from '../store';

// Mock dependencies
jest.mock('file-saver/FileSaver', () => ({
  saveAs: jest.fn(),
}));
jest.mock('@edx/frontend-platform/logging');
jest.mock('../store', () => ({
  getState: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('csv actions', () => {
  const csvId = 'test-csv-report';
  const enterpriseId = 'enterprise-123';
  const mockCsvData = 'col1,col2\nval1,val2';

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Mock the store state
    store.getState.mockReturnValue({
      portalConfiguration: { enterpriseId },
    });
  });

  describe('fetchCsv', () => {
    it('dispatches SUCCESS actions and calls saveAs on successful fetch', async () => {
      const mockFetchMethod = jest.fn().mockResolvedValue({ data: mockCsvData });
      const expectedActions = [
        { type: FETCH_CSV_REQUEST, payload: { csvId } },
        { type: FETCH_CSV_SUCCESS, payload: { csvId } },
      ];

      const reduxStore = mockStore();
      await reduxStore.dispatch(fetchCsv(csvId, mockFetchMethod));

      expect(reduxStore.getActions()).toEqual(expectedActions);
      expect(mockFetchMethod).toHaveBeenCalledWith(enterpriseId);
      expect(saveAs).toHaveBeenCalledTimes(1);

      // Check the blob content and filename
      const blobArg = saveAs.mock.calls[0][0];
      const filenameArg = saveAs.mock.calls[0][1];

      // Reading blob content requires async FileReader, simplified check for type and filename
      expect(blobArg).toBeInstanceOf(Blob);
      expect(blobArg.type).toBe('text/csv;charset=utf-8;');

      // Verify filename
      expect(filenameArg).toBe(`${enterpriseId}_progress_report.csv`);
      expect(logError).not.toHaveBeenCalled();

      // Verify blob content
      const reader = new FileReader();
      const text = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(blobArg);
      });
      expect(text).toBe(mockCsvData);
    });

    it('dispatches FAILURE action on fetch error', async () => {
      const mockError = new Error('Network Error');
      const mockFetchMethod = jest.fn().mockRejectedValue(mockError);
      const expectedActions = [
        { type: FETCH_CSV_REQUEST, payload: { csvId } },
        { type: FETCH_CSV_FAILURE, payload: { csvId, error: mockError } },
      ];

      const reduxStore = mockStore({});
      await reduxStore.dispatch(fetchCsv(csvId, mockFetchMethod));

      expect(reduxStore.getActions()).toEqual(expectedActions);
      expect(mockFetchMethod).toHaveBeenCalledWith(enterpriseId);
      expect(saveAs).not.toHaveBeenCalled();
      expect(logError).toHaveBeenCalledWith(mockError);
    });
  });

  it('creates CLEAR_CSV action', () => {
    const expectedAction = { type: CLEAR_CSV, payload: { csvId } };
    const reduxStore = mockStore({});
    reduxStore.dispatch(clearCsv(csvId));
    expect(reduxStore.getActions()).toEqual([expectedAction]);
  });
});
