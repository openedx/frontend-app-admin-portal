import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Card, Stack } from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';

const InviteModalPermissions = ({ catalogUuid }) => {
  const [courseCount, setCourseCount] = React.useState(0);
  const getCatalogCourseCount = useCallback(async () => {
    try {
      const response = await EnterpriseCatalogApiService.fetchEnterpriseCatalogMetadata({ catalogUuid });
      const { count } = response.data;
      setCourseCount(count);
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
        <Card className="px-3 py-2 rounded-0 shadow-none">
          Browse this budget&apos;s catalog
          <p className="micro pt-1 mb-0">{courseCount} courses</p>
        </Card>
        <Card className="px-3 py-2 rounded-0 shadow-none">
          Spend from this budget to enroll
        </Card>
      </Stack>
    </>
  );
};

InviteModalPermissions.propTypes = {
  catalogUuid: PropTypes.string.isRequired,
};

export default InviteModalPermissions;
