import React, { createContext, useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import find from 'lodash/find';

import { useEmailTemplates, useSaveEmailTemplate } from './hooks';
import emailTemplate from './emailTemplate';
import { formatEmailTemplateDataForServer } from './utils';
import { validateEmailTemplateData } from './validators';

export const EmailTemplateContext = createContext();
export const EmailTemplateConsumer = EmailTemplateContext.Consumer;

const EmailTemplateData = ({ children, enterpriseCustomer, templateType }) => {
  const defaultEmailTemplate = {
    'subscription-template-name': '',
    'email-template-subject': emailTemplate.emailSubject,
    'email-template-greeting': emailTemplate.emailGreeting,
    'email-template-body': emailTemplate.emailBody,
    'email-template-closing': emailTemplate.emailClosing,
  };
  const [currentTemplate, setCurrentTemplate] = useState(defaultEmailTemplate);
  const [errors, setErrors] = useState([]);

  const {
    emailTemplates, refreshEmailTemplate, isLoading, error: emailTemplatesLoadingError,
  } = useEmailTemplates({ enterpriseCustomer, templateType });
  const {
    createEmailTemplate, updateEmailTemplate, isSaving, error: emailTemplateSavingError,
  } = useSaveEmailTemplate({ enterpriseCustomer });

  useEffect(() => {
    const errs = [];
    if (emailTemplateSavingError && emailTemplateSavingError.message) {
      errs.push(emailTemplateSavingError.message);
    }
    if (emailTemplatesLoadingError && emailTemplatesLoadingError.message) {
      errs.push(emailTemplatesLoadingError.message);
    }
    if (errs.length > 0) {
      setErrors(errs);
    }
  }, [emailTemplateSavingError, emailTemplatesLoadingError]);

  // Fetch email templates after creating or updating it.
  useEffect(() => {
    if (!isSaving && !emailTemplateSavingError) {
      refreshEmailTemplate();
    }
  }, [isSaving, emailTemplateSavingError]);

  const value = useMemo(() => ({
    emailTemplates,
    currentTemplate,
    isLoading,
    isSaving,
    errors,
    setCurrentEmailTemplateById: (emailTemplateId) => {
      const template = find(emailTemplates, item => item.id === +emailTemplateId);
      setCurrentTemplate({
        'subscription-template-name-select': template.id,
        'subscription-template-name': template.name,
        'email-template-subject': template.emailSubject,
        'email-template-greeting': template.emailGreeting,
        'email-template-closing': template.emailClosing,

        // Email body will always be picked from the constants.
        'email-template-body': emailTemplate.emailBody,

      });
    },
    setDefaultAsCurrentEmailTemplate: () => setCurrentTemplate(defaultEmailTemplate),
    updateCurrentTemplate: updatedValues => setCurrentTemplate(prevState => ({
      ...prevState,
      ...updatedValues,

      // Email body will always be picked from the constants.
      'email-template-body': emailTemplate.emailBody,
    })),
    saveEmailTemplate: () => {
      const isNewTemplate = !currentTemplate['subscription-template-name-select'];
      const errs = validateEmailTemplateData(currentTemplate, isNewTemplate);
      if (errs.length > 0) {
        setErrors(errs);
        return;
      }
      const templateData = formatEmailTemplateDataForServer(
        isNewTemplate,
        currentTemplate,
        templateType,
      );

      if (isNewTemplate) {
        createEmailTemplate(templateData);
      } else {
        updateEmailTemplate(templateData, templateData.id);
      }
    },
  }), [
    emailTemplates, currentTemplate, isLoading, isSaving, errors,
  ]);

  return (
    <EmailTemplateContext.Provider value={value}>
      {children}
    </EmailTemplateContext.Provider>
  );
};

EmailTemplateData.propTypes = {
  children: PropTypes.node.isRequired,
  enterpriseCustomer: PropTypes.string.isRequired,
  templateType: PropTypes.string.isRequired,
};

export default EmailTemplateData;
