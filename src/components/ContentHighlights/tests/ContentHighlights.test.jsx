import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
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
  // eslint-disable-next-line react/prop-types
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  ...props
}) => (
  <Provider store={mockStore(initialState)}>
    <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
      <ContentHighlights {...props} />
    </EnterpriseAppContext.Provider>
  </Provider>
);

describe('<ContentHighlightRoutes>', () => {
  it('Displays the Hero', () => {
    renderWithRouter(<ContentHighlightsWrapper />);
    expect(screen.getByText('Highlights')).toBeInTheDocument();
  });
});
