import React from 'react'
import ReduxFormCheckbox from '../ReduxFormCheckbox';
import IconWithTooltip from '../IconWithTooltip';

const CheckboxWithTooltip = ({ className, icon, altText, tooltipText, ...props}) => {
  return (
    <div className={className}>
      <ReduxFormCheckbox {...props} />
      <IconWithTooltip
        icon={icon}
        altText={altText}
        tooltipText={tooltipText}
      />
    </div>
  );
};

export default CheckboxWithTooltip;
