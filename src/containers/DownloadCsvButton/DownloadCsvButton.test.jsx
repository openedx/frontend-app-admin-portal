import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import DownloadCsvButton from './index';

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
    dispatchSpy = jest.spyOn(store, 'dispatch').mockImplementation(() => Promise.resolve());
    render((
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <DownloadCsvButton id="enrollments" />
          </IntlProvider>
        </Provider>
      </MemoryRouter>
    ));
  });

  it('fetchCsv dispatch action', async () => {
    const downloadCSVButton = await screen.findByTestId('download-csv-btn');
    fireEvent.click(downloadCSVButton);
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
