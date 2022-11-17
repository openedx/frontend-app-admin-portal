import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import ContentHighlightsDashboard from '../ContentHighlightsDashboard';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { useStepperModalState } from '../data/hooks';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';

const mockStore = configureMockStore([thunk]);

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise',
  },
};

const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    enterpriseCuration: {
      highlightSets: [],
    },
  },
};

const exampleHighlightSet = {
  uuid: 'fake-uuid',
  title: 'Test Highlight Set',
  isPublished: false,
  highlightedContentUuids: [],
};

/* eslint-disable react/prop-types */
const ContentHighlightsDashboardWrapper = ({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  ...props
}) => {
/* eslint-enable react/prop-types */
  const { setIsModalOpen, isModalOpen } = useStepperModalState();
  const defaultValue = {
    setIsModalOpen,
    isModalOpen,
  };
  return (
    <IntlProvider locale="en">
      <Provider store={mockStore(initialState)}>
        <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
          <ContentHighlightsContext.Provider value={defaultValue}>
            <ContentHighlightsDashboard {...props} />
          </ContentHighlightsContext.Provider>
        </EnterpriseAppContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

describe('<ContentHighlightsDashboard>', () => {
  it('Displays ZeroState on empty highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    expect(screen.getByText('You haven\'t created any highlights yet.')).toBeTruthy();
  });

  it('Displays New highlight Modal on button click with no highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    const newHighlight = screen.getByText('New highlight');
    fireEvent.click(newHighlight);
    expect(screen.getByText('Create a title for the highlight collection')).toBeInTheDocument();
  });

  it('Displays current highlights when data is populated', () => {
    renderWithRouter(
      <ContentHighlightsDashboardWrapper
        enterpriseAppContextValue={{
          enterpriseCuration: {
            enterpriseCuration: {
              highlightSets: [exampleHighlightSet],
            },
          },
        }}
      />,
    );
    expect(screen.getByText('Highlight collections')).toBeInTheDocument();
  });

  it('Displays New highlight modal on button click with highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    const newHighlight = screen.getByText('New highlight');
    fireEvent.click(newHighlight);
    expect(screen.getByText('Create a title for the highlight collection')).toBeInTheDocument();
  });
});
