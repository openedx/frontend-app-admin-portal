import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import CurrentContentHighlights from '../CurrentContentHighlights';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { useStepperModalState } from '../data/hooks';

const mockStore = configureMockStore([thunk]);

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise-id',
  },
};

const CurrentContentHighlightsWrapper = (props) => {
  const { setIsModalOpen, isModalOpen } = useStepperModalState();
  const defaultValue = {
    setIsModalOpen,
    isModalOpen,
  };
  return (
    <ContentHighlightsContext.Provider value={defaultValue}>
      <Provider store={mockStore(initialState)}>
        <CurrentContentHighlights {...props} />
      </Provider>
    </ContentHighlightsContext.Provider>
  );
};

describe('<CurrentContentHighlights>', () => {
  it('Displays the header title', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText('Active Highlights')).toBeInTheDocument();
  });
  it('Displays the header button', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText('New Highlight')).toBeInTheDocument();
  });
  it('Displays the stepper modal on click of the header button', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    fireEvent.click(screen.getByText('New Highlight'));
    expect(screen.getByText('Create a title for the highlight collection')).toBeInTheDocument();
  });

  /* TODO: Currently the ContentHighlightSetCardContainer is hard coded with data, test to be updated */
  it('Displays the ContentHighlightSetCardContainer', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText('Dire Core')).toBeInTheDocument();
  });
});
