import { renderHook } from '@testing-library/react-hooks/dom';

import { useEnterpriseSubsidiesContext } from '../../index';
import * as hooks from '../hooks';
import { SUBSIDY_TYPES } from '../../../../data/constants/subsidyTypes';

jest.mock('../hooks');

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

describe('useEnterpriseSubsidiesContext', () => {
  const basicProps = { enablePortalLearnerCreditManagementScreen: true, enterpriseId: TEST_ENTERPRISE_UUID };

  it.each([
    {
      offers: [{ uuid: 'offer-id' }],
      customerAgreement: { subscriptions: [{ uuid: 'subscription-id' }] },
      coupons: [{ uuid: 'coupon-id' }],
      expectedEnterpriseSubsidyTypes: [
        SUBSIDY_TYPES.offer,
        SUBSIDY_TYPES.coupon,
        SUBSIDY_TYPES.license],
    },
    {
      offers: [],
      customerAgreement: { subscriptions: [{ uuid: 'subscription-id' }] },
      coupons: [{ uuid: 'coupon-id' }],
      expectedEnterpriseSubsidyTypes: [
        SUBSIDY_TYPES.coupon,
        SUBSIDY_TYPES.license],
    },
    {
      offers: [],
      customerAgreement: { subscriptions: [{ uuid: 'subscription-id' }] },
      coupons: [],
      expectedEnterpriseSubsidyTypes: [SUBSIDY_TYPES.license],
    },
  ])('returns the correct enterpriseSubsidyTypes', ({
    offers, customerAgreement, coupons, expectedEnterpriseSubsidyTypes,
  }) => {
    hooks.useEnterpriseOffers.mockReturnValue({
      offers,
    });
    hooks.useCustomerAgreement.mockReturnValue({
      customerAgreement,
    });
    hooks.useCoupons.mockReturnValue({
      coupons,
    });

    const { result } = renderHook(() => useEnterpriseSubsidiesContext(basicProps));
    expect(result.current.enterpriseSubsidyTypes).toEqual(expectedEnterpriseSubsidyTypes);
  });
});
