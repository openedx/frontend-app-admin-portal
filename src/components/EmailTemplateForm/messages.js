import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  emailFormName: {
    id: 'adminPortal.emailTemplateForm.formName',
    defaultMessage: 'Email Template',
  },
  emailCustomizeSubject: {
    id: 'adminPortal.emailTemplateForm.customizeSubject',
    defaultMessage: 'Customize email subject',
  },
  emailCustomizeGreeting: {
    id: 'adminPortal.emailTemplateForm.customizeGreeting',
    defaultMessage: 'Customize greeting',
  },
  emailBody: {
    id: 'adminPortal.emailTemplateForm.body',
    defaultMessage: 'Body',
  },
  emailCustomizeClosing: {
    id: 'adminPortal.emailTemplateForm.customizeClosing',
    defaultMessage: 'Customize closing',
  },
  emailAddFiles: {
    id: 'adminPortal.emailTemplateForm.addFiles',
    defaultMessage: 'add files',
  },
  emailMaxFileSizeMessage: {
    id: 'adminPortal.emailTemplateForm.maxFileSizeMessage',
    defaultMessage: "Max files size shouldn't exceed 250kb.",
  },
});

export default messages;
