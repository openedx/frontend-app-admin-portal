import React from 'react';
import PropTypes from 'prop-types';
import { StatefulButton, Icon, Spinner } from '@openedx/paragon';
import { CheckCircle } from '@openedx/paragon/icons';
import { SubmissionError } from 'redux-form';

import { validateEmailTemplateFields } from '../../data/validation/email';
import { EMAIL_TEMPLATE_SOURCE_NEW_EMAIL, EMAIL_TEMPLATE_SUBJECT_KEY } from '../../data/constants/emailTemplate';
import SUBMIT_STATES from '../../data/constants/formSubmissions';
import { features } from '../../config';

export const SAVE_TEMPLATE_MODE = 'save';

class SaveTemplateButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitState: SUBMIT_STATES.DEFAULT,
    };

    this.timer = undefined;
    this.validateFormData = this.validateFormData.bind(this);
    this.handleSaveTemplate = this.handleSaveTemplate.bind(this);
    this.setButtonStateToDefault = this.setButtonStateToDefault.bind(this);
  }

  componentDidUpdate() {
    const { submitState } = this.state;
    if (submitState === SUBMIT_STATES.COMPLETE) {
      this.timer = setTimeout(() => {
        this.setButtonStateToDefault();
      }, 2000);
    }
  }

  handleSaveTemplate(formData) {
    const {
      setMode,
      saveTemplate,
      templateType,
      emailTemplateSource,
      emailTemplates,
    } = this.props;

    setMode('save');
    const newTemplateSource = emailTemplateSource === EMAIL_TEMPLATE_SOURCE_NEW_EMAIL;

    // Check the form validation in case user is saving new template
    // or there are no already saved templates.
    if (newTemplateSource || emailTemplates.allTemplates.length === 0) {
      this.validateFormData(formData);
    }

    const options = {
      email_type: templateType,
      email_subject: formData[EMAIL_TEMPLATE_SUBJECT_KEY],
      email_greeting: formData['email-template-greeting'],
      email_closing: formData['email-template-closing'],
      name: formData['template-name'] || formData['template-name-select'],
      ...(features.FILE_ATTACHMENT && {
        email_files: formData['email-template-files'],
      }),
    };

    if (!newTemplateSource) {
      options.id = emailTemplates[templateType]['template-id'];
    }

    this.setState({ submitState: SUBMIT_STATES.PENDING });
    return saveTemplate(options)
      .then(() => {
        this.setState({ submitState: SUBMIT_STATES.COMPLETE });
      })
      .catch((error) => {
        // backend to frontend field name map
        const fieldMap = {
          email_subject: 'email-template-subject',
          email_greeting: 'email-template-greeting',
          email_closing: 'email-template-closing',
          ...(features.FILE_ATTACHMENT && {
            email_files: 'email-template-files',
          }),
        };
        const { response, message } = error;
        const errors = {
          _error: [],
        };

        /* eslint-disable no-underscore-dangle */
        Object.entries(fieldMap).forEach(([key, value]) => {
          if (response && response.data && response.data[key]) {
            const msg = response.data[key][0];
            errors[value] = msg;
            errors._error.push(msg);
          }
        });

        // when no field specific error returned then show the main exception message
        if (Object.keys(errors).length === 1 && Object.keys(errors)[0] === '_error') {
          errors._error.push(message);
        }
        /* eslint-enable no-underscore-dangle */

        this.setState({ submitState: SUBMIT_STATES.DEFAULT });

        throw new SubmissionError(errors);
      });
  }

  setButtonStateToDefault() {
    this.setState({ submitState: SUBMIT_STATES.DEFAULT });
    clearTimeout(this.timer);
  }

  validateFormData(formData) {
    const emailTemplateNameKey = 'template-name';
    const errors = validateEmailTemplateFields(formData, emailTemplateNameKey);

    /* eslint-disable no-underscore-dangle */
    if (!formData[emailTemplateNameKey]) {
      const message = 'No template name provided. Please enter a template name.';
      errors[emailTemplateNameKey] = message;
      errors._error.unshift(message);
    }

    if (Object.keys(errors) > 1 || errors._error.length > 0) {
      throw new SubmissionError(errors);
    }
    /* eslint-enable no-underscore-dangle */
  }

  render() {
    const { submitState } = this.state;
    const { handleSubmit, disabled } = this.props;
    const buttonIconClasses = {
      default: 'outline-primary',
      pending: 'outline-primary',
      complete: 'outline-success',
    };

    return (
      <StatefulButton
        variant={buttonIconClasses[submitState]}
        className="save-template-btn"
        onClick={handleSubmit(this.handleSaveTemplate)}
        state={submitState}
        labels={{
          default: 'Save Template',
          pending: 'Saving Template...',
          complete: 'Template Saved',
        }}
        icons={{
          pending: <Spinner animation="border" variant="primary" size="sm" />,
          complete: <Icon src={CheckCircle} />,
        }}
        disabledStates={[SUBMIT_STATES.PENDING]}
        disabled={disabled}
      />
    );
  }
}

SaveTemplateButton.defaultProps = {
  emailTemplates: {
    allTemplates: [],
    assign: { 'template-id': 0 },
    remind: { 'template-id': 0 },
    revoke: { 'template-id': 0 },
  },
  disabled: false,
};

SaveTemplateButton.propTypes = {
  emailTemplateSource: PropTypes.string.isRequired,
  templateType: PropTypes.string.isRequired,
  saveTemplate: PropTypes.func.isRequired,
  setMode: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  emailTemplates: PropTypes.shape(),
  disabled: PropTypes.bool,
};

export default SaveTemplateButton;
