import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useMemo } from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import CurrentContentHighlights from '../CurrentContentHighlights';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { useStepperModalState } from '../data/hooks';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';

const mockStore = configureMockStore([thunk]);

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise-id',
  },
};

const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    enterpriseCuration: {
      highlightSets: [],
    },
  },
};

/* eslint-disable react/prop-types */
function CurrentContentHighlightsWrapper({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  ...props
}) {
/* eslint-enable react/prop-types */
  const { setIsModalOpen, isModalOpen } = useStepperModalState();
  const defaultValue = useMemo(() => ({
    setIsModalOpen,
    isModalOpen,
  }), [isModalOpen, setIsModalOpen]);
  return (
    <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
      <ContentHighlightsContext.Provider value={defaultValue}>
        <Provider store={mockStore(initialState)}>
          <CurrentContentHighlights {...props} />
        </Provider>
      </ContentHighlightsContext.Provider>
    </EnterpriseAppContext.Provider>
  );
}

describe('<CurrentContentHighlights>', () => {
  it('Displays the header title', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText('Highlight collections')).toBeInTheDocument();
  });
  it('Displays the header button', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });
  it('Displays the stepper modal on click of the header button', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    fireEvent.click(screen.getByText('New'));
    expect(screen.getByText('Create a title for the highlight collection')).toBeInTheDocument();
  });

  describe('ContentHighlightSetCardContainer', () => {
    const exampleHighlightSet = {
      uuid: 'fake-uuid',
      title: 'Test Highlight Set',
      isPublished: false,
      highlightedContentUuids: [],
    };
    it('Displays no highlight set cards', () => {
      renderWithRouter(<CurrentContentHighlightsWrapper />);
      expect(screen.queryByText('Published')).not.toBeInTheDocument();
      expect(screen.queryByText('Drafts')).not.toBeInTheDocument();
    });
    it('Displays draft highlight set cards', () => {
      renderWithRouter(
        <CurrentContentHighlightsWrapper
          enterpriseAppContextValue={{
            enterpriseCuration: {
              enterpriseCuration: {
                highlightSets: [exampleHighlightSet],
              },
            },
          }}
        />,
      );
      expect(screen.getByText('Drafts')).toBeInTheDocument();
      expect(screen.getByText(exampleHighlightSet.title)).toBeInTheDocument();
    });
    it('Displays published highlight set cards', () => {
      renderWithRouter(
        <CurrentContentHighlightsWrapper
          enterpriseAppContextValue={{
            enterpriseCuration: {
              enterpriseCuration: {
                highlightSets: [{
                  ...exampleHighlightSet,
                  isPublished: true,
                }],
              },
            },
          }}
        />,
      );
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText(exampleHighlightSet.title)).toBeInTheDocument();
    });
  });
});
