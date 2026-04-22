import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import {
  Avatar, Card, Chip, Col, Row,
} from '@openedx/paragon';
import { Timelapse } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import AdminActionsMenu from './AdminActionsMenu';
import LinkCopiedToast from '../settings/SettingsAccessTab/LinkCopiedToast';
import { configuration } from '../../config';

const renderAdminStatus = (status) => (
  status === 'Pending' ? <Chip iconBefore={Timelapse}>{status}</Chip> : status
);

const OrgInviteAdminCard = ({
  original, onRemoveAdmin,
}) => {
  const { enterpriseSlug } = useParams();
  const {
    name, invitedDate, joinedDate, email, status,
  } = original;
  const [isCopyLinkToastOpen, setIsCopyLinkToastOpen] = useState(false);
  const joinedOrg = joinedDate || invitedDate;
  const lmsBaseUrl = `${configuration.BASE_URL}`;
  const inviteLink = `${lmsBaseUrl}/${enterpriseSlug}/admin/register`;
  const hasClipboard = !!navigator.clipboard;

  const handleCopyInviteLink = () => {
    if (!hasClipboard || !inviteLink) {
      return;
    }

    const addToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(inviteLink);
        setIsCopyLinkToastOpen(true);
      } catch (error) {
        logError(error);
      }
    };
    addToClipboard();
  };

  const handleCloseLinkCopyToast = () => {
    setIsCopyLinkToastOpen(false);
  };

  return (
    <Card orientation="horizontal">
      <Card.Body>
        <Card.Section className="pb-1">
          <Row className="d-flex flex-row">
            <Col xs={2}>
              <Avatar size="lg" />
            </Col>
            <Col>
              <Row>
                <h3 className="pt-2">{name}</h3>
              </Row>
              <Row>
                <p>{email}</p>
              </Row>
            </Col>
            <Col>
              <h5 className="pt-2 text-uppercase">
                {joinedDate ? (
                  <FormattedMessage
                    id="adminPortal.peopleManagement.joinedOrg"
                    defaultMessage="Joined org"
                    description="Title for people management admin date column when an admin already joined."
                  />
                ) : (
                  <FormattedMessage
                    id="adminPortal.peopleManagement.invitedDate"
                    defaultMessage="Invited date"
                    description="Title for people management admin date column when an admin is still invited."
                  />
                )}
              </h5>
              {joinedOrg}
            </Col>
            <Col>
              <h5 className="pt-2 text-uppercase">
                <FormattedMessage
                  id="adminPortal.peopleManagement.role"
                  defaultMessage="Role"
                  description="Title for people management invite admin Role status."
                />
              </h5>
              {renderAdminStatus(status)}
            </Col>
            <div>
              <AdminActionsMenu
                adminId={original.id}
                onRemove={() => onRemoveAdmin(original)}
                onCopy={handleCopyInviteLink}
              />
            </div>
          </Row>
          <LinkCopiedToast show={isCopyLinkToastOpen} onClose={handleCloseLinkCopyToast} />
        </Card.Section>
      </Card.Body>
    </Card>
  );
};

OrgInviteAdminCard.propTypes = {
  original: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
    name: PropTypes.string,
    joinedDate: PropTypes.string,
    invitedDate: PropTypes.string,
    status: PropTypes.string.isRequired,
  }).isRequired,

  onRemoveAdmin: PropTypes.func.isRequired,
};

export default OrgInviteAdminCard;
