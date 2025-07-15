import React from 'react';
import { renderHook } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import messages from '../messages';
import SetUpPreferencesFlow from '../SetUpPreferencesFlow';
import { TOUR_TARGETS } from '../../constants';

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

const mockHandleEndTour = jest.fn();

const renderWithMock = () => renderHook(
  () => SetUpPreferencesFlow({
    handleEndTour: mockHandleEndTour,
  }),
  { wrapper },
);

describe('useSetUpPreferencesFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates set up preferences flow with correct structure', () => {
    const { result } = renderWithMock();
    const flow = result.current;

    expect(flow).toHaveLength(1);
    expect(flow[0]).toMatchObject({
      target: `#${TOUR_TARGETS.SETTINGS_SIDEBAR}`,
      placement: 'right',
      body: messages.viewSetUpPreferences.defaultMessage,
      onAdvance: mockHandleEndTour,
    });
  });

  it('uses correct target selectors for set up preferences flow', () => {
    const { result } = renderWithMock();
    const flow = result.current;

    expect(flow[0].target).toBe(`#${TOUR_TARGETS.SETTINGS_SIDEBAR}`);
  });
});
