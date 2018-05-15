import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';


const VerticalNav = function VerticalNav(props) {
  return (
    <div>
      <Link to={{
          pathname: props.previousPath,
          state: {node: props.previousNode},
          }}
        >
        <Button label="Previous" />
      </Link>
      
      <Link to={{
          pathname: props.nextPath,
          state: {node: props.nextNode},
          }}
        >
        <Button label="Next" />
      </Link>
    </div>
  );
};

VerticalNav.defaultProps = {
  previousPath: '',
  previousNode: {},
  nextPath: '',
  nextNode: {},
};

VerticalNav.propTypes = {
  previousPath: PropTypes.string,
  previousNode: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  nextPath: PropTypes.string,
  nextNode: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

export default VerticalNav;
