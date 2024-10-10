import React, { useReducer, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Breadcrumb, Card, Hyperlink, Icon, IconButton, IconButtonWithTooltip, Skeleton, Toast, useToggle,
} from '@openedx/paragon';
import { Delete, Edit } from '@openedx/paragon/icons';

import { useEnterpriseGroupUuid } from '../learner-credit-management/data';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import DeleteGroupModal from './DeleteGroupModal';
import EditGroupNameModal from './EditGroupNameModal';

const GroupDetailPage = () => {
  const intl = useIntl();
  const { enterpriseSlug, groupUuid } = useParams();
  const { data: enterpriseGroup } = useEnterpriseGroupUuid(groupUuid);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [isEditModalOpen, openEditModal, closeEditModal] = useToggle(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [groupName, setGroupName] = useState(enterpriseGroup.name);

  useEffect(() => {
    if (enterpriseGroup !== undefined) {
      setIsLoading(false);
    }
  }, [enterpriseGroup]);

  const handleNameUpdate = (name) => {
    setGroupName(name);
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
      {isLoading && <Skeleton className="mt-3" height={200} count={1} />}
      {!isLoading && (
        <>
          <Toast onClose={() => setShowToast(false)} show={showToast}>
            {toastMessage}
          </Toast>
          <DeleteGroupModal
            group={enterpriseGroup}
            isOpen={isDeleteModalOpen}
            close={closeDeleteModal}
          />
          <EditGroupNameModal
            group={enterpriseGroup}
            isOpen={isEditModalOpen}
            close={closeEditModal}
            setShowToast={setShowToast}
            setToastMessage={setToastMessage}
            handleNameUpdate={handleNameUpdate}
          />
          <Breadcrumb
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
            activeLabel={enterpriseGroup.name}
          />
          <Card orientation="horizontal">
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
                subtitle={`${enterpriseGroup.acceptedMembersCount} accepted members`}
              />
              <Card.Section className="pt-1 x-small">Created on</Card.Section>
            </Card.Body>
            <Card.Footer
              className="justify-content-end"
              orientation="horizontal"
            >
              <IconButtonWithTooltip
                alt="icon to trash group"
                key="trashGroupTooltip"
                tooltipPlacement="top"
                tooltipContent={tooltipContent}
                src={Delete}
                iconAs={Icon}
                data-testid="delete-group-icon"
                className="mr-2"
                onClick={openDeleteModal}
              />
              <Hyperlink
                className="btn btn-primary"
                target="_blank"
                destination={`/${enterpriseSlug}/admin/${ROUTE_NAMES.learners}`}
              >
                View group progress
              </Hyperlink>
            </Card.Footer>
          </Card>
        </>
      )}
    </div>
  );
};

export default GroupDetailPage;
