import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReduxFormCheckbox from '.';
import IconWithTooltip from '../IconWithTooltip';

import './CheckboxWithTooltip.scss';

const CheckboxWithTooltip = ({
  className, icon, altText, tooltipText, ...props
}) => (
  <div className={classNames('checkbox-with-tooltip', { className })}>
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
  // Icon should be a paragon icon
  icon: PropTypes.shape().isRequired,
  altText: PropTypes.string.isRequired,
  tooltipText: PropTypes.string.isRequired,
};

export default CheckboxWithTooltip;
