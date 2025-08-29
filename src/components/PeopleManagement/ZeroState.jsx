import React, { useContext } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card } from '@openedx/paragon';

import cardImage from './images/ZeroStateImage.svg';
import { SUBSIDY_TYPES } from '../../data/constants/subsidyTypes';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';

const ZeroState = () => {
  const { enterpriseSubsidyTypes } = useContext(EnterpriseSubsidiesContext);

  const hasLearnerCredit = enterpriseSubsidyTypes.includes(
    SUBSIDY_TYPES.budget,
  );
  const hasOtherSubsidyTypes = enterpriseSubsidyTypes.includes(SUBSIDY_TYPES.license)
    || enterpriseSubsidyTypes.includes(SUBSIDY_TYPES.coupon);

  return (
    <Card>
      <Card.ImageCap
        className="mh-100"
        src={cardImage}
        srcAlt="Two people carrying a cartoon arrow"
      />
      <span className="text-center align-self-center">
        <h2 className="h3 mb-3 mt-3">
          <FormattedMessage
            id="adminPortal.peopleManagement.zeroState.card.header"
            defaultMessage="You don't have any groups yet."
            description="Header message shown to admin there's no groups created yet."
          />
        </h2>
        <p className="mx-2">
          {hasLearnerCredit && (
            <FormattedMessage
              id="adminPortal.peopleManagement.zeroState.card.subtitle.lc"
              defaultMessage="Once a group is created, you can track members' progress, assign extra courses, and invite them to additional budgets."
              description="Detail message shown to admin benefits of creating a group with learner credit."
            />
          )}
          {!hasLearnerCredit && hasOtherSubsidyTypes && (
            <FormattedMessage
              id="admin.portal.people.management.page.zerostate.card.subtitle.noLc"
              defaultMessage="Once a group is created, you can track members' progress."
              description="Detail message shown to admin benefits of creating a group without learner credit."
            />
          )}
        </p>
      </span>
    </Card>
  );
};

export default ZeroState;
