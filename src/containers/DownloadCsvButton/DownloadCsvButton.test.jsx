import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import DownloadCsvButton from './index';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const mockStore = configureMockStore([thunk]);
const enterpriseId = 'test-enterprise';
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
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
          <IntlProvider locale="en">
            <DownloadCsvButton id="enrollments" />
          </IntlProvider>
        </Provider>
      </MemoryRouter>
    )).find('DownloadCsvButton');
  });

  it('fetchCsv dispatch action', () => {
    wrapper.props().fetchCsv(() => (
      EnterpriseDataApiService.fetchCourseEnrollments(enterpriseId, {}, { csv: true })
    ));
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
