import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { logError } from '@edx/frontend-platform/logging';
import { Route } from 'react-router-dom';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import DeleteHighlightSet from '../DeleteHighlightSet';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
import { EnterpriseAppContext, initialStateValue } from '../../../data/tests/EnterpriseAppTestData/context';
import { enterpriseCurationActions } from '../../EnterpriseApp/data/enterpriseCurationReducer';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import { TEST_ENTERPRISE_SLUG } from '../../../data/tests/constants';

jest.mock('../../../data/services/EnterpriseCatalogApiService');

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const highlightSetUUID = 'fake-uuid';

const mockDispatchFn = jest.fn();

const initialRouterEntry = `/${TEST_ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.contentHighlights}/${highlightSetUUID}`;

/* eslint-disable react/prop-types */
const DeleteHighlightSetWrapper = ({
  value = {
    ...initialStateValue,
    enterpriseCuration: {
      ...initialStateValue.enterpriseCuration,
      dispatch: mockDispatchFn,
    },
  },
  ...props
}) => (
/* eslint-enable react/prop-types */
  <EnterpriseAppContext value={value}>
    <Route
      path={`/:enterpriseSlug/admin/${ROUTE_NAMES.contentHighlights}/:highlightSetUUID`}
      render={routeProps => <DeleteHighlightSet {...routeProps} {...props} />}
    />
  </EnterpriseAppContext>
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
    renderWithRouter(
      <DeleteHighlightSetWrapper />,
      { route: initialRouterEntry },
    );
    const deleteBtn = getDeleteHighlightBtn();
    expect(deleteBtn).toBeInTheDocument();
  });

  it('clicking delete highlight button opens confirmation modal', () => {
    renderWithRouter(
      <DeleteHighlightSetWrapper />,
      { route: initialRouterEntry },
    );
    clickDeleteHighlightBtn();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });

  it('cancelling confirmation modal closes modal', () => {
    renderWithRouter(
      <DeleteHighlightSetWrapper />,
      { route: initialRouterEntry },
    );
    clickDeleteHighlightBtn();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    userEvent.click(screen.getByText('Cancel'));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Delete highlight?')).not.toBeInTheDocument();
  });

  it('confirming deletion in confirmation modal deletes via API', async () => {
    EnterpriseCatalogApiService.deleteHighlightSet.mockResolvedValueOnce();

    const { history } = renderWithRouter(
      <DeleteHighlightSetWrapper />,
      { route: initialRouterEntry },
    );
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
    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.contentHighlights}`);
    expect(history.location.state).toEqual(
      expect.objectContaining({
        deletedHighlightSet: true,
      }),
    );
  });

  it('confirming deletion in confirmation modal handles error via API', async () => {
    EnterpriseCatalogApiService.deleteHighlightSet.mockRejectedValueOnce(new Error('oh noes!'));

    renderWithRouter(
      <DeleteHighlightSetWrapper />,
      { route: initialRouterEntry },
    );
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
