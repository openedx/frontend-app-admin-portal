import React from 'react';
import { isEmpty } from 'lodash-es';

import PropTypes from 'prop-types';
import {
  Badge, Icon, OverlayTrigger, Stack, Tooltip,
} from '@openedx/paragon';
import { GroupAdd, Groups, ManageAccounts } from '@openedx/paragon/icons';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  formatDate, isLmsBudget, useEnterpriseCustomer, useEnterpriseGroup,
} from './data';

const BudgetStatusSubtitle = ({
  badgeVariant, status, isAssignable, term, date, policy, enterpriseUUID, isRetired, isBnREnabled,
}) => {
  const { data: enterpriseGroup } = useEnterpriseGroup(policy);
  const customGroup = !isEmpty(policy?.groupAssociations) && !enterpriseGroup?.appliesToAllContexts;
  const { data: enterpriseCustomer } = useEnterpriseCustomer(enterpriseUUID);
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
      icon: <Icon size="xs" src={ManageAccounts} className="ml-1 mt-4 d-inline-flex" svgAttrs={{ transform: 'translate(0,2)' }} />,
    },
    assignable: {
      enrollmentType:
      intl.formatMessage({
        id: 'lcm.budget.detail.page.overview.enroll.assignable',
        defaultMessage: 'Assignment',
        description: 'Enrollment type for budgets that are assignable',
      }),
    },
    groupsBrowseAndEnroll: {
      enrollmentType:
      intl.formatMessage({
        id: 'lcm.budget.detail.page.overview.enroll.groups.browse.and.enroll',
        defaultMessage: 'Browse & Enroll',
        description: 'Enrollment type for budgets that are browsable and enrollable',
      }),
      popoverText:
      intl.formatMessage({
        id: 'lcm.budget.detail.page.overview.enroll.groups.browse.and.enroll.popover',
        defaultMessage: 'Available to members added to this budget',
        description: 'Popover text for budgets that are browsable and enrollable',
      }),
      icon: <Icon size="xs" src={GroupAdd} className="ml-1 d-inline-flex" svgAttrs={{ transform: 'translate(0,2)' }} />,
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
      icon: <Icon size="xs" src={Groups} className="ml-1 d-inline-flex" svgAttrs={{ transform: 'translate(0,2)' }} />,
    },
    browseAndRequest: {
      enrollmentType:
      intl.formatMessage({
        id: 'lcm.budget.detail.page.overview.enroll.browse.and.request',
        defaultMessage: 'Browse & Request',
        description: 'Enrollment type for browse and request budgets',
      }),
      popoverText:
      intl.formatMessage({
        id: 'lcm.budget.detail.page.overview.enroll.browse.and.request.popover',
        defaultMessage: 'Available to all people in your organization',
        description: 'Popover text for for browse and request budgets',
      }),
      icon: <Icon size="xs" src={Groups} className="ml-1 d-inline-flex" svgAttrs={{ transform: 'translate(0,2)' }} />,
    },
  };
  let budgetTypeToRender;

  if (isLmsBudget(enterpriseCustomer?.activeIntegrations.length, enterpriseGroup?.appliesToAllContexts)) {
    budgetTypeToRender = budgetType.lms;
  } else if (customGroup) {
    budgetTypeToRender = budgetType.groupsBrowseAndEnroll;
  } else if (isBnREnabled) {
    budgetTypeToRender = budgetType.browseAndRequest;
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
        {!isRetired && (
          <>
            <span> • {budgetTypeToRender.enrollmentType}</span>
            {(!isAssignable) && (
              <span> •
                <OverlayTrigger
                  key="budget-tooltip"
                  placement="top"
                  overlay={(
                    <Tooltip id="budget-tooltip">
                      {budgetTypeToRender.popoverText}
                    </Tooltip>
                  )}
                >
                  {budgetTypeToRender.icon}
                </OverlayTrigger>
              </span>
            )}
          </>
        )}
      </span>
    </Stack>
  );
};

BudgetStatusSubtitle.propTypes = {
  badgeVariant: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  isAssignable: PropTypes.bool.isRequired,
  isBnREnabled: PropTypes.bool,
  term: PropTypes.string,
  date: PropTypes.string,
  policy: PropTypes.shape({
    groupAssociations: PropTypes.shape({}),
  }),
  enterpriseUUID: PropTypes.string.isRequired,
  isRetired: PropTypes.bool.isRequired,
};

BudgetStatusSubtitle.defaultProps = {
  isBnREnabled: false,
};

export default BudgetStatusSubtitle;
