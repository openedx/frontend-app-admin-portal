/* eslint-disable react/prop-types */
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { useHistory } from 'react-router';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import ContentHighlights from '../ContentHighlights';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';

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
  addToast = false,
  deleteToast = false,
}) => {
  const history = useHistory();
  const { location } = history;
  if (addToast) {
    history.push(location.pathname, { addHighlightSet: true });
  }
  if (deleteToast) {
    history.push(location.pathname, { deletedHighlightSet: true });
  }
  return (
    <IntlProvider locale="en">
      <Provider store={mockStore(initialState)}>
        <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
          <ContentHighlights />
        </EnterpriseAppContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

describe('<ContentHighlightRoutes>', () => {
  it('Displays the Hero', () => {
    renderWithRouter(<ContentHighlightsWrapper />);
    expect(screen.getByText('Highlights')).toBeInTheDocument();
  });
  it('Displays the toast addition', () => {
    renderWithRouter(<ContentHighlightsWrapper addToast />);
    expect(screen.getByText('added', { exact: false })).toBeInTheDocument();
  });
  it('Displays the toast deleted', () => {
    renderWithRouter(<ContentHighlightsWrapper deleteToast />);
    expect(screen.getByText('deleted', { exact: false })).toBeInTheDocument();
  });
});
