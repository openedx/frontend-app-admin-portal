import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Collapsible,
  Form,
} from '@edx/paragon';

const SettingsAccessTabSection = ({
  title,
  checked,
  onChange,
  children,
}) => {
  const [isExpanded, setExpanded] = useState(true);
  return (
    <div className="mb-4">
      <div className="d-flex flex-row-reverse mb-3">
        <Form.Switch onChange={onChange} checked={checked}>Enable</Form.Switch>
      </div>
      <div>
        <Collapsible
          open={isExpanded}
          onToggle={isOpen => setExpanded(isOpen)}
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
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default SettingsAccessTabSection;
