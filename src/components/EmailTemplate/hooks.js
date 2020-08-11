import { useState, useEffect } from 'react';

import NewRelicService from '../../data/services/NewRelicService';
import { camelCaseObject } from '../../utils';

import EmailTemplateApiService from './service';

export const useEmailTemplates = ({ enterpriseCustomer, templateType }) => {
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = () => {
    setIsLoading(true);
    setError(null);

    EmailTemplateApiService.fetchEmailTemplates({ enterpriseCustomer, templateType })
      .then((response) => {
        setIsLoading(false);
        setEmailTemplates(camelCaseObject(response.data.results));
      })
      .catch((err) => {
        NewRelicService.logAPIErrorResponse(err);
        setIsLoading(false);
        setError(err);
      });
  };

  useEffect(() => fetch(), []);

  return {
    emailTemplates, refreshEmailTemplate: fetch, isLoading, error,
  };
};

export const useSaveEmailTemplate = ({ enterpriseCustomer }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const save = (emailTemplateData, templateId = null) => {
    setIsSaving(true);
    setError(null);

    let promise;

    if (templateId) {
      promise = EmailTemplateApiService.updateEmailTemplate({
        enterpriseCustomer, emailTemplateId: templateId, emailTemplateData,
      });
    } else {
      promise = EmailTemplateApiService.createEmailTemplate({
        enterpriseCustomer, emailTemplateData,
      });
    }

    promise
      .then(() => {
        setIsSaving(false);
      })
      .catch((err) => {
        NewRelicService.logAPIErrorResponse(err);
        setIsSaving(false);
        setError(err);
      });
  };

  return {
    createEmailTemplate: emailTemplateData => save(emailTemplateData),
    updateEmailTemplate: (emailTemplateData, templateId) => save(emailTemplateData, templateId),
    isSaving,
    error,
  };
};
