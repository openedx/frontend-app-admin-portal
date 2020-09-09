import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@edx/paragon';
import classNames from 'classnames';

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
      variant="link"
      className="sidebar-toggle-btn px-1 mr-2 text-dark"
      onClick={isExpandedByToggle ? collapseSidebar : expandSidebar}
      aria-controls="sidebar"
    >
      <React.Fragment>
        <Icon className={classNames('fa', iconClass)} />
        <span className="sr-only">
          {isExpandedByToggle ? 'close menu' : 'open menu'}
        </span>
      </React.Fragment>
    </Button>
  );
};

SidebarToggle.propTypes = {
  expandSidebar: PropTypes.func.isRequired,
  collapseSidebar: PropTypes.func.isRequired,
  isExpandedByToggle: PropTypes.bool.isRequired,
};

export default SidebarToggle;
