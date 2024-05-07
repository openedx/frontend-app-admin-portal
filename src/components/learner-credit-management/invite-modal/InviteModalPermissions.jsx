import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Card, Icon, Stack } from '@edx/paragon';
import { Check } from '@edx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';

const InviteModalPermissions = ({ subsidyAccessPolicy }) => {
  const { catalogUuid, policyType, spendLimit } = subsidyAccessPolicy;
  const [courseCount, setCourseCount] = React.useState(0);
  const getPolicyType = () => {
    if (policyType === 'PerLearnerEnrollmentCreditAccessPolicy') {
      return 'First come, first served';
    } if (spendLimit !== null) {
      return `Per member spend limit: $${spendLimit}`;
    }
    return '';
  };
  const getCatalogCourseCount = useCallback(async () => {
    try {
      const response = await EnterpriseCatalogApiService.fetchEnterpriseCatalogMetadata({ catalogUuid });
      setCourseCount(response.data.count);
    } catch (error) {
      logError(error);
      throw error;
    }
  }, [catalogUuid]);
  getCatalogCourseCount();
  return (
    <>
      <h5 className="mb-2 mt-4">Member permissions</h5>
      <p className="x-small">All members of this budget can: </p>
      <Stack gap={2.5}>
        <Card className="d-flex px-3 py-2 rounded-0 shadow-none">
          <Card.Footer className="p-0 justify-content-between" orientation="horizontal">
            <span>
              Browse this budget&apos;s catalog
              <p className="micro pt-1 mb-0">{courseCount} courses</p>
            </span>
            <Icon src={Check} className="mr-2" />
          </Card.Footer>
        </Card>
        <Card className="d-flex px-3 py-2 rounded-0 shadow-none">
          <Card.Footer className="p-0 justify-content-between" orientation="horizontal">
            <span>
              Spend from this budget to enroll
              <p className="micro pt-1 mb-0">{getPolicyType()}</p>
            </span>
            <Icon src={Check} className="mr-2" />
          </Card.Footer>
        </Card>
      </Stack>
    </>
  );
};

InviteModalPermissions.propTypes = {
  subsidyAccessPolicy: PropTypes.shape({
    catalogUuid: PropTypes.string.isRequired,
    policyType: PropTypes.string.isRequired,
    spendLimit: PropTypes.number,
  }).isRequired,
};

export default InviteModalPermissions;
