import React from 'react';

import PropTypes from 'prop-types';
import {
  Badge, Icon, OverlayTrigger, Stack, Tooltip,
} from '@edx/paragon';
import { GroupAdd, Groups } from '@edx/paragon/icons';

import { formatDate } from './data';
import useEnterpriseGroup from './data/hooks/useEnterpriseGroup';

const BudgetStatusSubtitle = ({
  badgeVariant, status, isAssignable, term, date, policy,
}) => {
  const { data } = useEnterpriseGroup(policy);
  const universalGroup = data?.appliesToAllContexts;
  const budgetType = isAssignable ? 'Assignable' : 'Browse & Enroll';
  const popoverText = universalGroup ? 'all people in your organization' : 'members added to this budget';
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
        <span> • {budgetType}</span>
        {(!isAssignable) && (
        <span> •
          <OverlayTrigger
            key="budget-tooltip"
            placement="top"
            overlay={(
              <Tooltip>
                Available to {popoverText}
              </Tooltip>
            )}
          >
            <Icon size="xs" src={universalGroup ? Groups : GroupAdd} className="ml-1 d-inline-flex" />
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
};

export default BudgetStatusSubtitle;
