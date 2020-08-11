import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Button, Input, ValidationFormGroup } from '@edx/paragon';
import classNames from 'classnames';

import H3 from '../H3';
import TextAreaAutoSize from '../TextAreaAutoSize';
import { validateSubject, validateNotEmpty, validateTemplateField } from './validators';
import { EmailTemplateContext } from './EmailTemplateData';
import { findActiveTemplate } from './utils';

const EmailTemplate = () => {
  const [isNewTemplate, setIsNewTemplate] = useState(true);
  const [invalidFields, setInvalidFields] = useState({});
  const {
    emailTemplates, setCurrentEmailTemplateById, setDefaultAsCurrentEmailTemplate,
    updateCurrentTemplate, currentTemplate,
  } = useContext(EmailTemplateContext);
  const emailTemplateOptions = useMemo(() => emailTemplates.map(emailTemplate => (
    { value: emailTemplate.id, label: emailTemplate.name }
  )), [emailTemplates]);

  useEffect(() => {
    const activeTemplate = findActiveTemplate(emailTemplates);
    if (!isNewTemplate && activeTemplate) {
      setCurrentEmailTemplateById(activeTemplate.id);
    } else {
      setDefaultAsCurrentEmailTemplate();
    }
  }, [isNewTemplate, emailTemplates]);

  const validate = (e, validationFunction) => {
    e.persist();
    const result = validationFunction(e.target.value, e.target.name);

    if (!result.isValid) {
      setInvalidFields(prevState => ({
        ...prevState,
        [e.target.name]: result.message,
      }));
    } else if (invalidFields[e.target.name]) {
      setInvalidFields(prevState => ({
        ...prevState,
        [e.target.name]: undefined,
      }));
    }
  };

  const onChange = e => updateCurrentTemplate({ [e.target.name]: e.target.value });

  return (
    <React.Fragment>
      <H3>Email Template</H3>
      <div
        className="btn-group d-flex mb-3 template-source-fields"
        role="group"
        aria-label="Press the button to select the template source"
      >
        <Button
          id="btn-new-email-template"
          key="btn-new-email-template"
          className={classNames(
              'rounded-left',
              isNewTemplate ? 'btn-primary' : 'btn-outline-primary',
          )}
          style={{ pointerEvents: isNewTemplate ? 'none' : 'auto' }}
          aria-pressed={isNewTemplate ? 'true' : 'false'}
          onClick={() => setIsNewTemplate(true)}
        >New Email
        </Button>
        <Button
          id="btn-old-email-template"
          key="btn-old-email-template"
          className={classNames(
              'rounded-right',
              !isNewTemplate ? 'btn-primary' : 'btn-outline-primary',
          )}
          style={{
              pointerEvents: !isNewTemplate ? 'none' : 'auto',
          }}
          aria-pressed={!isNewTemplate ? 'true' : 'false'}
          onClick={() => setIsNewTemplate(false)}
        >From Template
        </Button>
      </div>

      {isNewTemplate ?
        <ValidationFormGroup
          for="subscription-template-name"
          invalidMessage={invalidFields['subscription-template-name']}
          invalid={invalidFields['subscription-template-name']}
        >
          <label htmlFor="subscription-template-name">Template Name</label>
          <Input
            type="text"
            id="subscription-template-name"
            name="subscription-template-name"
            value={currentTemplate['subscription-template-name']}
            required
            onBlur={e => validate(e, validateNotEmpty)}
            onChange={onChange}
          />
        </ValidationFormGroup>
        :
        <ValidationFormGroup
          for="subscription-template-name-select"
          helpText="Select a template"
        >
          <label htmlFor="subscription-template-name-select">Template Name</label>
          <Input
            type="select"
            id="subscription-template-name-select"
            name="subscription-template-name-select"
            options={emailTemplateOptions}
            onChange={event => setCurrentEmailTemplateById(event.target.value)}
            required
          />
        </ValidationFormGroup>
      }
      <ValidationFormGroup
        for="email-template-subject"
        invalidMessage={invalidFields['email-template-subject']}
        invalid={invalidFields['email-template-subject']}
      >
        <label htmlFor="email-template-subject">Customize Email Subject</label>
        <Input
          type="text"
          id="email-template-subject"
          name="email-template-subject"
          required
          value={currentTemplate['email-template-subject']}
          onBlur={e => validate(e, (value) => {
            const result = validateNotEmpty(value);
            return result.isValid ? validateSubject(value) : result;
          })}
          onChange={onChange}
        />
      </ValidationFormGroup>
      <TextAreaAutoSize
        id="email-template-greeting"
        input={{
          onBlur: e => validate(e, validateTemplateField),
          value: currentTemplate['email-template-greeting'],
          name: 'email-template-greeting',
          onChange,
        }}
        label="Customize Greeting"
        meta={{ touched: true, error: invalidFields['email-template-greeting'] }}
      />

      <TextAreaAutoSize
        id="email-template-body"
        disabled
        input={{
          onBlur: e => validate(e, validateNotEmpty),
          value: currentTemplate['email-template-body'],
          name: 'email-template-body',
          onChange,
        }}
        label="Email Body"
        meta={{ touched: true, error: invalidFields['email-template-body'] }}
      />

      <TextAreaAutoSize
        id="email-template-closing"
        input={{
          onBlur: e => validate(e, validateTemplateField),
          value: currentTemplate['email-template-closing'],
          name: 'email-template-closing',
          onChange,
        }}
        label="Customize Closing"
        meta={{ touched: true, error: invalidFields['email-template-closing'] }}
      />
    </React.Fragment>
  );
};

export default EmailTemplate;
