import { render, renderHook } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import EditHighlightsFlow from '../flows/EditHighlightsFlow';
import {
  ADMIN_TOUR_EVENT_NAMES,
  EDIT_HIGHLIGHTS_LEARN_MORE_URL,
  EDIT_HIGHLIGHTS_TARGETS,
} from '../constants';
import messages from '../messages';

const mockFormatMessage = jest.fn((message) => message.defaultMessage || message.id || 'Mocked message');

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: mockFormatMessage,
  }),
}));

const wrapper = ({ children }) => (
  <IntlProvider locale="en" messages={{}}>
    {children}
  </IntlProvider>
);

const mockHandleAdvanceTour = jest.fn();
const mockHandleEndTour = jest.fn();
const mockHandleBackTour = jest.fn();
const mockHandleDismissTour = jest.fn();

describe('EditHighlightsFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderFlow = () => renderHook(
    () => EditHighlightsFlow({
      handleAdvanceTour: mockHandleAdvanceTour,
      handleBackTour: mockHandleBackTour,
      handleEndTour: mockHandleEndTour,
      handleDismissTour: mockHandleDismissTour,
    }),
    { wrapper },
  );

  it('returns a 5-step flow with the expected targets and copy', () => {
    const { result } = renderFlow();
    const flow = result.current;

    expect(flow).toHaveLength(5);

    expect(flow[0]).toMatchObject({
      target: `#${EDIT_HIGHLIGHTS_TARGETS.HIGHLIGHTS_SIDEBAR}`,
      placement: 'right',
      title: messages.editHighlightsPopupOneTitle.defaultMessage,
    });
    // Step one body is a node containing the copy and a custom Dismiss button
    expect(flow[0].body).toBeTruthy();
    expect(flow[1]).toMatchObject({
      target: `#${EDIT_HIGHLIGHTS_TARGETS.HIGHLIGHTS_TAB}`,
      placement: 'top',
      body: messages.editHighlightsStepTwoBody.defaultMessage,
    });
    expect(flow[2]).toMatchObject({
      target: `#${EDIT_HIGHLIGHTS_TARGETS.HIGHLIGHTS_NEW_BUTTON}`,
      placement: 'left',
    });
    // Step three body is a FormattedMessage with a "Learn more" hyperlink
    expect(flow[2].body.props).toMatchObject(messages.editHighlightsStepThreeBody);
    expect(flow[3]).toMatchObject({
      target: `#${EDIT_HIGHLIGHTS_TARGETS.HIGHLIGHTS_CATALOG_VISIBILITY_TAB}`,
      placement: 'top',
      body: messages.editHighlightsStepFourBody.defaultMessage,
    });
    expect(flow[4]).toMatchObject({
      target: `#${EDIT_HIGHLIGHTS_TARGETS.HIGHLIGHT_SET_CARD}`,
      placement: 'right',
      body: messages.editHighlightsStepFiveBody.defaultMessage,
    });
  });

  it('fires the advance tracking event on step one advance', () => {
    const { result } = renderFlow();
    result.current[0].onAdvance();
    expect(mockHandleAdvanceTour).toHaveBeenCalledWith(
      ADMIN_TOUR_EVENT_NAMES.EDIT_HIGHLIGHTS_ADVANCE_EVENT_NAME,
    );
  });

  it('fires advance and back events on middle steps', () => {
    const { result } = renderFlow();
    result.current[1].onAdvance();
    result.current[1].onBack();
    result.current[2].onAdvance();
    result.current[3].onBack();
    expect(mockHandleAdvanceTour).toHaveBeenCalledTimes(2);
    expect(mockHandleAdvanceTour).toHaveBeenCalledWith(
      ADMIN_TOUR_EVENT_NAMES.EDIT_HIGHLIGHTS_ADVANCE_EVENT_NAME,
    );
    expect(mockHandleBackTour).toHaveBeenCalledTimes(2);
    expect(mockHandleBackTour).toHaveBeenCalledWith(
      ADMIN_TOUR_EVENT_NAMES.EDIT_HIGHLIGHTS_BACK_EVENT_NAME,
    );
  });

  it('fires the completed event on the final step end', () => {
    const { result } = renderFlow();
    result.current[4].onEnd();
    expect(mockHandleEndTour).toHaveBeenCalledWith(
      ADMIN_TOUR_EVENT_NAMES.EDIT_HIGHLIGHTS_COMPLETED_EVENT_NAME,
      undefined,
    );
  });

  it('fires the back event on the final step back', () => {
    const { result } = renderFlow();
    result.current[4].onBack();
    expect(mockHandleBackTour).toHaveBeenCalledWith(
      ADMIN_TOUR_EVENT_NAMES.EDIT_HIGHLIGHTS_BACK_EVENT_NAME,
    );
  });

  it('renders a "Learn more" link on step three pointing at the knowledge base article', () => {
    const { result } = renderFlow();
    const { getByText } = render(result.current[2].body, { wrapper });
    const link = getByText('Learn more').closest('a');
    expect(link.getAttribute('href')).toBe(EDIT_HIGHLIGHTS_LEARN_MORE_URL);
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('renders a Dismiss button on step one that fires the dismiss event', () => {
    const { result } = renderFlow();
    const { getByText } = render(result.current[0].body, { wrapper });
    getByText(messages.editHighlightsDismissButton.defaultMessage).click();
    expect(mockHandleDismissTour).toHaveBeenCalledWith(
      ADMIN_TOUR_EVENT_NAMES.EDIT_HIGHLIGHTS_DISMISS_EVENT_NAME,
    );
  });

  it('does not define onBack on the first step or onAdvance on the last step', () => {
    const { result } = renderFlow();
    expect(result.current[0].onBack).toBeUndefined();
    expect(result.current[4].onAdvance).toBeUndefined();
  });
});
