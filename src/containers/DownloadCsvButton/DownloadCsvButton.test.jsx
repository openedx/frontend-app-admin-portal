import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import DownloadCsvButton from './index';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId: 'test-enterprise',
  },
  csv: {
    enrollments: {},
  },
  table: {
    enrollments: {},
  },
});

describe('<DownloadCsvButton />', () => {
  let wrapper;
  let dispatchSpy;

  beforeEach(() => {
    dispatchSpy = jest.spyOn(store, 'dispatch');
    wrapper = mount((
      <MemoryRouter>
        <Provider store={store}>
          <DownloadCsvButton id="enrollments" />
        </Provider>
      </MemoryRouter>
    )).find('DownloadCsvButton');
  });

  it('fetchCsv dispatch action', () => {
    wrapper.props().fetchCsv(EnterpriseDataApiService.fetchCourseEnrollmentsCsv);
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
