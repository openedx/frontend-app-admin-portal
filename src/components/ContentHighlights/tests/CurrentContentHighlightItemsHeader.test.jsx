import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { TEST_COURSE_HIGHLIGHTS_DATA } from '../data/constants';
import CurrentContentHighlightItemsHeader from '../CurrentContentHighlightItemsHeader';

const mockStore = configureMockStore([thunk]);

const highlightUUID = '1';
const contentByUUID = TEST_COURSE_HIGHLIGHTS_DATA.filter(
  highlight => highlight.uuid === highlightUUID,
)[0];
/* Currently mocks TEST_COURSE_HIGHLIGHTS_DATA from data/constants.js by the uuid */
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    highlightUUID,
  }),
}));

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise-id',
  },
};

const ContentHighlightsCardItemsHeaderWrapper = (props) => (
  <Provider store={mockStore(initialState)}>
    <CurrentContentHighlightItemsHeader {...props} />
  </Provider>
);

describe('<CurrentContentHighlightItemsHeader>', () => {
  it('Displays all content data titles', () => {
    renderWithRouter(<ContentHighlightsCardItemsHeaderWrapper />);
    const { uuid } = contentByUUID;
    expect(screen.getByText(uuid)).toBeInTheDocument();
  });
});
