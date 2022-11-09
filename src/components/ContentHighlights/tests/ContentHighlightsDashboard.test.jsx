import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { TEST_COURSE_HIGHLIGHTS_DATA } from '../data/constants';
import ContentHighlightsDashboard from '../ContentHighlightsDashboard';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { useStepperModalState } from '../data/hooks';

const mockStore = configureMockStore([thunk]);

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise-id',
  },
  highlightUUID: 'test-uuid',
};

const ContentHighlightsDashboardWrapper = (props) => {
  const { setIsModalOpen, isModalOpen } = useStepperModalState();
  const defaultValue = {
    setIsModalOpen,
    isModalOpen,
  };
  return (
    <ContentHighlightsContext.Provider value={defaultValue}>
      <Provider store={mockStore(initialState)}>
        <ContentHighlightsDashboard {...props} />
      </Provider>
    </ContentHighlightsContext.Provider>
  );
};

describe('<ContentHighlightsDashboard>', () => {
  it('Displays ZeroState on empty highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    expect(screen.getByText('You haven\'t created any "highlights" collections yet.')).toBeTruthy();
  });
  it('Displays New Highlight Modal on button click with no highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    const newHighlight = screen.getByText('New Highlight');
    fireEvent.click(newHighlight);
    expect(screen.getByText('Create a title for the highlight collection')).toBeInTheDocument();
  });
  it('Displays current highlights when data is populated', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper highlightSets={TEST_COURSE_HIGHLIGHTS_DATA} />);
    expect(screen.getByText('Active Highlights')).toBeInTheDocument();
  });
  it('Displays New Highlight Modal on button click with highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper highlightSets={TEST_COURSE_HIGHLIGHTS_DATA} />);
    const newHighlight = screen.getByText('New Highlight');
    fireEvent.click(newHighlight);
    expect(screen.getByText('Create a title for the highlight collection')).toBeInTheDocument();
  });
});
