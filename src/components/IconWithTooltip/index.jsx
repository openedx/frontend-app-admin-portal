import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OverlayTrigger, Tooltip, useWindowSize } from '@edx/paragon';

const IconWithTooltip = ({
  icon, altText, tooltipText, placementSm = 'right', placementLg = 'top', trigger = ['hover', 'focus'], breakpoint = 768, iconClassNames = 'ml-1',
}) => {
  const { width } = useWindowSize();
  const placement = width >= breakpoint ? placementSm : placementLg;
  return (
    <OverlayTrigger
      trigger={trigger}
      placement={width >= breakpoint ? placementSm : placementLg}
      data-testid={`tooltip-${placement}`}
      overlay={(
        <Tooltip id={`tooltip-${placement}`}>
          {tooltipText}
        </Tooltip>
      )}
    >
      <FontAwesomeIcon className={iconClassNames} icon={icon} alt={altText} />
    </OverlayTrigger>
  );
};

IconWithTooltip.propTypes = {
  icon: PropTypes.shape({}).isRequired,
  altText: PropTypes.string.isRequired,
  tooltipText: PropTypes.string.isRequired,
  // These props have defaults above
  /* eslint-disable react/require-default-props */
  placementSm: PropTypes.oneOf(['top', 'right', 'left', 'bottom']),
  placementLg: PropTypes.oneOf(['top', 'right', 'left', 'bottom']),
  trigger: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  breakpoint: PropTypes.number,
  iconClassNames: PropTypes.string,
  /* eslint-enable react/require-default-props */
};

export default IconWithTooltip;
