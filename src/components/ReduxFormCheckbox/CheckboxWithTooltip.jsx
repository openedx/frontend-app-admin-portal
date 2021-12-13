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
    {icon && (
    <IconWithTooltip
      icon={icon}
      altText={altText}
      tooltipText={tooltipText}
    />
    )}
  </div>
);

CheckboxWithTooltip.propTypes = {
  className: PropTypes.string,
  // Icon should be a paragon icon
  icon: PropTypes.shape({}),
  altText: PropTypes.string,
  tooltipText: PropTypes.string,
};

CheckboxWithTooltip.defaultProps = {
  className: '',
  icon: null,
  altText: null,
  tooltipText: null,
};

export default CheckboxWithTooltip;
