import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Hyperlink } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

import BaseModalPopup from '../assignments-status-chips/BaseModalPopup';

const RequestFailureModal = ({
  errorReason, isOpen, onClose, target, recentAction,
}) => {
  if (!isOpen) { return null; }
  const isDeclinedReason = recentAction === 'Declined';
  const isApprovedReason = recentAction === 'Approved';
  const modalContent = (
    <BaseModalPopup
      positionRef={target}
      isOpen={isOpen}
      onClose={onClose}
    >
      <BaseModalPopup.Heading icon={Error} iconClassName="text-danger">
        {errorReason}
      </BaseModalPopup.Heading>
      <BaseModalPopup.Content>
        <p>
          {isDeclinedReason && 'Your attempt to decline this enrollment request has failed. '}
          {isApprovedReason && 'This enrollment request was not approved. '}
          Something went wrong behind the scenes.
        </p>
        <div className="micro">
          <p className="h6">Suggested resolution steps</p>
          <ul className="text-gray pl-3">
            <li>Wait and try to {isDeclinedReason ? 'decline' : 'approve'} this enrollment request again later</li>
            <li>If the issue continues, contact customer support</li>
            <li>
              Get more troubleshooting help at{' '}
              <Hyperlink
                destination={
                  getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL
                }
                target="_blank"
              >
                Help Center
              </Hyperlink>
            </li>
          </ul>
        </div>
      </BaseModalPopup.Content>
    </BaseModalPopup>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

RequestFailureModal.propTypes = {
  errorReason: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  target: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  recentAction: PropTypes.string,
};

RequestFailureModal.defaultProps = {
  errorReason: null,
  target: null,
  recentAction: null,
};

export default RequestFailureModal;
