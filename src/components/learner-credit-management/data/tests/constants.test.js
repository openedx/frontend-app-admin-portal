import {
  TEST_FLAG,
  ENABLE_TESTING,
  testEnterpriseCatalogUuid,
} from '../constants';

const enterpriseCatalogUuid = 'test-enterprise-catalogUuid';

describe('constants', () => {
  it('should be defined', () => {
    expect(testEnterpriseCatalogUuid).toBeDefined();
  });
  it('ENABLE_TESTING should pass through when the TEST_FLAG = false', () => {
    expect(TEST_FLAG).toBe(false);
    expect(ENABLE_TESTING(enterpriseCatalogUuid)).toBe(enterpriseCatalogUuid);
  });
  it('ENABLE_TESTING should return the testEnterpriseId when passing true parameter', () => {
    expect(ENABLE_TESTING(testEnterpriseCatalogUuid, true)).toBe(testEnterpriseCatalogUuid);
  });
});
