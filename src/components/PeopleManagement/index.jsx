import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Skeleton,
  useToggle,
} from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';

import Hero from '../Hero';
import { SUBSIDY_TYPES } from '../../data/constants/subsidyTypes';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import CreateGroupModal from './CreateGroupModal';
import { useAllEnterpriseGroups } from '../learner-credit-management/data';
import ZeroState from './ZeroState';
import GroupCardGrid from './GroupCardGrid';
import PeopleManagementTable from './PeopleManagementTable';

const PeopleManagementPage = ({ enterpriseId }) => {
  const intl = useIntl();
  const PAGE_TITLE = intl.formatMessage({
    id: 'admin.portal.people.management.page',
    defaultMessage: 'People Management',
    description: 'Title for the people management page.',
  });

  const { enterpriseSubsidyTypes } = useContext(EnterpriseSubsidiesContext);
  const { data, isLoading: isGroupsLoading } = useAllEnterpriseGroups(enterpriseId);

  const hasLearnerCredit = enterpriseSubsidyTypes.includes(SUBSIDY_TYPES.budget);
  const hasOtherSubsidyTypes = enterpriseSubsidyTypes.includes(SUBSIDY_TYPES.license)
    || enterpriseSubsidyTypes.includes(SUBSIDY_TYPES.coupon);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isModalOpen, openModal, closeModal] = useToggle(false);
  const [groups, setGroups] = useState();

  useEffect(() => {
    if (data !== undefined) {
      setGroups(data.results);
    }
  }, [data]);

  let groupsCardSection = (<Skeleton height="20vh" />);
  if (!isGroupsLoading) {
    if (groups && groups.length > 0) {
      groupsCardSection = (<GroupCardGrid groups={groups} />);
    } else {
      groupsCardSection = (<ZeroState />);
    }
  }

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <div className="mx-3 mt-4">
        <ActionRow className="mb-4">
          <span className="flex-column">
            <span className="d-flex">
              <h3 className="mt-2">
                <FormattedMessage
                  id="adminPortal.peopleManagement.title"
                  defaultMessage="Your organization's groups"
                  description="Title for people management page."
                />
              </h3>
            </span>
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
          <Button iconBefore={Add} onClick={openModal}>
            <FormattedMessage
              id="adminPortal.peopleManagement.newGroup.button"
              defaultMessage="Create group"
              description="CTA button text to open new group modal."
            />
          </Button>
          <CreateGroupModal
            isModalOpen={isModalOpen}
            openModel={openModal}
            closeModal={closeModal}
          />
        </ActionRow>
        {groupsCardSection}
        <h3 className="mt-3">
          <FormattedMessage
            id="adminPortal.peopleManagement.dataTable.title"
            defaultMessage="Your organization's members"
            description="Title for people management data table."
          />
        </h3>
        <p className="mb-2">
          <FormattedMessage
            id="adminPortal.peopleManagement.dataTable.subtitle"
            defaultMessage="View all members of your organization."
            description="Subtitle for people management members data table."
          />
        </p>
        <PeopleManagementTable />
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

PeopleManagementPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(PeopleManagementPage);
