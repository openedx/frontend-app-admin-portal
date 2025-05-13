import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  Collapsible, Icon, ActionRow, Button,
} from '@openedx/paragon';
import { KeyboardArrowUp, KeyboardArrowDown } from '@openedx/paragon/icons';

const FloatingCollapsible = ({
  enterpriseBranding, onDismiss = () => {}, title, children,
}) => {
  const [collapseIsOpen, setCollapseOpen] = useState(true);

  const handleDismiss = () => {
    setCollapseOpen(false);
    onDismiss();
  };

  return (
    <div className="floating-collapsible bottom-right-fixed">
      <Collapsible.Advanced
        styling="card"
        open={collapseIsOpen}
        onToggle={isOpen => setCollapseOpen(isOpen)}
      >
        <Collapsible.Trigger
          className={`floating-collapsible__trigger p-3 h4 mb-0 ${collapseIsOpen ? 'rounded-top' : 'rounded'}`}
        >
          <div className="d-flex justify-content-between">
            <div>{title}</div>
            <Collapsible.Visible whenClosed>
              <Icon src={KeyboardArrowUp} />
            </Collapsible.Visible>
            <Collapsible.Visible whenOpen>
              <Icon src={KeyboardArrowDown} />
            </Collapsible.Visible>
          </div>
        </Collapsible.Trigger>
        <Collapsible.Body className="floating-collapsible__body bg-light-300 text-gray-700 rounded-bottom p-3">
          {children}
          <ActionRow>
            <Button variant="tertiary" onClick={() => setCollapseOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDismiss}>
              Dismiss
            </Button>
          </ActionRow>
        </Collapsible.Body>
      </Collapsible.Advanced>
    </div>
  );
};

const mapStateToProps = state => ({
  enterpriseBranding: state.portalConfiguration.enterpriseBranding,
});

export default connect(mapStateToProps)(FloatingCollapsible);
