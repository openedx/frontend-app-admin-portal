import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { Card, Hyperlink } from '@openedx/paragon';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';

const GroupDetailCard = ({ group }) => {
  const { enterpriseSlug } = useParams();
  return (
    <Card className="group-detail-card">
      <Card.Header title={group.name} />
      <Card.Section>
        {group.acceptedMembersCount} members
      </Card.Section>
      <Card.Footer className="card-button">
        <Hyperlink
          className="btn btn-outline-primary"
          destination={`/${enterpriseSlug}/admin/${ROUTE_NAMES.peopleManagement}/${group.uuid}`}
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
};

export default GroupDetailCard;
