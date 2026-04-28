import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Skeleton, Tab, Tabs, Toast, useToggle,
} from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@2uinc/frontend-enterprise-utils';

import Hero from '../Hero';
import { SUBSIDY_TYPES } from '../../data/constants/subsidyTypes';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import { useAllFlexEnterpriseGroups } from '../learner-credit-management/data';
import ZeroState from './ZeroState';
import GroupCardGrid from './GroupCardGrid';
import EVENT_NAMES from '../../eventTracking';
import GroupInviteErrorToast from './GroupInviteErrorToast';
import LearnerTabContent from './LearnerTabContent';
import InviteAdminsTable from './InviteAdminsTable';
import { useAdminsTabNotificationBubble } from './AdminsTabNotificationBubble';
import {
  ORGANIZE_LEARNER_TARGETS,
} from '../ProductTours/AdminOnboardingTours/constants';

let setTabFromTourHandler = null;
let getActiveTabFromTourHandler = null;

export const setPeopleManagementTabFromTour = (tabKey) => {
  if (typeof setTabFromTourHandler === 'function') {
    setTabFromTourHandler(tabKey);
  }
};

export const getPeopleManagementActiveTabForTour = () => {
  if (typeof getActiveTabFromTourHandler === 'function') {
    return getActiveTabFromTourHandler();
  }
  return null;
};

const PeopleManagementPage = ({ enterpriseId, learnersTabEnabled }) => {
  const intl = useIntl();
  const PAGE_TITLE = intl.formatMessage({
    id: 'admin.portal.people.management.page',
    defaultMessage: 'People Management',
    description: 'Title for the people management page.',
  });

  const [isToastOpen, openToast, closeToast] = useToggle(false);
  const toastText = intl.formatMessage({
    id: 'admin.portal.people.management.group.deleted.toast',
    defaultMessage: 'Group deleted',
    description: 'Toast text after a user has deleted a group.',
  });

  const [isGroupInviteErrorModalOpen, openGroupInviteErrorModal, closeGroupInviteErrorModal] = useToggle(false);
  const [groupInviteError, setGroupInviteError] = useState('');

  const { enterpriseSubsidyTypes } = useContext(EnterpriseSubsidiesContext);
  const { data, isLoading: isGroupsLoading } = useAllFlexEnterpriseGroups(enterpriseId);

  const hasLearnerCredit = enterpriseSubsidyTypes.includes(SUBSIDY_TYPES.budget);
  const hasOtherSubsidyTypes = enterpriseSubsidyTypes.includes(SUBSIDY_TYPES.license)
    || enterpriseSubsidyTypes.includes(SUBSIDY_TYPES.coupon);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isModalOpen, openModal, closeModal] = useToggle(false);
  const [groups, setGroups] = useState();
  const [activeTab, setActiveTab] = useState(learnersTabEnabled ? 'learners' : null);

  const {
    adminsTabNotificationBubble,
    onAdminsTabClick,
  } = useAdminsTabNotificationBubble();

  useEffect(() => {
    if (data !== undefined) {
      setGroups(data);
    }
  }, [data]);

  useEffect(() => {
    sendEnterpriseTrackEvent(
      enterpriseId,
      EVENT_NAMES.PEOPLE_MANAGEMENT.PAGE_VISIT,
    );
  }, [enterpriseId]);

  useEffect(() => {
    // parameter is for confirmation toast after deleting a group
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('toast')) {
      openToast();
    }
  }, [openToast]);

  useEffect(() => {
    setTabFromTourHandler = (tabKey) => {
      if (tabKey === 'learners' || tabKey === 'admins') {
        setActiveTab(tabKey);
        if (tabKey === 'admins') {
          onAdminsTabClick();
        }
      }
    };
    getActiveTabFromTourHandler = () => activeTab;

    return () => {
      setTabFromTourHandler = null;
      getActiveTabFromTourHandler = null;
    };
  }, [activeTab, onAdminsTabClick]);

  let groupsCardSection = (<Skeleton height="20vh" />);
  if (!isGroupsLoading) {
    if (groups && groups.length > 0) {
      groupsCardSection = (<GroupCardGrid groups={groups} />);
    } else {
      groupsCardSection = (<ZeroState />);
    }
  }

  const handleInviteError = (errorType) => {
    setGroupInviteError(errorType);
    openGroupInviteErrorModal();
  };

  const handleOnClickCreateGroup = () => {
    openModal();
    sendEnterpriseTrackEvent(
      enterpriseId,
      EVENT_NAMES.PEOPLE_MANAGEMENT.CREATE_GROUP_BUTTON_CLICK,
    );
  };

  const handleTabSelect = (key) => {
    setActiveTab(key);
    if (key === 'admins') {
      onAdminsTabClick();
    }
  };

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <Toast onClose={closeToast} show={isToastOpen}>
        {toastText}
      </Toast>
      <GroupInviteErrorToast
        isOpen={isGroupInviteErrorModalOpen}
        errorType={groupInviteError}
        closeToast={closeGroupInviteErrorModal}
      />
      <div className="mx-3 mt-4">
        {learnersTabEnabled ? (
        // NOTE:  this Tabs wrapper is intentional as we’ll be adding additional tabs soon.
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabSelect}
          >
            <Tab
              eventKey="learners"
              title={(
                <span id={ORGANIZE_LEARNER_TARGETS.LEARNERS_TAB}>
                  {intl.formatMessage({
                    id: 'adminPortal.peopleManagement.tabs.learners',
                    defaultMessage: 'Learners',
                    description: 'Learners tab title for people management page.',
                  })}
                </span>
              )}
            >
              <div className="pt-4">
                <LearnerTabContent
                  hasLearnerCredit={hasLearnerCredit}
                  hasOtherSubsidyTypes={hasOtherSubsidyTypes}
                  handleOnClickCreateGroup={handleOnClickCreateGroup}
                  isModalOpen={isModalOpen}
                  openModal={openModal}
                  closeModal={closeModal}
                  handleInviteError={handleInviteError}
                  groupsCardSection={groupsCardSection}
                />
              </div>
            </Tab>
            <Tab
              id={ORGANIZE_LEARNER_TARGETS.ADMINS_TAB}
              eventKey="admins"
              tabClassName={ORGANIZE_LEARNER_TARGETS.ADMINS_TAB}
              title={(
                <span className="position-relative">
                  {intl.formatMessage({
                    id: 'adminPortal.peopleManagement.tabs.admins',
                    defaultMessage: 'Admins',
                  })}
                  {adminsTabNotificationBubble}
                </span>
              )}
            >
              <InviteAdminsTable />
            </Tab>
          </Tabs>
        ) : (
          <LearnerTabContent
            hasLearnerCredit={hasLearnerCredit}
            hasOtherSubsidyTypes={hasOtherSubsidyTypes}
            handleOnClickCreateGroup={handleOnClickCreateGroup}
            isModalOpen={isModalOpen}
            openModal={openModal}
            closeModal={closeModal}
            handleInviteError={handleInviteError}
            groupsCardSection={groupsCardSection}
          />
        )}
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  learnersTabEnabled: state.portalConfiguration.enterpriseFeatures?.enterpriseInviteAdminsEnabled ?? false,
});

PeopleManagementPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  learnersTabEnabled: PropTypes.bool,
};

PeopleManagementPage.defaultProps = {
  learnersTabEnabled: false,
};

export default connect(mapStateToProps)(PeopleManagementPage);
