/* eslint-disable react/prop-types */
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import ContentHighlights from '../ContentHighlights';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import LmsApiService from '../../../data/services/LmsApiService';
import { GROUP_TYPE_BUDGET } from '../../PeopleManagement/constants';

jest.mock('../../../data/services/LmsApiService');

const mockStore = configureMockStore([thunk]);
const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    enterpriseCuration: {
      highlightSets: [],
    },
  },
};
const initialState = {
  portalConfiguration:
    {
      enterpriseSlug: 'test-enterprise',
    },
};

const ContentHighlightsWrapper = ({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  location,
}) => (
  <IntlProvider locale="en">
    <Provider store={mockStore(initialState)}>
      <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
        <ContentHighlights location={location} />
      </EnterpriseAppContext.Provider>
    </Provider>
  </IntlProvider>
);

describe('<ContentHighlights>', () => {
  beforeEach(() => {
    getAuthenticatedUser.mockReturnValue({
      administrator: true,
    });
  });
  it('Displays the Hero', () => {
    renderWithRouter(<ContentHighlightsWrapper location={{ state: {} }} />);
    expect(screen.getAllByText('Highlights')[0]).toBeInTheDocument();
  });
  it('Displays the toast addition', () => {
    renderWithRouter(<ContentHighlightsWrapper location={{ state: { addHighlightSet: true } }} />);
    expect(screen.getByText('added', { exact: false })).toBeInTheDocument();
  });
  it('Displays the toast deleted', () => {
    renderWithRouter(<ContentHighlightsWrapper location={{ state: { deletedHighlightSet: true } }} />);
    expect(screen.getByText('deleted', { exact: false })).toBeInTheDocument();
  });
  it('Displays the toast highlight', () => {
    const toastMessage = {
      enterpriseCuration: {
        enterpriseCuration: {
          toastText: 'highlighted',
          highlightSets: [],
        },
      },
    };
    renderWithRouter(
      <ContentHighlightsWrapper
        enterpriseAppContextValue={toastMessage}
        location={{ state: { highlightToast: true } }}
      />,
    );
    expect(screen.getByText('highlighted')).toBeInTheDocument();
  });
  it('Displays the archive toast', () => {
    renderWithRouter(
      <ContentHighlightsWrapper
        location={{ state: { archiveCourses: true } }}
      />,
    );
    expect(screen.getByText('Archived courses deleted')).toBeInTheDocument();
  });
  it('Displays the alert if custom groups is enabled and user is staff', () => {
    LmsApiService.fetchEnterpriseGroups.mockImplementation(() => Promise.resolve({
      data: { results: [{ group_type: GROUP_TYPE_BUDGET }] },
    }));
    renderWithRouter(<ContentHighlightsWrapper location={{ state: {} }} />);
  });
});
