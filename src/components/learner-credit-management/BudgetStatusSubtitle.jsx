import React from 'react';

import PropTypes from 'prop-types';
import {
  Badge, Icon, OverlayTrigger, Stack, Tooltip,
} from '@openedx/paragon';
import { GroupAdd, Groups, ManageAccounts } from '@openedx/paragon/icons';

import { useIntl } from '@edx/frontend-platform/i18n';
import { formatDate, useEnterpriseCustomer, useEnterpriseGroup } from './data';
import isLmsBudget from './utils';

const BudgetStatusSubtitle = ({
  badgeVariant, status, isAssignable, term, date, policy, enterpriseUUID,
}) => {
  const { data: enterpriseGroup } = useEnterpriseGroup(policy);
  const { data: enterpriseCustomer } = useEnterpriseCustomer(enterpriseUUID);
  const universalGroup = enterpriseGroup?.appliesToAllContexts;
  const intl = useIntl();
  const budgetType = {
    lms: {
      enrollmentType:
      intl.formatMessage({
        id: 'lcm.budget.detail.page.overview.enroll.via.integrated.learning.platform',
        defaultMessage: 'Enroll via Integrated Learning Platform',
        description: 'Enrollment type for budgets that are assigned via an integrated learning platform',
      }),
      popoverText:
      intl.formatMessage({
        id: 'lcm.budget.detail.page.overview.enroll.via.integrated.learning.platform.popover',
        defaultMessage: 'Available to people in your organization based on settings configured in your integrated learning platform',
        description: 'Popover text for budgets that are assigned via an integrated learning platform',
      }),
      icon: <Icon size="xs" src={ManageAccounts} className="ml-1 mt-4 d-inline-flex" />,

    },
    assignable: {
      enrollmentType:
      intl.formatMessage({
        id: 'lcm.budget.detail.page.overview.enroll.assignable',
        defaultMessage: 'Assignable',
        description: 'Enrollment type for budgets that are assignable',
      }),
      popoverText:
      intl.formatMessage({
        id: 'lcm.budget.detail.page.overview.enroll.assignable.popover',
        defaultMessage: 'Available to members added to this budget',
        description: 'Popover text for budgets that are assignable',
      }),
      icon: <Icon size="xs" src={GroupAdd} className="ml-1 d-inline-flex" />,
    },
    browseAndEnroll: {
      enrollmentType:
      intl.formatMessage({
        id: 'lcm.budget.detail.page.overview.enroll.browse.and.enroll',
        defaultMessage: 'Browse & Enroll',
        description: 'Enrollment type for budgets that are browsable and enrollable',
      }),
      popoverText:
      intl.formatMessage({
        id: 'lcm.budget.detail.page.overview.enroll.browse.and.enroll.popover',
        defaultMessage: 'Available to all people in your organization',
        description: 'Popover text for budgets that are browsable and enrollable',
      }),
      icon: <Icon size="xs" src={Groups} className="ml-1 d-inline-flex" />,
    },
  };
  let budgetTypeToRender;

  if (isLmsBudget(enterpriseCustomer?.activeIntegrations.length, universalGroup)) {
    budgetTypeToRender = budgetType.lms;
  } else if (isAssignable) {
    budgetTypeToRender = budgetType.assignable;
  } else {
    budgetTypeToRender = budgetType.browseAndEnroll;
  }

  return (
    <Stack direction="horizontal" gap={2}>
      {(status !== 'Active') && (
        <Badge variant={badgeVariant}>{status}</Badge>
      )}
      <span className="small">
        {(term && date) && (
          // budget expiration date
          <span>{term} {formatDate(date)}</span>
        )}
        <span> • {budgetTypeToRender.enrollmentType}</span>
        {(!isAssignable) && (
          <span> •
            <OverlayTrigger
              key="budget-tooltip"
              placement="top"
              overlay={(
                <Tooltip>
                  {budgetTypeToRender.popoverText}
                </Tooltip>
              )}
            >
              {budgetTypeToRender.icon}
            </OverlayTrigger>
          </span>
        )}
      </span>
    </Stack>
  );
};

BudgetStatusSubtitle.propTypes = {
  badgeVariant: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  isAssignable: PropTypes.bool.isRequired,
  term: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  policy: PropTypes.shape({}).isRequired,
  enterpriseUUID: PropTypes.string.isRequired,
};

export default BudgetStatusSubtitle;
