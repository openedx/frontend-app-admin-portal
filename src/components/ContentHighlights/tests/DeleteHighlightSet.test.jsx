import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { logError } from '@edx/frontend-platform/logging';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import { Routes, Route, MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import DeleteHighlightSet from '../DeleteHighlightSet';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import { enterpriseCurationActions } from '../../EnterpriseApp/data/enterpriseCurationReducer';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';

jest.mock('../../../data/services/EnterpriseCatalogApiService');

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockStore = configureMockStore([thunk]);
const initialState = {
  portalConfiguration:
    {
      enterpriseSlug: 'test-enterprise',
    },
};

const highlightSetUUID = 'fake-uuid';

const mockDispatchFn = jest.fn();
const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    dispatch: mockDispatchFn,
  },
};

/* eslint-disable react/prop-types */
const DeleteHighlightSetWrapper = ({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  ...props
}) => (
/* eslint-enable react/prop-types */
  <IntlProvider locale="en">
    <Provider store={mockStore(initialState)}>
      <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
        <MemoryRouter initialEntries={[`/test-enterprise/admin/${ROUTE_NAMES.contentHighlights}/${highlightSetUUID}`]}>
          <Routes>
            <Route
              path={`/:enterpriseSlug/admin/${ROUTE_NAMES.contentHighlights}/:highlightSetUUID`}
              element={<DeleteHighlightSet {...props} />}
            />
          </Routes>
        </MemoryRouter>
      </EnterpriseAppContext.Provider>
    </Provider>
  </IntlProvider>
);

describe('<DeleteHighlightSet />', () => {
  const getDeleteHighlightBtn = () => {
    const deleteBtn = screen.getByText('Delete highlight');
    return deleteBtn;
  };

  const clickDeleteHighlightBtn = () => {
    const deleteBtn = getDeleteHighlightBtn();
    userEvent.click(deleteBtn);
    expect(screen.getByText('Delete highlight?')).toBeInTheDocument();
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('has delete highlight button', () => {
    render(<DeleteHighlightSetWrapper />);
    const deleteBtn = getDeleteHighlightBtn();
    expect(deleteBtn).toBeInTheDocument();
  });

  it('clicking delete highlight button opens confirmation modal', () => {
    render(<DeleteHighlightSetWrapper />);
    clickDeleteHighlightBtn();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });

  it('cancelling confirmation modal closes modal', () => {
    render(<DeleteHighlightSetWrapper />);
    clickDeleteHighlightBtn();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    userEvent.click(screen.getByText('Cancel'));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Delete highlight?')).not.toBeInTheDocument();
  });

  it('confirming deletion in confirmation modal deletes via API', async () => {
    EnterpriseCatalogApiService.deleteHighlightSet.mockResolvedValueOnce();

    render(<DeleteHighlightSetWrapper />);
    clickDeleteHighlightBtn();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    userEvent.click(screen.getByTestId('delete-confirmation-button'));
    expect(screen.getByText('Deleting highlight...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockDispatchFn).toHaveBeenCalledWith(
        enterpriseCurationActions.setHighlightSetToast(highlightSetUUID),
      );
    });
    await waitFor(() => {
      expect(mockDispatchFn).toHaveBeenCalledWith(
        enterpriseCurationActions.deleteHighlightSet(highlightSetUUID),
      );
    });
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Delete highlight?')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(`/test-enterprise/admin/${ROUTE_NAMES.contentHighlights}`, { state: { deletedHighlightSet: true } });
  });

  it('confirming deletion in confirmation modal handles error via API', async () => {
    EnterpriseCatalogApiService.deleteHighlightSet.mockRejectedValueOnce(new Error('oh noes!'));

    render(<DeleteHighlightSetWrapper />);
    clickDeleteHighlightBtn();
    userEvent.click(screen.getByTestId('delete-confirmation-button'));
    expect(screen.getByText('Deleting highlight...')).toBeInTheDocument();

    await waitFor(() => {
      expect(logError).toHaveBeenCalled();
    });

    expect(mockDispatchFn).not.toHaveBeenCalledWith(
      enterpriseCurationActions.deleteHighlightSet(highlightSetUUID),
    );

    expect(screen.queryByText('Delete highlight?')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    const alertDismissBtn = screen.getByText('Dismiss');
    expect(alertDismissBtn).toBeInTheDocument();
    userEvent.click(alertDismissBtn);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
