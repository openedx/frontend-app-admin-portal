import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import analyticsTour from './AnalyticsTour';
import {
  ANALYTICS_COOKIE_NAME,
  ANALYTICS_ADVANCE_EVENT_NAME,
  ANALYTICS_DISMISS_EVENT_NAME,
  ANALYTICS_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';
import { disableAll } from './data/utils';

// Mock dependencies
jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('./data/utils', () => ({
  disableAll: jest.fn(),
}));

describe('analyticsTour', () => {
  const enterpriseSlug = 'test-enterprise';
  let tourConfig;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Mock localStorage
    Storage.prototype.setItem = jest.fn();
    tourConfig = analyticsTour({ enterpriseSlug });
  });

  it('should return a tour configuration object with correct properties', () => {
    expect(tourConfig).toEqual(expect.objectContaining({
      placement: 'right',
      body: 'We redesigned our Analytics page! Same tools, now with more control over your data.',
      target: `#${TOUR_TARGETS.ANALYTICS_SIDEBAR}`,
      title: 'New Feature',
      advanceButtonText: 'Next',
      endButtonText: 'End',
    }));
    expect(tourConfig).toHaveProperty('onAdvance');
    expect(tourConfig).toHaveProperty('onDismiss');
    expect(tourConfig).toHaveProperty('onEnd');
  });

  describe('handleAdvanceTour', () => {
    it('should set cookie and send tracking event', () => {
      tourConfig.onAdvance();
      expect(global.localStorage.setItem).toHaveBeenCalledWith(ANALYTICS_COOKIE_NAME, true);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(enterpriseSlug, ANALYTICS_ADVANCE_EVENT_NAME);
    });
  });

  describe('handleDismissTour', () => {
    it('should call disableAll and send tracking event', () => {
      tourConfig.onDismiss();
      expect(disableAll).toHaveBeenCalled();
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(enterpriseSlug, ANALYTICS_DISMISS_EVENT_NAME);
    });
  });

  describe('handleTourEnd', () => {
    it('should call disableAll and send tracking event', () => {
      tourConfig.onEnd();
      expect(disableAll).toHaveBeenCalled();
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(enterpriseSlug, ANALYTICS_ON_END_EVENT_NAME);
    });
  });
});
