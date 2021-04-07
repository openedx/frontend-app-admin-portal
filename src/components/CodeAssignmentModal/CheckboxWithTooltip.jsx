import React from 'react';
import PropTypes from 'prop-types';
import ReduxFormCheckbox from '../ReduxFormCheckbox';
import IconWithTooltip from '../IconWithTooltip';

const CheckboxWithTooltip = ({
  className, icon, altText, tooltipText, ...props
}) => (
  <div className={className}>
    <ReduxFormCheckbox {...props} />
    <IconWithTooltip
      icon={icon}
      altText={altText}
      tooltipText={tooltipText}
    />
  </div>
);

CheckboxWithTooltip.defaultProps = {
  className: '',
};

CheckboxWithTooltip.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.shape().isRequired,
  altText: PropTypes.string.isRequired,
  tooltipText: PropTypes.string.isRequired,
};

export default CheckboxWithTooltip;
