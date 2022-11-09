import { screen, render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import ContentHighlightSetCard from '../ContentHighlightSetCard';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { useStepperModalState } from '../data/hooks';
import ContentHighlightStepper from '../HighlightStepper/ContentHighlightStepper';

const mockStore = configureMockStore([thunk]);

const mockData = {
  title: 'Test Title',
  highlightUUID: 'test-uuid',
  enterpriseSlug: 'test-enterprise-slug',
};

const publishedData = {
  ...mockData,
  isPublished: true,
};

const unpublishedData = {
  ...mockData,
  isPublished: false,
};

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise-id',
  },
  highlightUUID: 'test-uuid',
};

const ContentHighlightSetCardWrapper = (props) => {
  const { setIsModalOpen, isModalOpen } = useStepperModalState();
  const defaultValue = {
    setIsModalOpen,
    isModalOpen,
  };
  return (
    <ContentHighlightsContext.Provider value={defaultValue}>
      <Provider store={mockStore(initialState)}>
        <ContentHighlightSetCard {...props} />
        <ContentHighlightStepper isOpen={isModalOpen} />
      </Provider>
    </ContentHighlightsContext.Provider>
  );
};

describe('<ContentHighlightSetCard>', () => {
  it('Displays the title of the highlight set', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper {...publishedData} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  it('Displays the published status of the highlight set', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper {...publishedData} />);
    expect(screen.getByText('Published')).toBeInTheDocument();
  });
  it('Displays the draft status of the highlight set', () => {
    render(<ContentHighlightSetCardWrapper {...unpublishedData} />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });
  it('Displays the stepper modal on click of the draft status', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper {...unpublishedData} />);
    fireEvent.click(screen.getByText('Test Title'));
    expect(screen.getByText('Create a title for the highlight collection')).toBeInTheDocument();
  });
});
