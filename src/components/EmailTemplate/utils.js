import find from 'lodash/find';

/*
This function is used to format data so that server can understand it.
*/
export const formatEmailTemplateDataForServer = (isNewTemplate, emailTemplate, templateType) => {
  const emailTemplateData = {
    email_type: templateType,
    name: emailTemplate['subscription-template-name'],
    email_subject: emailTemplate['email-template-subject'],
    email_greeting: emailTemplate['email-template-greeting'],
    email_closing: emailTemplate['email-template-closing'],
  };
  if (!isNewTemplate) {
    emailTemplateData.id = emailTemplate['subscription-template-name-select'];
  }

  return emailTemplateData;
};

/*
From a list of provided template find a template that fulfill any of the given criteria.

First active template i.e. with `active` attribute set to `true`.
OR
First template from the list or `undefined` if list is empty.
*/
export const findActiveTemplate = (emailTemplates) => {
  const template = find(emailTemplates, item => item.active);
  return template || emailTemplates[0];
};
