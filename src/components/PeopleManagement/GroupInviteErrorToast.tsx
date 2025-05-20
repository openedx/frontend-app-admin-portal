import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Toast } from '@openedx/paragon';
import { ERROR_LEARNER_NOT_IN_ORG } from './constants';
import { GroupErrorType } from './utils';

type GroupErrorToastProps = {
  isOpen: boolean,
  errorType: GroupErrorType,
  closeToast: () => void,
};

const GroupInviteErrorToast = ({ isOpen, errorType, closeToast }: GroupErrorToastProps) => {
  const intl = useIntl();

  const generateErrorText = () => {
    let text = '';
    if (errorType === ERROR_LEARNER_NOT_IN_ORG) {
      text = 'Looks like some learners aren\'t linked to your organization. '
        + 'Please make sure they are associated with a subsidy before adding them to a group.';
    }
    return intl.formatMessage({
      id: 'admin.portal.people.management.group.error.toast',
      defaultMessage: text,
      description: 'Toast text indicating failure to add group members who are not part of the org.',
    });
  };

  const toastText = generateErrorText();

  return (
    <Toast onClose={closeToast} show={isOpen}>{toastText}</Toast>
  );
};

GroupInviteErrorToast.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  errorType: PropTypes.string.isRequired,
  closeToast: PropTypes.func.isRequired,
};

export default GroupInviteErrorToast;
