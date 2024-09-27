import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Button, Card, Icon, IconButtonWithTooltip, useToggle,
} from '@openedx/paragon';
import { Add, InfoOutline } from '@openedx/paragon/icons';

import cardImage from './images/ZeroStateImage.svg';
import Hero from '../Hero';
import { SUBSIDY_TYPES } from '../../data/constants/subsidyTypes';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';

const PeopleManagementPage = () => {
  const intl = useIntl();
  const PAGE_TITLE = intl.formatMessage({
    id: 'admin.portal.people.management.page',
    defaultMessage: 'People Management',
    description: 'Title for the people management page.',
  });

  const {
    enterpriseSubsidyTypes,
  } = useContext(EnterpriseSubsidiesContext);

  const hasLearnerCredit = enterpriseSubsidyTypes.includes(SUBSIDY_TYPES.budget);
  const hasOtherSubsidyTypes = enterpriseSubsidyTypes.includes(SUBSIDY_TYPES.license)
    || enterpriseSubsidyTypes.includes(SUBSIDY_TYPES.coupon);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isModalOpen, openModal, closeModal] = useToggle(false);

  const tooltipContent = (
    <FormattedMessage
      id="admin.portal.people.management.page.tooltip.content"
      defaultMessage="Only available for Learner Credit"
      description="Tooltip to say this is only available for Learner Credit (not codes or subcriptions)."
    />
  );

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      {hasLearnerCredit && (
      <div className="mx-3 mt-4">
        <ActionRow className="mb-4">
          <span className="flex-column">
            <span className="d-flex">
              <h3 className="mt-2">
                <FormattedMessage
                  id="admin.portal.people.management.page.title"
                  defaultMessage="Your Learner Credit groups"
                  description="Title for people management zero state."
                />
              </h3>
              {hasLearnerCredit && hasOtherSubsidyTypes && (
              <IconButtonWithTooltip
                key="primary"
                tooltipPlacement="top"
                tooltipContent={tooltipContent}
                src={InfoOutline}
                iconAs={Icon}
                alt="Info Popup"
                onClick={() => {}}
                variant="primary"
                className="ml-1"
              />
              )}
            </span>
            <FormattedMessage
              id="admin.portal.people.management.page.subtitle"
              defaultMessage="Monitor group learning progress, assign more courses, and invite members to new Learner Credit budgets."
              description="Subtitle for people management zero state."
            />
          </span>
          <ActionRow.Spacer />
          <Button iconBefore={Add} onClick={openModal}>
            <FormattedMessage
              id="admin.portal.people.management.page.newgroup.button"
              defaultMessage="Create group"
              description="CTA button text to open new group modal."
            />
          </Button>
        </ActionRow>
        <Card>
          <Card.ImageCap
            className="mh-100"
            src={cardImage}
            srcAlt="Two people carrying a cartoon arrow"
          />
          <span className="text-center align-self-center">
            <h2 className="h3 mb-3 mt-3">
              <FormattedMessage
                id="admin.portal.people.management.page.zerostate.card.header"
                defaultMessage="You don't have any groups yet."
                description="Header message shown to admin there's no groups created yet."
              />
            </h2>
            <p className="mx-2">
              <FormattedMessage
                id="admin.portal.people.management.page.zerostate.card.subtitle"
                defaultMessage="Once a group is created, you can track members' progress, assign extra courses, and invite them to additional budgets."
                description="Detail message shown to admin benefits of creating a group."
              />
            </p>
          </span>
        </Card>
      </div>
      )}
    </>
  );
};

export default PeopleManagementPage;
