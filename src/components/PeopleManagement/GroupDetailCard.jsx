import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { Card, Hyperlink } from '@openedx/paragon';
import EVENT_NAMES from '../../eventTracking';
import { groupDetailPageUrl } from './utils';

const GroupDetailCard = ({ enterpriseUUID, group }) => {
  const { enterpriseSlug } = useParams();
  const groupDetailUrl = groupDetailPageUrl({ enterpriseSlug, groupUuid: group.uuid });
  return (
    <Card className="group-detail-card">
      <Card.Header title={group.name} />
      <Card.Section>
        {group.acceptedMembersCount} members
      </Card.Section>
      <Card.Footer className="card-button">
        <Hyperlink
          className="btn btn-outline-primary"
          destination={groupDetailUrl}
          onClick={() => {
            sendEnterpriseTrackEvent(
              enterpriseUUID,
              EVENT_NAMES.PEOPLE_MANAGEMENT.VIEW_GROUP_BUTTON,
            );
          }}
        >
          View group
        </Hyperlink>
      </Card.Footer>
    </Card>
  );
};

GroupDetailCard.propTypes = {
  group: PropTypes.shape({
    acceptedMembersCount: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
  }).isRequired,
  enterpriseUUID: PropTypes.string,
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(GroupDetailCard);
