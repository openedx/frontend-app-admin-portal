import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { useState } from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import algoliasearch from 'algoliasearch/lite';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import {
  BUTTON_TEXT,
  STEPPER_STEP_TEXT,
  testCourseAggregation,
  testCourseData,
} from '../../data/constants';
import { configuration } from '../../../../config';
import ContentHighlightsDashboard from '../../ContentHighlightsDashboard';
import { EnterpriseAppContext } from '../../../EnterpriseApp/EnterpriseAppContextProvider';

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

/* eslint-disable react/prop-types */
const ContentHighlightStepperWrapper = ({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  ...props
}) => {
  /* eslint-enable react/prop-types */
  const contextValue = useState({
    stepperModal: {
      isOpen: false,
      highlightTitle: null,
      titleStepValidationError: null,
      currentSelectedRowIds: testCourseAggregation,
    },
    contentHighlights: [],
    searchClient,
  });
  return (
    <IntlProvider locale="en">
      <Provider store={mockStore(initialState)}>
        <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
          <ContentHighlightsContext.Provider value={contextValue}>
            <ContentHighlightsDashboard {...props} />
          </ContentHighlightsContext.Provider>
        </EnterpriseAppContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

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

describe('<ContentHighlightStepper>', () => {
  it('Displays the stepper', () => {
    renderWithRouter(<ContentHighlightStepperWrapper />);

    const stepper = screen.getByText(BUTTON_TEXT.zeroStateCreateNewHighlight);
    userEvent.click(stepper);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
  });
  it('Displays the stepper and test all back and next buttons', () => {
    renderWithRouter(<ContentHighlightStepperWrapper />);
    // open stepper --> title
    const stepper = screen.getByText(BUTTON_TEXT.zeroStateCreateNewHighlight);
    userEvent.click(stepper);
    // title --> select content
    const nextButton1 = screen.getByText('Next');
    const input = screen.getByTestId('stepper-title-input');
    fireEvent.change(input, { target: { value: 'test-title' } });
    userEvent.click(nextButton1);
    // select content --> confirm content
    const nextButton2 = screen.getByText('Next');
    userEvent.click(nextButton2);

    // confirm content --> select content
    const backButton2 = screen.getByText('Back');
    userEvent.click(backButton2);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.selectContent)).toBeInTheDocument();
    // select content --> title
    const backButton3 = screen.getByText('Back');
    userEvent.click(backButton3);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
    // title --> closed stepper
    const backButton4 = screen.getByText('Back');
    userEvent.click(backButton4);
    expect(screen.getByText(BUTTON_TEXT.zeroStateCreateNewHighlight)).toBeInTheDocument();
  });
  it('Displays the stepper and exits on the X button', () => {
    renderWithRouter(<ContentHighlightStepperWrapper />);

    const stepper = screen.getByText(BUTTON_TEXT.zeroStateCreateNewHighlight);
    userEvent.click(stepper);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    userEvent.click(closeButton);
    expect(screen.getByText(BUTTON_TEXT.zeroStateCreateNewHighlight)).toBeInTheDocument();
  });
  it('Displays the stepper and closes the stepper on confirm', async () => {
    renderWithRouter(<ContentHighlightStepperWrapper />);

    const stepper = screen.getByText(BUTTON_TEXT.zeroStateCreateNewHighlight);
    userEvent.click(stepper);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
    const input = screen.getByTestId('stepper-title-input');
    fireEvent.change(input, { target: { value: 'test-title' } });
    const nextButton1 = screen.getByText('Next');
    userEvent.click(nextButton1);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.selectContent)).toBeInTheDocument();
    const nextButton2 = screen.getByText('Next');
    userEvent.click(nextButton2);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.confirmContent)).toBeInTheDocument();

    const confirmButton = screen.getByText('Publish');
    userEvent.click(confirmButton);
    await waitFor(() => expect(screen.getByText('Publishing...')).toBeInTheDocument());
  });
  it('Displays the stepper, closes, then displays stepper again', () => {
    renderWithRouter(<ContentHighlightStepperWrapper />);

    const stepper1 = screen.getByText(BUTTON_TEXT.zeroStateCreateNewHighlight);
    userEvent.click(stepper1);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    userEvent.click(closeButton);
    expect(screen.getByText(BUTTON_TEXT.zeroStateCreateNewHighlight)).toBeInTheDocument();

    const stepper2 = screen.getByText(BUTTON_TEXT.zeroStateCreateNewHighlight);
    userEvent.click(stepper2);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
  });
});
