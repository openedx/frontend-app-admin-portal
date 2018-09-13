import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@edx/paragon';
import classNames from 'classnames';


function SidebarToggle(props) {
  return (
    <Button
      label={
        <span>
          <Icon
            className={
              classNames({
                fa: true,
                'fa-times': props.expanded,
                'fa-bars': !props.expanded,
              }).split(' ')
            }
          />
        </span>
      }
      onClick={props.toggleSidebar}
    />
  );
}

SidebarToggle.defaultProps = {
  expanded: false,
  toggleSidebar: () => {},
};

SidebarToggle.propTypes = {
  expanded: PropTypes.bool,
  toggleSidebar: PropTypes.func,
};

export default SidebarToggle;
