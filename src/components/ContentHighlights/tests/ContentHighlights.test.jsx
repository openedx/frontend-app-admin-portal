import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import ContentHighlights from '../ContentHighlights';

const mockStore = configureMockStore([thunk]);

const initialState = {
  portalConfiguration:
    {
      enterpriseSlug: 'test-enterprise',
    },
};

const ContentHighlightsWrapper = (props) => (
  <Provider store={mockStore(initialState)}>
    <ContentHighlights {...props} />
  </Provider>
);

describe('<ContentHighlightRoutes>', () => {
  it('Displays the Hero', () => {
    renderWithRouter(<ContentHighlightsWrapper />);
    expect(screen.getByText('Highlights')).toBeInTheDocument();
  });
});
