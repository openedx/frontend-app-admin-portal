import React from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Hyperlink, Icon, Skeleton,
} from '@openedx/paragon';
import { NorthEast } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import { groupDetailPageUrl } from '../utils';
import { useEnterpriseGroupMemberships } from '../data/hooks';
import { EnterpriseGroupMembershipArgs } from '../../../data/services/LmsApiService';

type GroupMembershipLinkProps = {
  groupMembership: EnterpriseGroupMembership
};

const GroupMembershipLink = ({ groupMembership }: GroupMembershipLinkProps) => {
  const { enterpriseSlug } = useParams() as { enterpriseSlug: string };
  const { groupUuid, groupName, recentAction } = groupMembership;
  const groupDetailUrl = groupDetailPageUrl({ enterpriseSlug, groupUuid });

  return (
    <div className="pl-3">
      <Hyperlink
        className="font-weight-bold pb-2"
        destination={groupDetailUrl}
        target="_blank"
        showLaunchIcon={false}
      >
        {groupName}
        <Icon
          id="SampleIcon"
          size="xs"
          src={NorthEast}
          screenReaderText="Visit group detail page"
          className="ml-1 mb-1"
        />
      </Hyperlink>
      <p className="small pb-2">{recentAction}</p>
    </div>
  );
};

GroupMembershipLink.propTypes = {
  groupMembership: PropTypes.shape({
    groupUuid: PropTypes.string.isRequired,
    groupName: PropTypes.string.isRequired,
    recentAction: PropTypes.string.isRequired,
  }),
};

const LearnerDetailGroupMemberships = ({ enterpriseUuid, lmsUserId }: EnterpriseGroupMembershipArgs) => {
  const { isLoading, data } = useEnterpriseGroupMemberships({ enterpriseUuid, lmsUserId });
  const groupMemberships = data?.data?.results || [];
  const intl = useIntl();
  const groupsHeader = intl.formatMessage({
    id: 'adminPortal.peopleManagement.learnerDetailPage.groupsHeader',
    defaultMessage: 'Groups',
    description: 'Header for groups the learner is part of',
  });
  const noGroupsMessage = intl.formatMessage({
    id: 'adminPortal.peopleManagement.learnerDetailPage.noGroupsMessage',
    defaultMessage: 'This learner has not been added to any groups.',
    description: 'Message displayed when a learner has no group memberships',
  });

  return (
    <div>
      {isLoading ? (
        <Skeleton
          width={400}
          height={200}
        />
      ) : (
        <div className="pt-3">
          <h3 className="pb-3">{groupsHeader}</h3>
          <div className="learner-detail-section">
            {groupMemberships.length > 0 ? (
              groupMemberships.map((groupMembership) => (
                <GroupMembershipLink key={groupMembership.groupUuid} groupMembership={groupMembership} />
              ))
            ) : (
              <p className="text-muted pl-3">{noGroupsMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

LearnerDetailGroupMemberships.propTypes = {
  groupMembership: PropTypes.shape({
    groupUuid: PropTypes.string.isRequired,
    groupName: PropTypes.string.isRequired,
    groupMembership: PropTypes.string.isRequired,
  }).isRequired,
};

export default LearnerDetailGroupMemberships;
