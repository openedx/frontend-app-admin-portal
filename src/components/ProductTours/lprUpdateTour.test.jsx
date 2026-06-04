import { sendEnterpriseTrackEvent } from '@2uinc/frontend-enterprise-utils';
import lprUpdateTour from './lprUpdateTour';
import {
  LPR_UPDATE_COOKIE_NAME,
  LPR_UPDATE_ADVANCE_EVENT_NAME,
  LPR_UPDATE_DISMISS_EVENT_NAME,
  LPR_UPDATE_ON_END_EVENT_NAME,
} from './constants';
import { disableAll } from './data/utils';

jest.mock('@2uinc/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('./data/utils', () => ({
  disableAll: jest.fn(),
}));

const mockIntl = {
  formatMessage: ({ defaultMessage }) => defaultMessage,
};

describe('lprUpdateTour', () => {
  const enterpriseSlug = 'test-enterprise';
  let tourConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.setItem = jest.fn();
    tourConfig = lprUpdateTour({ enterpriseSlug, intl: mockIntl });
  });

  it('should return a tour configuration object with correct properties', () => {
    expect(tourConfig).toEqual(expect.objectContaining({
      placement: 'right',
      target: '#learner-progress-sidebar',
      title: 'Learner Progress Report Update',
      advanceButtonText: 'Next',
      endButtonText: 'End',
    }));
    expect(tourConfig.body).toBeDefined();
    expect(tourConfig).toHaveProperty('onAdvance');
    expect(tourConfig).toHaveProperty('onDismiss');
    expect(tourConfig).toHaveProperty('onEnd');
  });

  describe('handleAdvanceTour', () => {
    it('should set cookie and send tracking event', () => {
      tourConfig.onAdvance();
      expect(global.localStorage.setItem).toHaveBeenCalledWith(LPR_UPDATE_COOKIE_NAME, true);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(enterpriseSlug, LPR_UPDATE_ADVANCE_EVENT_NAME);
    });
  });

  describe('handleDismissTour', () => {
    it('should call disableAll and send tracking event', () => {
      tourConfig.onDismiss();
      expect(disableAll).toHaveBeenCalled();
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(enterpriseSlug, LPR_UPDATE_DISMISS_EVENT_NAME);
    });
  });

  describe('handleTourEnd', () => {
    it('should call disableAll and send tracking event', () => {
      tourConfig.onEnd();
      expect(disableAll).toHaveBeenCalled();
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(enterpriseSlug, LPR_UPDATE_ON_END_EVENT_NAME);
    });
  });
});
