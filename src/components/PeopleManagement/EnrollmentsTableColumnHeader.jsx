import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const EnrollmentsTableColumnHeader = () => (
  <span data-testid="members-table-enrollments-column-header">
    <FormattedMessage
      id="people.management.groups.detail.page.learnersTable.enrollmentsColumn"
      defaultMessage="Enrollments"
      description="Enrollments column header in the Members table"
    />
  </span>
);

export default EnrollmentsTableColumnHeader;
