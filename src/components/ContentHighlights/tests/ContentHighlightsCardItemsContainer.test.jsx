import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { camelCaseObject } from '@edx/frontend-platform';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import ContentHighlightsCardItemsContainer from '../ContentHighlightsCardItemsContainer';
import { TEST_COURSE_HIGHLIGHTS_DATA } from '../data/constants';

const mockStore = configureMockStore([thunk]);

const highlightUUID = '1';
const contentByUUID = camelCaseObject(TEST_COURSE_HIGHLIGHTS_DATA).filter(
  highlight => highlight.uuid === highlightUUID,
)[0]?.highlightedContent;
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

function ContentHighlightsCardItemsContainerWrapper(props) {
  return (
    <Provider store={mockStore(initialState)}>
      <ContentHighlightsCardItemsContainer {...props} />
    </Provider>
  );
}

describe('<ContentHighlightsCardItemsContainer>', () => {
  it('Displays all content data titles', () => {
    renderWithRouter(<ContentHighlightsCardItemsContainerWrapper />);
    const firstTitle = contentByUUID[0].title;
    const lastTitle = contentByUUID[contentByUUID.length - 1].title;
    expect(screen.getByText(firstTitle)).toBeInTheDocument();
    expect(screen.getByText(lastTitle)).toBeInTheDocument();
  });
  it('Displays all content data content types', () => {
    renderWithRouter(<ContentHighlightsCardItemsContainerWrapper />);
    const firstContentType = contentByUUID[0].contentType;
    const lastContentType = contentByUUID[contentByUUID.length - 1].contentType;
    expect(screen.getByText(firstContentType)).toBeInTheDocument();
    expect(screen.getByText(lastContentType)).toBeInTheDocument();
  });
  it('Displays only the first organization', () => {
    renderWithRouter(<ContentHighlightsCardItemsContainerWrapper />);
    const firstContentType = contentByUUID[0]
      .authoringOrganizations[0].name;
    const lastContentType = contentByUUID[0]
      .authoringOrganizations[contentByUUID[0].authoringOrganizations.length - 1].name;
    expect(screen.getByText(firstContentType)).toBeInTheDocument();
    expect(screen.queryByText(lastContentType)).not.toBeInTheDocument();
  });
});
