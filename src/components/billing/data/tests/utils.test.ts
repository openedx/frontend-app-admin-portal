import { isBillingEnabled } from '../utils';
import { features } from '../../../../config';

// Mock the config module
jest.mock('../../../../config', () => ({
  features: {
    ENABLE_NATIVE_BILLING: false,
  },
}));

describe('isBillingEnabled', () => {
  beforeEach(() => {
    // Reset the feature flag before each test
    features.ENABLE_NATIVE_BILLING = false;
  });

  it('returns true when feature flag is ON and enterprise has active subscription', () => {
    features.ENABLE_NATIVE_BILLING = true;

    const result = isBillingEnabled(true);

    expect(result).toBe(true);
  });

  it('returns false when feature flag is OFF', () => {
    features.ENABLE_NATIVE_BILLING = false;

    const result = isBillingEnabled(true);

    expect(result).toBe(false);
  });

  it('returns false when enterprise has no active subscription', () => {
    features.ENABLE_NATIVE_BILLING = true;

    const result = isBillingEnabled(false);

    expect(result).toBe(false);
  });

  it('returns false when both feature flag is OFF and no active subscription', () => {
    features.ENABLE_NATIVE_BILLING = false;

    const result = isBillingEnabled(false);

    expect(result).toBe(false);
  });
});
