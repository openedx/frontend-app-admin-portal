import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, Card,
} from '@edx/paragon';

import nameYourLearner from '../../images/nameYourLearner.png';

const AssignMoreCoursesCard = ({ balance, expirationDate }) => (
  <Card orientation="horizontal">
    <Card.ImageCap
      src={nameYourLearner}
      srcAlt="Illustration for naming your learner"
      className="bg-light-200 text-center align-items-center mb-20"
      size="lg"
    />
    <Card.Body>
      <Card.Section orientation="horizontal">
        <h5>
          Assign more courses to maximize your budget.
        </h5>
        <p>
          Your budget’s available balance of ${balance} will expire on {expirationDate}.
        </p>
      </Card.Section>
    </Card.Body>
    <Card.Footer orientation="horizontal" className="text-center align-items-center">
      <Button variant="primary">Assign courses</Button>
    </Card.Footer>
  </Card>
);

AssignMoreCoursesCard.propTypes = {
  balance: PropTypes.string.isRequired,
  expirationDate: PropTypes.string.isRequired,
};
export default AssignMoreCoursesCard;
