import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { ActionRow, Button } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';

import ValidatedEmailsContextProvider from './data/ValidatedEmailsContextProvider';
import CreateGroupModal from './CreateGroupModal';
import PeopleManagementTable from './PeopleManagementTable';
import { ORGANIZE_LEARNER_TARGETS } from '../ProductTours/AdminOnboardingTours/constants';

const LearnerTabContent = ({
  hasLearnerCredit,
  hasOtherSubsidyTypes,
  handleOnClickCreateGroup,
  isModalOpen,
  openModal,
  closeModal,
  handleInviteError,
  groupsCardSection,
}) => (
  <>
    <span id={ORGANIZE_LEARNER_TARGETS.ORG_GROUPS}>
      <ActionRow className="mb-4 mt-2">
        <span className="flex-column">
          <h3 className="mt-2">
            <FormattedMessage
              id="adminPortal.peopleManagement.title"
              defaultMessage="Your organization's groups"
              description="Title for people management page."
            />
          </h3>

          {hasLearnerCredit && (
            <FormattedMessage
              id="adminPortal.peopleManagement.subtitle.lc"
              defaultMessage="Monitor group learning progress, assign more courses, and invite members to new Learner Credit budgets."
              description="Subtitle for people management with learner credit."
            />
          )}

          {!hasLearnerCredit && hasOtherSubsidyTypes && (
            <FormattedMessage
              id="adminPortal.peopleManagement.subtitle.noLc"
              defaultMessage="Monitor group learning progress."
              description="Subtitle for people management without learner credit."
            />
          )}
        </span>

        <ActionRow.Spacer />

        <Button
          iconBefore={Add}
          onClick={handleOnClickCreateGroup}
          id={ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}
        >
          <FormattedMessage
            id="adminPortal.peopleManagement.newGroup.button"
            defaultMessage="Create group"
            description="CTA button text to open new group modal."
          />
        </Button>

        <ValidatedEmailsContextProvider>
          <CreateGroupModal
            isModalOpen={isModalOpen}
            openModel={openModal}
            closeModal={closeModal}
            onInviteError={handleInviteError}
          />
        </ValidatedEmailsContextProvider>
      </ActionRow>

      {groupsCardSection}
    </span>

    <h3 className="mt-3">
      <FormattedMessage
        id="adminPortal.peopleManagement.dataTable.learnersTitle"
        defaultMessage="Your organization's learners"
        description="Title for people management data table."
      />
    </h3>
    <p className="mb-2">
      <FormattedMessage
        id="adminPortal.peopleManagement.dataTable.learnersSubtitle"
        defaultMessage="View all learners of your organization."
        description="Subtitle for people management learners data table."
      />
    </p>

    <span id={ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_TABLE}>
      <PeopleManagementTable />
    </span>
  </>
);

LearnerTabContent.propTypes = {
  hasLearnerCredit: PropTypes.bool.isRequired,
  hasOtherSubsidyTypes: PropTypes.bool.isRequired,
  handleOnClickCreateGroup: PropTypes.func.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleInviteError: PropTypes.func.isRequired,
  groupsCardSection: PropTypes.node.isRequired,
};

export default LearnerTabContent;
