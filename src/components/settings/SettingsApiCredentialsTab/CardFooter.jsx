import React, {
} from 'react';
import { Card, Icon } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

const CardFooter = ({ hasError, children }) => (
  <Card.Footer className={hasError ? 'error-footer d-table-row' : ''}>
    { hasError && (
    <p className="d-flex small">
      <Icon className="error-icon" src={Error} />
      Something went wrong while generating your credentials.
      Please try again. If the issue continues, contact Enterprise Customer Support.
    </p>
    )}
    {children}
  </Card.Footer>
);

CardFooter.propTypes = {
  hasError: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};
export default CardFooter;

