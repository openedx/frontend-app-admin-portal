import { Card, Button } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import cardImage from '../../../data/images/ZeroState.svg';

const ZeroStateCard = ({
  setShowZeroStateCard,
}) => {
  const handleClick = () => {
    // setShowZeroStateCard(false);
    // eslint-disable-next-line no-console
    console.log('ss');
  };

  return (
    <Card style={{ width: '70%' }}>
      <Card.ImageCap
        className="no-config secondary-background"
        src={cardImage}
        srcAlt="Card image"
      />
      <Card.Section className="text-center">
        <h2>You don&apos;t hava API credentials yet.</h2>
        <p>
          edX for business API credentials will provide access to the following edX API endpoints:
          reporting dashboard, dashboard, and catalog administration.
          <br />
          <br />
          By clicking the button below, you and your organization accept the {'\n'}
          <a href="https://courses.edx.org/api-admin/terms-of-service/">edX API terms of service</a>.
        </p>
        <Button
          variant="primary"
          size="lg"
          iconBefore={Add}
          onClick={handleClick}
          block
        >
          Generate API Credentials
        </Button>
      </Card.Section>
    </Card>
  );
};

ZeroStateCard.propTypes = {
  setShowZeroStateCard: PropTypes.func.isRequired,
};

export default ZeroStateCard;
