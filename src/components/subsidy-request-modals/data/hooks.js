import { useEffect, useState } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import EcommerceApiService from '../../../data/services/EcommerceApiService';

/**
 * This hook returns the enterprise's catalogs that contain the given course runs.
 */
export const useApplicableCatalogs = ({
  enterpriseId,
  courseRunIds,
}) => {
  const [applicableCatalogs, setApplicableCatalogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(undefined);

  useEffect(() => {
    const fetchApplicableCatalogs = async () => {
      try {
        const resp = await EnterpriseCatalogApiService.fetchApplicableCatalogs({
          enterpriseId,
          courseRunIds,
        });
        const data = camelCaseObject(resp.data);
        const { catalogList } = data;
        setApplicableCatalogs(catalogList);
      } catch (err) {
        logError(err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicableCatalogs();
  }, [enterpriseId, courseRunIds]);

  return {
    applicableCatalogs,
    isLoading,
    error,
  };
};

/**
 * This hook returns available subscriptions that can be applied for the given course runs.
 */
export const useApplicableSubscriptions = ({
  enterpriseId,
  courseRunIds,
  subscriptions,
}) => {
  const {
    applicableCatalogs,
    isLoading,
    error,
  } = useApplicableCatalogs({ enterpriseId, courseRunIds });
  const [applicableSubscriptions, setApplicableSubscriptions] = useState([]);

  useEffect(() => {
    const applicableSubs = subscriptions.results.filter(
      subscription => applicableCatalogs.includes(subscription.enterpriseCatalogUuid)
        && subscription.licenses.unassigned > 0,
    );
    setApplicableSubscriptions(applicableSubs);
  }, [applicableCatalogs, subscriptions]);

  return {
    applicableCatalogs,
    applicableSubscriptions,
    isLoading,
    error,
  };
};

/**
 * This hook returns available coupons that can be applied for the given course runs.
 */
export const useApplicableCoupons = ({
  enterpriseId,
  courseRunIds,
  coupons,
}) => {
  const {
    applicableCatalogs,
    isLoading: isLoadingApplicableCatalogs,
    error: fetchApplicableCatalogsError,
  } = useApplicableCatalogs({ enterpriseId, courseRunIds });
  const [isLoading, setIsLoading] = useState(false);
  const [applicableCoupons, setApplicableCoupons] = useState([]);
  const [couponDetails, setCouponDetails] = useState([]);
  const [fetchCouponsError, setFetchCouponsError] = useState(undefined);

  useEffect(() => {
    const fetchApplicableCoupons = async () => {
      setIsLoading(true);
      try {
        // We need to fetch individual coupons to get the associated enterprise catalog
        const details = await (await Promise.all(
          coupons.results.map(coupon => EcommerceApiService.fetchCoupon(coupon.id)),
        )).map(
          (resp, index) => camelCaseObject({
            ...resp.data,
            ...coupons.results[index],
          }),
        );

        setCouponDetails(details);
      } catch (err) {
        logError(err);
        setFetchCouponsError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (applicableCatalogs.length > 0 && coupons?.results?.length > 0) {
      fetchApplicableCoupons();
    }
  }, [applicableCatalogs, coupons?.results?.length]);

  useEffect(() => {
    if (couponDetails) {
      const applicableCoups = couponDetails.filter(
        coupon => applicableCatalogs.includes(coupon.enterpriseCustomerCatalog) && coupon.numUnassigned > 0,
      );

      setApplicableCoupons(applicableCoups);
    }
  }, [applicableCatalogs, couponDetails]);

  return {
    applicableCatalogs,
    applicableCoupons,
    isLoading: isLoadingApplicableCatalogs || isLoading,
    error: fetchApplicableCatalogsError || fetchCouponsError,
  };
};
