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
  formSwitchHelperText,
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
      <div className="d-flex justify-content-end mb-3">
        {loading && (
        <Spinner
          screenReaderText="Processing Feature Toggle"
          animation="border"
          className="mr-2"
          variant="primary"
          size="sm"
        />
        )}
        <Form.Switch
          disabled={disabled}
          onChange={onFormSwitchChange}
          checked={checked}
          helperText={formSwitchHelperText}
          className="justify-content-end"
        >
          Enable
        </Form.Switch>
      </div>
      <div>
        {children ? (
          <Collapsible
            open={isExpanded}
            onToggle={handleToggle}
            styling="card"
            title={<p><strong>{title}</strong></p>}
          >
            {children}
          </Collapsible>
        ) : (
          <p className="card rounded-0 p-2">
            <strong>{title}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

SettingsAccessTabSection.propTypes = {
  title: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onFormSwitchChange: PropTypes.func.isRequired,
  formSwitchHelperText: PropTypes.node,
  onCollapsibleToggle: PropTypes.func,
  children: PropTypes.node,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};

SettingsAccessTabSection.defaultProps = {
  formSwitchHelperText: null,
  onCollapsibleToggle: undefined,
  children: null,
  loading: false,
  disabled: false,
};

export default SettingsAccessTabSection;
