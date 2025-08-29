import React from 'react';
import PropTypes from 'prop-types';
import { Card, Icon, Stack } from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';
import useContentMetadata from '../data/hooks/useContentMetadata';

const InviteModalPermissions = ({ subsidyAccessPolicy }) => {
  const { catalogUuid, policyType, spendLimit } = subsidyAccessPolicy;
  const { data } = useContentMetadata(catalogUuid);

  const getPolicyType = () => {
    if (policyType === 'PerLearnerEnrollmentCreditAccessPolicy') {
      return 'First come, first served';
    } if (spendLimit !== null) {
      return `Per member spend limit: $${spendLimit}`;
    }
    return '';
  };

  return (
    <>
      <h5 className="mb-2 mt-4">Member permissions</h5>
      <p className="x-small">All members of this budget can: </p>
      <Stack gap={2.5}>
        <Card className="d-flex px-3 py-2 rounded-0 shadow-none">
          <Card.Footer className="p-0 justify-content-between" orientation="horizontal">
            <span>
              Browse this budget&apos;s catalog
              <p className="micro pt-1 mb-0">{data?.count} courses</p>
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
