import React from 'react';

import PropTypes from 'prop-types';
import {
  Badge, Icon, OverlayTrigger, Stack, Tooltip,
} from '@edx/paragon';
import { GroupAdd, Groups, ManageAccounts } from '@edx/paragon/icons';

import { formatDate, useEnterpriseCustomer, useEnterpriseGroup } from './data';
import isLmsBudget from './utils';

const BudgetStatusSubtitle = ({
  badgeVariant, status, isAssignable, term, date, policy, enterpriseUUID,
}) => {
  const { data: enterpriseGroup } = useEnterpriseGroup(policy);
  const { data: enterpriseCustomer } = useEnterpriseCustomer(enterpriseUUID);
  const universalGroup = enterpriseGroup?.appliesToAllContexts;
  const budgetType = {
    lms: {
      enrollmentType: 'Enroll via Integrated Learning Platform',
      popoverText: 'Available to people in your organization based on settings configured in your integrated learning platform',
      icon: <Icon size="xs" src={ManageAccounts} className="ml-1 mt-4 d-inline-flex" />,

    },
    assignable: {
      enrollmentType: 'Assignable',
      popoverText: 'Available to members added to this budget',
      icon: <Icon size="xs" src={GroupAdd} className="ml-1 d-inline-flex" />,
    },
    browseAndEnroll: {
      enrollmentType: 'Browse & Enroll',
      popoverText: 'Available to all people in your organization',
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
