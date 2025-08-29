import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { Button, Card } from '@openedx/paragon';
import EVENT_NAMES from '../../eventTracking';
import { groupDetailPageUrl } from './utils';

const GroupDetailCard = ({ id, enterpriseUUID, group }) => {
  const { enterpriseSlug } = useParams();
  const groupDetailUrl = groupDetailPageUrl({ enterpriseSlug, groupUuid: group.uuid });
  return (
    <Card id={id} className="group-detail-card">
      <Card.Header title={group.name} />
      <Card.Section>
        {group.acceptedMembersCount} members
      </Card.Section>
      <Card.Footer className="card-button">
        <Button
          id="view-group-button"
          as={Link}
          to={groupDetailUrl}
          variant="outline-primary"
          onClick={() => {
            sendEnterpriseTrackEvent(
              enterpriseUUID,
              EVENT_NAMES.PEOPLE_MANAGEMENT.VIEW_GROUP_BUTTON,
            );
          }}
        >
          View group
        </Button>
      </Card.Footer>
    </Card>
  );
};

GroupDetailCard.propTypes = {
  id: PropTypes.string,
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
