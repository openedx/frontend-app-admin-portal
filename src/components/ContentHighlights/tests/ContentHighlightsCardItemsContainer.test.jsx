import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { camelCaseObject } from '@edx/frontend-platform';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import ContentHighlightsCardItemsContainer from '../ContentHighlightsCardItemsContainer';
import { DEFAULT_ERROR_MESSAGE, TEST_COURSE_HIGHLIGHTS_DATA } from '../data/constants';

const mockStore = configureMockStore([thunk]);

const testHighlightSet = camelCaseObject(TEST_COURSE_HIGHLIGHTS_DATA)[0]?.highlightedContent;
const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise',
  },
};

const ContentHighlightsCardItemsContainerWrapper = (props) => (
  <Provider store={mockStore(initialState)}>
    <ContentHighlightsCardItemsContainer {...props} />
  </Provider>
);

describe('<ContentHighlightsCardItemsContainer>', () => {
  it('Displays all content data titles', () => {
    renderWithRouter(<ContentHighlightsCardItemsContainerWrapper
      isLoading={false}
      highlightedContent={testHighlightSet}
    />);
    const firstTitle = testHighlightSet[0].title;
    const lastTitle = testHighlightSet[testHighlightSet.length - 1].title;
    expect(screen.getByText(firstTitle)).toBeInTheDocument();
    expect(screen.getByText(lastTitle)).toBeInTheDocument();
  });

  it('Displays all content data content types', () => {
    renderWithRouter(<ContentHighlightsCardItemsContainerWrapper
      isLoading={false}
      highlightedContent={testHighlightSet}
    />);
    const firstContentType = testHighlightSet[0].contentType;
    const lastContentType = testHighlightSet[testHighlightSet.length - 1].contentType;
    expect(screen.getByText(firstContentType)).toBeInTheDocument();
    expect(screen.getByText(lastContentType)).toBeInTheDocument();
  });

  it('Displays multiple organizations', () => {
    renderWithRouter(<ContentHighlightsCardItemsContainerWrapper
      isLoading={false}
      highlightedContent={testHighlightSet}
    />);
    const firstContentType = testHighlightSet[0]
      .authoringOrganizations[0].name;
    const lastContentType = testHighlightSet[0]
      .authoringOrganizations[testHighlightSet[0].authoringOrganizations.length - 1].name;
    expect(screen.getByText(firstContentType, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(lastContentType, { exact: false })).toBeInTheDocument();
  });
  it('Displays nothing when highlightedContents length equals 0', () => {
    renderWithRouter(<ContentHighlightsCardItemsContainerWrapper
      isLoading={false}
      highlightedContent={[]}
    />);
    expect(screen.getByTestId('empty-highlighted-content')).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_ERROR_MESSAGE.EMPTY_HIGHLIGHT_SET)).toBeInTheDocument();
  });
  it('Displays Skeleton on load', () => {
    renderWithRouter(<ContentHighlightsCardItemsContainerWrapper
      isLoading
      highlightedContent={testHighlightSet}
    />);
    expect(screen.getAllByTestId('card-item-skeleton')).toBeTruthy();
  });
});
