import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { Close, MenuIcon } from '@openedx/paragon/icons';

import './SidebarToggle.scss';

const SidebarToggle = (props) => {
  const {
    isExpandedByToggle,
    expandSidebar,
    collapseSidebar,
  } = props;

  const Icon = isExpandedByToggle ? Close : MenuIcon;

  return (
    <Button
      variant="link"
      className="sidebar-toggle-btn px-1 mr-2 text-dark"
      onClick={isExpandedByToggle ? collapseSidebar : expandSidebar}
      aria-controls="sidebar"
      iconBefore={Icon}
    >
      <span className="sr-only">
        {isExpandedByToggle ? 'close menu' : 'open menu'}
      </span>
    </Button>
  );
};

SidebarToggle.propTypes = {
  expandSidebar: PropTypes.func.isRequired,
  collapseSidebar: PropTypes.func.isRequired,
  isExpandedByToggle: PropTypes.bool.isRequired,
};

export default SidebarToggle;
