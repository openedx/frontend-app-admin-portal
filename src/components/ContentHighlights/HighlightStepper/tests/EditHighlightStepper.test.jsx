import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { useState } from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import algoliasearch from 'algoliasearch/lite';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@2uinc/frontend-enterprise-utils';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import {
  STEPPER_STEP_TEXT,
  testCourseAggregation,
  testCourseData,
} from '../../data/constants';
import { configuration } from '../../../../config';
import { EnterpriseAppContext } from '../../../EnterpriseApp/EnterpriseAppContextProvider';
import EditHighlightStepper from '../EditHighlightStepper';
import EnterpriseCatalogApiService from '../../../../data/services/EnterpriseCatalogApiService';

jest.mock('../../../../data/services/EnterpriseCatalogApiService');

const mockStore = configureMockStore([thunk]);

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise',
    enterpriseId: 'test-enterprise-id',
  },
};

const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    enterpriseCuration: {
      highlightSets: [],
    },
  },
};

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const existingContentKeys = Object.keys(testCourseAggregation);

const mockCourseData = [...testCourseData];
jest.mock('react-instantsearch-dom', () => ({
  ...jest.requireActual('react-instantsearch-dom'),
  connectStateResults: Component => function connectStateResults(props) {
    return (
      <Component
        searchResults={{
          hits: mockCourseData,
          hitsPerPage: 25,
          nbHits: 2,
          nbPages: 1,
          page: 1,
        }}
        isSearchStalled={false}
        searchState={{
          page: 1,
        }}
        {...props}
      />
    );
  },
}));

const EditHighlightStepperWrapper = ({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  isOpen = true,
  overrideSelectedRowIds,
  ...props
}) => {
  const contextValue = useState({
    stepperModal: {
      isOpen,
      highlightTitle: 'Recommended for Marketing',
      titleStepValidationError: null,
      currentSelectedRowIds: overrideSelectedRowIds || testCourseAggregation,
      isEditMode: true,
      highlightSetUuid: 'test-highlight-uuid',
      existingContentKeys,
    },
    contentHighlights: [],
    algolia: {
      searchClient,
      securedAlgoliaApiKey: null,
      isLoading: false,
    },
  });
  return (
    <IntlProvider locale="en">
      <Provider store={mockStore(initialState)}>
        <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
          <ContentHighlightsContext.Provider value={contextValue}>
            <EditHighlightStepper {...props} />
          </ContentHighlightsContext.Provider>
        </EnterpriseAppContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

describe('<EditHighlightStepper>', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the edit highlight modal with correct title', () => {
    renderWithRouter(<EditHighlightStepperWrapper />);
    expect(screen.getByText('Edit highlight')).toBeInTheDocument();
  });

  it('displays select content as the first step', () => {
    renderWithRouter(<EditHighlightStepperWrapper />);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.editSelectContent)).toBeInTheDocument();
  });

  it('does not display the Create a title step', () => {
    renderWithRouter(<EditHighlightStepperWrapper />);
    expect(screen.queryByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).not.toBeInTheDocument();
  });

  it('has Cancel and Next buttons on the select content step', () => {
    renderWithRouter(<EditHighlightStepperWrapper />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('navigates to Confirm and save step when Next is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<EditHighlightStepperWrapper />);

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.editConfirmContent)).toBeInTheDocument();
  });

  it('has Back and Save buttons on the confirm step', async () => {
    const user = userEvent.setup();
    renderWithRouter(<EditHighlightStepperWrapper />);

    await user.click(screen.getByText('Next'));

    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('navigates back to select content when Back is clicked on confirm step', async () => {
    const user = userEvent.setup();
    renderWithRouter(<EditHighlightStepperWrapper />);

    await user.click(screen.getByText('Next'));
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.editConfirmContent)).toBeInTheDocument();

    await user.click(screen.getByText('Back'));
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.editSelectContent)).toBeInTheDocument();
  });

  it('shows close confirmation modal when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<EditHighlightStepperWrapper />);

    await user.click(screen.getByText('Cancel'));

    expect(screen.getByText('Lose Progress?')).toBeInTheDocument();
    expect(screen.getByText('If you exit now, any changes you have made will be lost.')).toBeInTheDocument();
  });

  it('shows close confirmation modal when X is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<EditHighlightStepperWrapper />);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    expect(screen.getByText('Lose Progress?')).toBeInTheDocument();
  });

  it('calls updateHighlightSet with empty payload when no changes', async () => {
    // All existing keys are still selected, no new keys added
    EnterpriseCatalogApiService.updateHighlightSet.mockResolvedValueOnce({ data: {} });
    const user = userEvent.setup();
    renderWithRouter(<EditHighlightStepperWrapper />);

    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(EnterpriseCatalogApiService.updateHighlightSet).toHaveBeenCalledWith(
        'test-highlight-uuid',
        {},
      );
    });
  });

  it('sends remove_content_keys when existing content is deselected', async () => {
    // Start with all 4 existing keys but only 2 remain selected
    const partialSelectedRowIds = {
      'course:HarvardX+CS50W': true,
      'course:HarvardX+CS50AI': true,
    };
    EnterpriseCatalogApiService.updateHighlightSet.mockResolvedValueOnce({ data: {} });
    const user = userEvent.setup();
    renderWithRouter(
      <EditHighlightStepperWrapper
        overrideSelectedRowIds={partialSelectedRowIds}
      />,
    );

    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(EnterpriseCatalogApiService.updateHighlightSet).toHaveBeenCalledWith(
        'test-highlight-uuid',
        {
          remove_content_keys: expect.arrayContaining(['HarvardX+CS50P', 'HarvardX+CS50x']),
        },
      );
    });
  });

  it('sends both add_content_keys and remove_content_keys when content is added and removed', async () => {
    // Existing: all 4, selected: 2 existing + 1 new
    const mixedSelectedRowIds = {
      'course:HarvardX+CS50W': true,
      'course:HarvardX+CS50AI': true,
      'course:MITx+NewCourse': true,
    };
    EnterpriseCatalogApiService.updateHighlightSet.mockResolvedValueOnce({ data: {} });
    const user = userEvent.setup();
    renderWithRouter(
      <EditHighlightStepperWrapper
        overrideSelectedRowIds={mixedSelectedRowIds}
      />,
    );

    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(EnterpriseCatalogApiService.updateHighlightSet).toHaveBeenCalledWith(
        'test-highlight-uuid',
        {
          add_content_keys: ['MITx+NewCourse'],
          remove_content_keys: expect.arrayContaining(['HarvardX+CS50P', 'HarvardX+CS50x']),
        },
      );
    });
  });

  it('does not render when isOpen is false', () => {
    renderWithRouter(<EditHighlightStepperWrapper isOpen={false} />);
    expect(screen.queryByText('Edit highlight')).not.toBeInTheDocument();
  });

  it('shows edit-specific subtitle text with highlight name', () => {
    renderWithRouter(<EditHighlightStepperWrapper />);
    expect(screen.getByText(/Recommended for Marketing/)).toBeInTheDocument();
  });

  it('displays review header on confirm step', async () => {
    const user = userEvent.setup();
    renderWithRouter(<EditHighlightStepperWrapper />);

    await user.click(screen.getByText('Next'));

    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.editConfirmContent)).toBeInTheDocument();
    expect(screen.getByText(/Recommended for Marketing/)).toBeInTheDocument();
  });
});
