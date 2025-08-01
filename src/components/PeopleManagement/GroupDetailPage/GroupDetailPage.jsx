import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Breadcrumb, Card, Hyperlink, Icon, IconButton, IconButtonWithTooltip, Skeleton, useToggle,
} from '@openedx/paragon';
import { Delete, Edit } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { useEnterpriseGroupLearnersTableData, useEnterpriseGroupUuid } from '../data/hooks';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
import DeleteGroupModal from './DeleteGroupModal';
import EditGroupNameModal from './EditGroupNameModal';
import formatDates from '../utils';
import GroupMembersTable from './GroupMembersTable';
import AddMembersModal from '../AddMembersModal/AddMembersModal';
import { makePlural } from '../../../utils';
import EVENT_NAMES from '../../../eventTracking';
import ValidatedEmailsContextProvider from '../data/ValidatedEmailsContextProvider';
import GroupInviteErrorToast from '../GroupInviteErrorToast';
import { ORGANIZE_LEARNER_TARGETS } from '../../ProductTours/AdminOnboardingTours/constants';

const GroupDetailPage = ({ enterpriseUUID }) => {
  const intl = useIntl();
  const { enterpriseSlug, groupUuid } = useParams();
  const { data: enterpriseGroup, isLoading } = useEnterpriseGroupUuid(groupUuid);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [isEditModalOpen, openEditModal, closeEditModal] = useToggle(false);
  const [groupName, setGroupName] = useState(enterpriseGroup?.name);
  const [isAddMembersModalOpen, openAddMembersModal, closeAddMembersModal] = useToggle(false);
  const [isGroupInviteErrorModalOpen, openGroupInviteErrorModal, closeGroupInviteErrorModal] = useToggle(false);
  const [groupInviteError, setGroupInviteError] = useState('');
  const {
    isLoading: isTableLoading,
    enterpriseGroupLearnersTableData,
    fetchEnterpriseGroupLearnersTableData,
    fetchAllEnterpriseGroupLearnersData,
    refresh,
    setRefresh,
  } = useEnterpriseGroupLearnersTableData({ groupUuid, isAddMembersModalOpen });
  const handleNameUpdate = (name) => {
    setGroupName(name);
  };

  useEffect(() => {
    if (enterpriseGroup !== undefined) {
      handleNameUpdate(enterpriseGroup.name);
    }
  }, [enterpriseGroup]);

  const handleInviteError = (errorType) => {
    setGroupInviteError(errorType);
    openGroupInviteErrorModal();
  };

  const tooltipContent = (
    <FormattedMessage
      id="adminPortal.peopleManagement.groupDetail.deleteGroup.icon"
      defaultMessage="Delete group"
      description="Tooltip to confirm meaning of trash icon."
    />
  );

  return (
    <div className="pt-4 pl-4">
      {!isLoading ? (
        <>
          <GroupInviteErrorToast
            isOpen={isGroupInviteErrorModalOpen}
            errorType={groupInviteError}
            closeToast={closeGroupInviteErrorModal}
          />
          <DeleteGroupModal
            group={enterpriseGroup}
            isOpen={isDeleteModalOpen}
            close={closeDeleteModal}
          />
          <EditGroupNameModal
            group={enterpriseGroup}
            isOpen={isEditModalOpen}
            close={closeEditModal}
            handleNameUpdate={handleNameUpdate}
          />
          <Breadcrumb
            id={ORGANIZE_LEARNER_TARGETS.GROUP_DETAIL_BREADCRUMBS}
            aria-label="people management breadcrumb navigation"
            links={[
              {
                label: intl.formatMessage({
                  id: 'adminPortal.peopleManagement.breadcrumb',
                  defaultMessage: 'People Management',
                  description:
                    'Breadcrumb label for the people management page',
                }),
                href: `/${enterpriseSlug}/admin/${ROUTE_NAMES.peopleManagement}`,
              },
            ]}
            activeLabel={groupName}
          />
          <Card id={ORGANIZE_LEARNER_TARGETS.GROUP_DETAIL_CARD} orientation="horizontal">
            <Card.Body>
              <Card.Header
                title={(
                  <>
                    <span className="pr-1">{groupName}</span>
                    <IconButton
                      key="editGroupTooltip"
                      src={Edit}
                      iconAs={Icon}
                      alt="Edit group"
                      className="mr-2"
                      onClick={openEditModal}
                      size="sm"
                      data-testid="edit-modal-icon"
                    />
                  </>
                )}
                subtitle={makePlural(enterpriseGroup.acceptedMembersCount, 'member')}
              />
              <Card.Section className="pt-1 x-small">
                Created on {formatDates(enterpriseGroup.created)}
              </Card.Section>
            </Card.Body>
            <Card.Footer
              className="justify-content-end"
              orientation="horizontal"
            >
              <IconButtonWithTooltip
                alt="icon to trash group"
                key="trashGroupTooltip"
                tooltipContent={tooltipContent}
                src={Delete}
                iconAs={Icon}
                data-testid="delete-group-icon"
                className="mr-2"
                onClick={openDeleteModal}
              />
              <Hyperlink
                id={ORGANIZE_LEARNER_TARGETS.VIEW_GROUP_PROGRESS}
                className="btn btn-primary"
                target="_blank"
                destination={`/${enterpriseSlug}/admin/${ROUTE_NAMES.learners}?group_uuid=${groupUuid}#fullreport`}
                onClick={() => {
                  sendEnterpriseTrackEvent(
                    enterpriseUUID,
                    EVENT_NAMES.PEOPLE_MANAGEMENT.VIEW_GROUP_PROGRESS_BUTTON,
                  );
                }}
              >
                View group progress
              </Hyperlink>
            </Card.Footer>
          </Card>
        </>
      ) : <Skeleton className="mt-3" height={200} count={1} />}
      <div className="mb-4 mt-5">
        <h4 className="mt-1">
          <FormattedMessage
            id="people.management.group.details.page.label"
            defaultMessage="Group members"
            description="Label for the groups detail page with members"
          />
        </h4>
        <p className="font-weight-light">
          <FormattedMessage
            id="people.management.group.details.page.description"
            defaultMessage="Add and remove group members."
            description="Description for the members table in the Groups detail page"
          />
        </p>
      </div>
      <GroupMembersTable
        isLoading={isTableLoading}
        tableData={enterpriseGroupLearnersTableData}
        fetchTableData={fetchEnterpriseGroupLearnersTableData}
        fetchAllData={fetchAllEnterpriseGroupLearnersData}
        dataCount={enterpriseGroupLearnersTableData.itemCount}
        groupUuid={groupUuid}
        refresh={refresh}
        setRefresh={setRefresh}
        openAddMembersModal={openAddMembersModal}
        groupName={groupName}
      />
      <ValidatedEmailsContextProvider>
        <AddMembersModal
          groupUuid={groupUuid}
          groupName={groupName}
          isModalOpen={isAddMembersModalOpen}
          closeModal={closeAddMembersModal}
          onInviteError={handleInviteError}
        />
      </ValidatedEmailsContextProvider>
    </div>
  );
};

GroupDetailPage.propTypes = {
  enterpriseUUID: PropTypes.string,
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(GroupDetailPage);
