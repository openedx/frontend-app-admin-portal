import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';


function NavButton(props) {
  return (
    <Button
      label={props.label}
      className={['btn-primary', 'disabled']}
      onClick={props.onClick}
    />
  );
}

function UnitNav(props) {
  return (
    <div>
      <NavButton onClick={props.previous} label="Previous" />
      <NavButton onClick={props.next} label="Next" />
    </div>
  );
}

NavButton.defaultProps = {
  onClick: () => {},
};

NavButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

UnitNav.defaultProps = {
  previous: null,
  next: null,
};

UnitNav.propTypes = {
  previous: PropTypes.func,
  next: PropTypes.func,
};

export default UnitNav;
