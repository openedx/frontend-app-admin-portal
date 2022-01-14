import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Collapsible,
  Form,
  Spinner,
} from '@edx/paragon';

const SettingsAccessTabSection = ({
  title,
  checked,
  onFormSwitchChange,
  onCollapsibleToggle,
  children,
  loading,
  disabled,
}) => {
  const [isExpanded, setExpanded] = useState(true);

  const handleToggle = (isOpen) => {
    setExpanded(isOpen);
    if (onCollapsibleToggle) {
      onCollapsibleToggle(isOpen);
    }
  };

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-end align-items-center mb-3">
        {loading && <Spinner animation="border" className="mr-2" variant="primary" size="sm" />}
        <Form.Switch disabled={disabled} onChange={onFormSwitchChange} checked={checked}>
          Enable
        </Form.Switch>
      </div>
      <div>
        <Collapsible
          open={isExpanded}
          onToggle={handleToggle}
          styling="card"
          title={<p><strong>{title}</strong></p>}
        >
          {children}
        </Collapsible>
      </div>
    </div>
  );
};

SettingsAccessTabSection.propTypes = {
  title: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onFormSwitchChange: PropTypes.func.isRequired,
  onCollapsibleToggle: PropTypes.func,
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};

SettingsAccessTabSection.defaultProps = {
  onCollapsibleToggle: undefined,
  loading: false,
  disabled: false,
};

export default SettingsAccessTabSection;
