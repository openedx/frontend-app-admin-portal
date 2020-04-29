import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@edx/paragon';
import { SubmissionError } from 'redux-form';

import { validateEmailTemplateFields } from '../../utils';

class SaveTemplateButton extends React.Component {
  constructor(props) {
    super(props);

    this.validateFormData = this.validateFormData.bind(this);
    this.handleSaveTemplate = this.handleSaveTemplate.bind(this);
  }

  validateFormData(formData) {
    const emailTemplateNameKey = 'template-name';
    const errors = validateEmailTemplateFields(formData);

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

  handleSaveTemplate(formData) {
    const {
      setMode,
      saveTemplate,
      templateType,
    } = this.props;

    this.validateFormData(formData);

    const options = {
      email_type: templateType,
      email_greeting: formData['email-template-greeting'],
      email_closing: formData['email-template-closing'],
      name: formData['template-name'],
    };

    setMode('save');

    return saveTemplate(options)
      .catch((error) => {
        // backend to frontend field name map
        const fieldMap = {
          email_greeting: 'email-template-greeting',
          email_closing: 'email-template-closing',
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

        throw new SubmissionError(errors);
      });
  }

  render() {
    const {
      saving,
      disabled,
      buttonLabel,
      handleSubmit,
    } = this.props;
    const saveButtonIconClasses = saving ? ['fa-spinner', 'fa-spin'] : [];

    return (
      <Button
        className="btn-primary save-template-btn"
        disabled={disabled || saving}
        onClick={handleSubmit(this.handleSaveTemplate)}
      >
        <React.Fragment>
          <Icon className={`fa mr-2 ${saveButtonIconClasses.join(' ')}`} />
          {buttonLabel}
        </React.Fragment>
      </Button>
    );
  }
}

SaveTemplateButton.defaultProps = {
  saving: false,
  disabled: true,
  buttonLabel: 'Save Template',
};

SaveTemplateButton.propTypes = {
  templateType: PropTypes.string.isRequired,
  saveTemplate: PropTypes.func.isRequired,
  setMode: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  disabled: PropTypes.bool,
  buttonLabel: PropTypes.string,
};

export default SaveTemplateButton;
