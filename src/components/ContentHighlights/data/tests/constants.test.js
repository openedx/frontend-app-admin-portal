import { TEST_FLAG, ENABLE_TESTING, testEnterpriseId } from '../constants';

const enterpriseId = 'test-enterprise-id';

describe('constants', () => {
  it('should be defined', () => {
    expect(testEnterpriseId).toBeDefined();
  });
  it('ENABLE_TESTING should pass through when the TEST_FLAG = false', () => {
    expect(TEST_FLAG).toBe(false);
    expect(ENABLE_TESTING(enterpriseId)).toBe(enterpriseId);
  });
  it('ENABLE_TESTING should return the testEnterpriseId when passing true parameter', () => {
    expect(ENABLE_TESTING(enterpriseId, true)).toBe(testEnterpriseId);
  });
});
