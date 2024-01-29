import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fireEvent, render, screen } from '@testing-library/react';
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
  let dispatchSpy;

  beforeEach(() => {
    dispatchSpy = jest.spyOn(store, 'dispatch');
    render((
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <DownloadCsvButton
              id="enrollments"
              fetchMethod={() => (
                EnterpriseDataApiService.fetchCourseEnrollments(enterpriseId, {}, { csv: true })
              )}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>
    ));
  });

  it('fetchCsv dispatch action', () => {
    fireEvent.click(screen.getByText('Download full report (CSV)'));
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
