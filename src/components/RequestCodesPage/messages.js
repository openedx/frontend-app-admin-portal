import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  errorHeading: {
    id: 'admin.portal.request.codes.error.heading',
    defaultMessage: 'Unable to request more codes',
    description: 'Heading for error alert when request fails',
  },
  errorRetry: {
    id: 'admin.portal.request.codes.error.retry',
    defaultMessage: 'Try refreshing your screen',
    description: 'Suggestion to retry after request codes error',
  },
  emailLabel: {
    id: 'admin.portal.request.codes.form.label.email',
    defaultMessage: 'Email Address',
    description: 'Label for email address input',
  },
  companyLabel: {
    id: 'admin.portal.request.codes.form.label.company',
    defaultMessage: 'Company',
    description: 'Label for enterprise name input',
  },
  numberOfCodesLabel: {
    id: 'admin.portal.request.codes.form.label.numberOfCodes',
    defaultMessage: 'Number of Codes',
    description: 'Label for number of codes input',
  },
  notesLabel: {
    id: 'admin.portal.request.codes.form.label.notes',
    defaultMessage: 'Notes',
    description: 'Label for notes input',
  },
  submitButton: {
    id: 'admin.portal.request.codes.form.submit',
    defaultMessage: 'Request Codes',
    description: 'Submit button for requesting codes',
  },
  cancelButton: {
    id: 'admin.portal.request.codes.form.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button for the form',
  },
});

export default messages;
