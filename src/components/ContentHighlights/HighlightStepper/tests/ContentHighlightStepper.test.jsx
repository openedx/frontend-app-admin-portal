import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { useState } from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import algoliasearch from 'algoliasearch/lite';
import thunk from 'redux-thunk';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import {
  BUTTON_TEXT,
  DEFAULT_ERROR_MESSAGE,
  MAX_HIGHLIGHT_TITLE_LENGTH,
  STEPPER_HELP_CENTER_FOOTER_BUTTON_TEXT,
  STEPPER_STEP_TEXT,
  testCourseAggregation,
  testCourseData,
} from '../../data/constants';
import { configuration } from '../../../../config';
import ContentHighlightsDashboard from '../../ContentHighlightsDashboard';
import { EnterpriseAppContext } from '../../../EnterpriseApp/EnterpriseAppContextProvider';
import ContentHighlightStepper from '../ContentHighlightStepper';

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

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

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
            <ContentHighlightStepper />
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Displays the stepper', () => {
    renderWithRouter(<ContentHighlightStepperWrapper />);

    const stepper = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
    userEvent.click(stepper);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
  });
  it('Displays the stepper and test all back and next buttons', () => {
    renderWithRouter(<ContentHighlightStepperWrapper />);
    // open stepper --> title
    const stepper = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
    userEvent.click(stepper);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    // title --> select content
    const nextButton1 = screen.getByText('Next');
    const input = screen.getByTestId('stepper-title-input');
    fireEvent.change(input, { target: { value: 'test-title' } });
    userEvent.click(nextButton1);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
    // select content --> confirm content
    const nextButton2 = screen.getByText('Next');
    userEvent.click(nextButton2);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(3);
    // confirm content --> select content
    const backButton2 = screen.getByText('Back');
    userEvent.click(backButton2);

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(4);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.selectContent)).toBeInTheDocument();
    // select content --> title
    const backButton3 = screen.getByText('Back');
    userEvent.click(backButton3);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(5);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
    // title --> closed stepper
    const backButton4 = screen.getByText('Back');
    userEvent.click(backButton4);

    expect(screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`)).toBeInTheDocument();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(6);

    // Confirm stepper close confirmation modal
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.title)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.content)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.exit)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.cancel)).toBeInTheDocument();

    const confirmCloseButton = screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.exit);
    userEvent.click(confirmCloseButton);

    expect(screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`)).toBeInTheDocument();
  });
  it('Displays the stepper and exits on the X button', () => {
    renderWithRouter(<ContentHighlightStepperWrapper />);

    const stepper = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
    userEvent.click(stepper);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    userEvent.click(closeButton);

    expect(screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`)).toBeInTheDocument();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);

    // Confirm stepper close confirmation modal
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.title)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.content)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.exit)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.cancel)).toBeInTheDocument();

    const confirmCloseButton = screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.exit);
    userEvent.click(confirmCloseButton);

    // Confirm stepper confirmation modal closed
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.title)).not.toBeInTheDocument();
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.content)).not.toBeInTheDocument();
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.exit)).not.toBeInTheDocument();
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.cancel)).not.toBeInTheDocument();

    expect(screen.queryByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).not.toBeInTheDocument();
    expect(screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`)).toBeInTheDocument();
  });
  it('Displays the stepper and closes the stepper on confirm', async () => {
    renderWithRouter(<ContentHighlightStepperWrapper />);

    const stepper = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
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

    const stepper1 = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
    userEvent.click(stepper1);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    userEvent.click(closeButton);
    expect(screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`)).toBeInTheDocument();

    // Confirm stepper close confirmation modal
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.title)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.content)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.exit)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.cancel)).toBeInTheDocument();

    const confirmCloseButton = screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.exit);
    userEvent.click(confirmCloseButton);

    // Confirm stepper confirmation modal closed
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.title)).not.toBeInTheDocument();
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.content)).not.toBeInTheDocument();
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.exit)).not.toBeInTheDocument();
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.cancel)).not.toBeInTheDocument();

    expect(screen.queryByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).not.toBeInTheDocument();
    expect(screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`)).toBeInTheDocument();

    const stepper2 = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
    userEvent.click(stepper2);

    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
  });
  it('opens the stepper modal close confirmation modal and cancels the modal', () => {
    renderWithRouter(<ContentHighlightStepperWrapper />);

    const stepper1 = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
    userEvent.click(stepper1);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    userEvent.click(closeButton);

    // Confirm stepper close confirmation modal
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.title)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.content)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.exit)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.cancel)).toBeInTheDocument();

    const confirmCancelButton = screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.cancel);
    userEvent.click(confirmCancelButton);

    // Confirm stepper confirmation modal closed
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.title)).not.toBeInTheDocument();
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.content)).not.toBeInTheDocument();
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.exit)).not.toBeInTheDocument();
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.cancel)).not.toBeInTheDocument();

    // Confirm modal still open
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
  });
  it('Displays error message in title page when highlight set name exceeds maximum value', () => {
    renderWithRouter(<ContentHighlightStepperWrapper />);
    const stepper = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
    userEvent.click(stepper);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
    const input = screen.getByTestId('stepper-title-input');
    const reallyLongTitle = 'test-title-test-title-test-title-test-title-test-title-test-title';
    const reallyLongTitleLength = reallyLongTitle.length;
    fireEvent.change(input, { target: { value: reallyLongTitle } });

    expect(screen.getByText(`${reallyLongTitleLength}/${MAX_HIGHLIGHT_TITLE_LENGTH}`, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_ERROR_MESSAGE.EXCEEDS_HIGHLIGHT_TITLE_LENGTH)).toBeInTheDocument();
  });
  it('sends segment event from footer link', () => {
    renderWithRouter(<ContentHighlightStepperWrapper />);
    const stepper = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
    userEvent.click(stepper);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
    const footerLink = screen.getByText(STEPPER_HELP_CENTER_FOOTER_BUTTON_TEXT);
    userEvent.click(footerLink);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });
  it('removes title validation after exiting the stepper and revisiting', () => {
    renderWithRouter(<ContentHighlightStepperWrapper />);
    const stepper1 = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
    userEvent.click(stepper1);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
    const input = screen.getByTestId('stepper-title-input');
    const reallyLongTitle = 'test-title-test-title-test-title-test-title-test-title-test-title';
    const reallyLongTitleLength = reallyLongTitle.length;
    fireEvent.change(input, { target: { value: reallyLongTitle } });

    expect(screen.getByText(`${reallyLongTitleLength}/${MAX_HIGHLIGHT_TITLE_LENGTH}`, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_ERROR_MESSAGE.EXCEEDS_HIGHLIGHT_TITLE_LENGTH)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    userEvent.click(closeButton);

    // Confirm stepper close confirmation modal
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.title)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.content)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.exit)).toBeInTheDocument();
    expect(screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.cancel)).toBeInTheDocument();

    const confirmCloseButton = screen.getByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.exit);
    userEvent.click(confirmCloseButton);

    // Confirm stepper confirmation modal closed
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.title)).not.toBeInTheDocument();
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.content)).not.toBeInTheDocument();
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.exit)).not.toBeInTheDocument();
    expect(screen.queryByText(STEPPER_STEP_TEXT.ALERT_MODAL_TEXT.buttons.cancel)).not.toBeInTheDocument();

    // Confirm stepper closed
    expect(screen.queryByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).not.toBeInTheDocument();

    const stepper2 = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
    userEvent.click(stepper2);

    expect(screen.getByText(`0/${MAX_HIGHLIGHT_TITLE_LENGTH}`, { exact: false })).toBeInTheDocument();
    expect(screen.queryByText(DEFAULT_ERROR_MESSAGE.EXCEEDS_HIGHLIGHT_TITLE_LENGTH)).not.toBeInTheDocument();
  });
});
