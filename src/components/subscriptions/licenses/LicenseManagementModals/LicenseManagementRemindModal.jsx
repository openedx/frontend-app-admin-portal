import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import {
  ActionRow, Alert, Form, Hyperlink, ModalDialog, Spinner, StatefulButton,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';

import { useRequestState } from './LicenseManagementModalHook';
import { validateEmailTemplateForm } from '../../../../data/validation/email';
import LicenseManagerApiService from '../../../../data/services/LicenseManagerAPIService';
import { configuration } from '../../../../config';
import { getSubscriptionContactText } from '../../../../utils';
import { transformFiltersForRequest } from '../../data/utils';

const generateEmailTemplate = (contactEmail, intl) => ({
  greeting: intl.formatMessage({
    id: 'admin.portal.subscription.remind.modal.email.template.greeting',
    defaultMessage: 'We noticed you haven’t had a chance to start learning on edX! It’s easy to get started and browse the course catalog.',
    description: 'Default greeting for subscription reminder emails.',
  }),
  body: intl.formatMessage({
    id: 'admin.portal.subscription.remind.modal.email.template.body',
    defaultMessage: "'{ENTERPRISE_NAME}' partnered with edX to give everyone access to high-quality online courses. Start your subscription and browse courses in nearly every subject including Data Analytics, Digital Media, Business & Leadership, Communications, Computer Science and so much more. Courses are taught by experts from the world\u2019s leading universities and corporations.\n\nStart learning: '{LICENSE_ACTIVATION_LINK}'",
    description: 'Default body for subscription reminder emails.',
  }),
  closing: getSubscriptionContactText(contactEmail, intl),
});

export const getUserEmailsToRemind = (usersToRemind, intl) => {
  const userEmailsToRemind = usersToRemind.map((user) => user.email);

  if (userEmailsToRemind.length > 0) {
    return userEmailsToRemind;
  }

  // If the UI happened to render bulk actions without any state set for the table or just a filter is set
  // with no selected items.
  logError(intl.formatMessage({
    id: 'admin.portal.subscription.remind.modal.no.selection.log.message',
    defaultMessage: 'Unable to remind license(s) based on table state. No licenses selected for reminder',
    description: 'Log message when no licenses are selected for reminder.',
  }));

  throw new Error(intl.formatMessage({
    id: 'admin.portal.subscription.remind.modal.no.selection.error.message',
    defaultMessage: 'Unable to remind license(s) based on table state',
    description: 'Error message when no licenses are selected for reminder.',
  }));
};

const LicenseManagementRemindModal = ({
  isOpen,
  onClose,
  onSuccess,
  onSubmit,
  subscription,
  usersToRemind,
  remindAllUsers,
  totalToRemind,
  contactEmail,
  activeFilters,
}) => {
  const intl = useIntl();
  const [requestState, setRequestState, initialRequestState] = useRequestState(isOpen);

  const [emailTemplate, setEmailTemplate] = useState(generateEmailTemplate(contactEmail, intl));
  const isExpired = dayjs().isAfter(subscription.expirationDate);

  let buttonNumberLabel = intl.formatMessage({
    id: 'admin.portal.subscription.remind.modal.button.all.label',
    defaultMessage: 'all',
    description: 'Label for reminding all users.',
  });
  if (Number.isFinite(totalToRemind)) {
    buttonNumberLabel = `(${totalToRemind})`;
  }

  const buttonLabels = {
    default: intl.formatMessage({
      id: 'admin.portal.subscription.remind.modal.button.default.label',
      defaultMessage: 'Remind {count}',
      description: 'Default remind button label.',
    }, { count: buttonNumberLabel }),
    pending: intl.formatMessage({
      id: 'admin.portal.subscription.remind.modal.button.pending.label',
      defaultMessage: 'Reminding {count}',
      description: 'Pending remind button label.',
    }, { count: buttonNumberLabel }),
    complete: intl.formatMessage({
      id: 'admin.portal.subscription.remind.modal.button.complete.label',
      defaultMessage: 'Done',
      description: 'Completed remind button label.',
    }),
    error: intl.formatMessage({
      id: 'admin.portal.subscription.remind.modal.button.error.label',
      defaultMessage: 'Retry remind {count}',
      description: 'Error remind button label.',
    }, { count: buttonNumberLabel }),
  };

  const title = remindAllUsers || totalToRemind > 1
    ? intl.formatMessage({
      id: 'admin.portal.subscription.remind.modal.title.plural',
      defaultMessage: 'Remind Users',
      description: 'Title for the reminder modal when reminding multiple users.',
    })
    : intl.formatMessage({
      id: 'admin.portal.subscription.remind.modal.title.singular',
      defaultMessage: 'Remind User',
      description: 'Title for the reminder modal when reminding a single user.',
    });

  const handleSubmit = useCallback(async () => {
    if (onSubmit) {
      onSubmit();
    }
    setRequestState({ ...initialRequestState, loading: true });
    try {
      validateEmailTemplateForm(emailTemplate, 'body', false);
    } catch (error) {
      logError(error);
      setRequestState({ ...initialRequestState, error });
      return;
    }

    const makeRequest = async () => {
      const options = {
        greeting: emailTemplate.greeting,
        closing: emailTemplate.closing,
      };

      const filtersPresent = activeFilters.length > 0;
      const transformedFilters = transformFiltersForRequest(activeFilters);

      if (remindAllUsers) {
        if (!filtersPresent) {
          // If reminding all users and there are no filters, hit remind-all endpoint
          return LicenseManagerApiService.licenseRemindAll(subscription.uuid);
        }
        // If reminding all users and there *are* active filters, pass
        // the filters through to the remind endpoint, which performs
        // bulk operations when filters are provided in the request body.
        options.filters = transformedFilters;
        return LicenseManagerApiService.licenseBulkRemind(subscription.uuid, options);
      }

      // From this point on, we're dealing with a case where remindAllUsers is false.
      // Give preference to selected emails over any selected filters,
      // because the remind endpoint will only operate when *one* of (emails, filters)
      // is provided in the request body.
      options.user_emails = getUserEmailsToRemind(usersToRemind, intl);

      return LicenseManagerApiService.licenseBulkRemind(subscription.uuid, options);
    };

    try {
      const response = await makeRequest();
      setRequestState({ ...initialRequestState, success: true });
      onSuccess(response);
    } catch (error) {
      logError(error);
      setRequestState({ ...initialRequestState, error });
    }
  }, [
    onSubmit,
    activeFilters,
    emailTemplate,
    remindAllUsers,
    usersToRemind,
    subscription.uuid,
    initialRequestState,
    onSuccess,
    setRequestState,
    intl,
  ]);

  const handleClose = () => {
    if (!requestState.loading) {
      onClose();
    }
  };

  const getRemindButtonState = () => {
    if (requestState.error) {
      return 'error';
    }
    if (requestState.loading) {
      return 'pending';
    }
    if (requestState.success) {
      return 'complete';
    }
    return 'default';
  };

  return (
    <ModalDialog
      title={title}
      isOpen={isOpen}
      onClose={handleClose}
      hasCloseButton={false}
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {title}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {requestState.error
            && (
            <Alert variant="danger">
              <p>{intl.formatMessage({
                id: 'admin.portal.subscription.remind.modal.error.message',
                defaultMessage: 'There was an error with your request. Please try again.',
                description: 'Error message shown when remind request fails.',
              })}
              </p>
              <p>
                {intl.formatMessage({
                  id: 'admin.portal.subscription.remind.modal.error.persist.message',
                  defaultMessage: 'If the error persists, ',
                  description: 'Text before contact support link in remind modal.',
                })}
                <Hyperlink destination={configuration.ENTERPRISE_SUPPORT_URL}>
                  {intl.formatMessage({
                    id: 'admin.portal.subscription.remind.modal.error.contact.support',
                    defaultMessage: 'contact customer support.',
                    description: 'Contact support link text in remind modal.',
                  })}
                </Hyperlink>
              </p>
            </Alert>
            )}
        <h3 className="h4">{intl.formatMessage({
          id: 'admin.portal.subscription.remind.modal.email.template.heading',
          defaultMessage: 'Email Template',
          description: 'Heading for reminder email template section.',
        })}
        </h3>
        <Form>
          <Form.Group controlId="email-template-greeting">
            <Form.Label>{intl.formatMessage({
              id: 'admin.portal.subscription.remind.modal.email.template.customize.greeting.label',
              defaultMessage: 'Customize Greeting',
              description: 'Label for reminder email greeting field.',
            })}
            </Form.Label>
            <Form.Control
              rows={3}
              as="textarea"
              data-hj-suppress
              value={emailTemplate.greeting}
              onChange={(e) => setEmailTemplate({ ...emailTemplate, greeting: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="email-template-body">
            <Form.Label>{intl.formatMessage({
              id: 'admin.portal.subscription.remind.modal.email.template.body.label',
              defaultMessage: 'Body',
              description: 'Label for reminder email body field.',
            })}
            </Form.Label>
            <Form.Control
              rows={3}
              as="textarea"
              data-hj-suppress
              value={emailTemplate.body}
              readOnly
            />
          </Form.Group>
          <Form.Group controlId="email-template-closing">
            <Form.Label>{intl.formatMessage({
              id: 'admin.portal.subscription.remind.modal.email.template.customize.closing.label',
              defaultMessage: 'Customize Closing',
              description: 'Label for reminder email closing field.',
            })}
            </Form.Label>
            <Form.Control
              rows={3}
              as="textarea"
              data-hj-suppress
              value={emailTemplate.closing}
              onChange={(e) => setEmailTemplate({ ...emailTemplate, closing: e.target.value })}
            />
          </Form.Group>
        </Form>

      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage({
              id: 'admin.portal.subscription.remind.modal.cancel.button',
              defaultMessage: 'Cancel',
              description: 'Cancel button label in remind modal.',
            })}
          </ModalDialog.CloseButton>
          <StatefulButton
            state={getRemindButtonState()}
            variant="primary"
            onClick={handleSubmit}
            disabled={(!remindAllUsers && usersToRemind.length < 1) || isExpired}
            labels={buttonLabels}
            icons={{
              pending: <Spinner animation="border" variant="light" size="sm" />,
            }}
            disabledStates={['pending', 'complete']}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

LicenseManagementRemindModal.defaultProps = {
  remindAllUsers: false,
  totalToRemind: -1,
  contactEmail: null,
  onSubmit: undefined,
};

LicenseManagementRemindModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  /** Function executed after successful remind request resolved */
  onSuccess: PropTypes.func.isRequired,
  /** Function executed when submit button is pressed */
  onSubmit: PropTypes.func,
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    expirationDate: PropTypes.string.isRequired,
  }).isRequired,
  usersToRemind: PropTypes.arrayOf(
    PropTypes.shape({
      email: PropTypes.string.isRequired,
    }),
  ).isRequired,
  remindAllUsers: PropTypes.bool,
  totalToRemind: PropTypes.number,
  contactEmail: PropTypes.string,
  activeFilters: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      filter: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
      filterValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    }),
  ).isRequired,
};

const mapStateToProps = state => ({
  contactEmail: state.portalConfiguration.contactEmail,
});

export default connect(mapStateToProps)(LicenseManagementRemindModal);
