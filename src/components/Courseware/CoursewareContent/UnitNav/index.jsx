import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';


function NavButton(props) {
  if (props.onClick) {
    return <Button label={props.label} className={['btn-primary']} onClick={props.onClick}/>
  }

  return <Button label={props.label} className={['btn-primary', 'disabled']}/>
}

function UnitNav(props) {
  return (
    <div>
      <NavButton onClick={props.previous} label="Previous" />
      <NavButton onClick={props.next} label="Next" />
    </div>
  );
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
