import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon, ModalPopup } from '@edx/paragon';
import { ASSIGNMENT_STATUS_MODAL_MAX_WIDTH } from '../data';

export const BaseModalPopupHeading = ({ icon, iconClassName, children }) => (
  <div className="px-2.5 pt-2.5">
    <h3 className="h5 mb-0 d-flex align-items-center">
      <Icon src={icon} className={classNames('mr-2', iconClassName)} />
      {children}
    </h3>
  </div>
);

export const BaseModalPopupContent = ({ children }) => (
  <>
    <hr />
    <div className="px-2.5">
      {children}
    </div>
  </>
);

const BaseModalPopup = ({
  placement,
  positionRef,
  isOpen,
  onClose,
  children,
  ...rest
}) => (
  <ModalPopup
    hasArrow
    placement={placement}
    positionRef={positionRef}
    isOpen={isOpen}
    onClose={onClose}
    {...rest}
  >
    <div className="small shadow border rounded bg-white" style={{ maxWidth: ASSIGNMENT_STATUS_MODAL_MAX_WIDTH }}>
      <div className="px-2.5">
        {children}
      </div>
    </div>
  </ModalPopup>
);

BaseModalPopup.Heading = BaseModalPopupHeading;
BaseModalPopup.Content = BaseModalPopupContent;

BaseModalPopupHeading.propTypes = {
  icon: PropTypes.elementType.isRequired,
  iconClassName: PropTypes.string,
  children: PropTypes.node.isRequired,
};

BaseModalPopupHeading.defaultProps = {
  iconClassName: undefined,
};

BaseModalPopupContent.propTypes = {
  children: PropTypes.node.isRequired,
};

BaseModalPopup.propTypes = {
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right', 'auto']),
  positionRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default BaseModalPopup;
