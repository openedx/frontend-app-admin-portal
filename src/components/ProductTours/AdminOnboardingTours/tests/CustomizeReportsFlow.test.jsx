import React from 'react';
import { renderHook } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { CUSTOMIZE_REPORTS_SIDEBAR } from '../constants';
import messages from '../messages';
import CustomizeReportsFlow from '../flows/CustomizeReportsFlow';

const mockFormatMessage = jest.fn((message) => message.defaultMessage || message.id || 'Mocked message');

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: mockFormatMessage,
  }),
}));

const mockHandleEndTour = jest.fn();

const wrapper = ({ children }) => (
  <IntlProvider locale="en" messages={{}}>
    {children}
  </IntlProvider>
);

const renderWithMock = () => renderHook(
  () => CustomizeReportsFlow({
    handleEndTour: mockHandleEndTour,
  }),
  { wrapper },
);

describe('useCustomizeReportsFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates customize reports flow with correct structure', () => {
    const { result } = renderWithMock();
    const flow = result.current;

    expect(flow).toHaveLength(1);
    expect(flow[0]).toMatchObject({
      target: `#${CUSTOMIZE_REPORTS_SIDEBAR}`,
      placement: 'right',
      body: messages.viewCustomizeReports.defaultMessage,
      onAdvance: mockHandleEndTour,
    });
  });

  it('uses correct target selectors for customize reports flow', () => {
    const { result } = renderWithMock();
    const flow = result.current;

    expect(flow[0].target).toBe(`#${CUSTOMIZE_REPORTS_SIDEBAR}`);
  });
});
