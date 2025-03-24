import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Hyperlink, Skeleton,
} from '@openedx/paragon';

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
        isInline
      >
        {groupName}
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
  }).isRequired,
};

const LearnerDetailGroupMemberships = ({ enterpriseUuid, lmsUserId }: EnterpriseGroupMembershipArgs) => {
  const { isLoading, data } = useEnterpriseGroupMemberships({ enterpriseUuid, lmsUserId });
  const groupMemberships = data?.data?.results;

  return (
    <div>
      {isLoading ? (
        <Skeleton
          width={400}
          height={200}
        />
      ) : (groupMemberships && (
        <div className="pt-3">
          <h3 className="pb-3">Groups</h3>
          <div className="learner-detail-section">
            {groupMemberships?.map((groupMembership) => (<GroupMembershipLink groupMembership={groupMembership} />))}
          </div>
        </div>
      ))}
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
