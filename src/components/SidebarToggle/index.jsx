import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@edx/paragon';

import './SidebarToggle.scss';

const SidebarToggle = (props) => {
  const {
    isExpandedByToggle,
    expandSidebar,
    collapseSidebar,
  } = props;

  const iconClass = isExpandedByToggle ? 'fa-times' : 'fa-bars';

  return (
    <Button
      className={['sidebar-toggle-btn', 'mr-2', 'bg-white']}
      label={
        <React.Fragment>
          <Icon className={['fa', iconClass]} />
          <span className="sr-only">
            {isExpandedByToggle ? 'close menu' : 'open menu'}
          </span>
        </React.Fragment>
      }
      onClick={isExpandedByToggle ? collapseSidebar : expandSidebar}
      aria-controls="sidebar"
    />
  );
};

SidebarToggle.propTypes = {
  expandSidebar: PropTypes.func.isRequired,
  collapseSidebar: PropTypes.func.isRequired,
  isExpandedByToggle: PropTypes.bool.isRequired,
};

export default SidebarToggle;
