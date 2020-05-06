import React from 'react';
import PropTypes from 'prop-types';
import { StatefulButton, Icon } from '@edx/paragon';
import { SubmissionError } from 'redux-form';
import classNames from 'classnames';

import { validateEmailTemplateFields } from '../../utils';

const SUBMIT_STATES = {
  DEFAULT: 'default',
  COMPLETE: 'complete',
  PENDING: 'pending',
};

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

  setButtonStateToDefault() {
    this.setState({ submitState: SUBMIT_STATES.DEFAULT });
    clearTimeout(this.timer);
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
    this.setState({ submitState: SUBMIT_STATES.PENDING });

    return saveTemplate(options)
      .then(() => {
        this.setState({ submitState: SUBMIT_STATES.COMPLETE });
      })
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

        this.setState({ submitState: SUBMIT_STATES.DEFAULT });

        throw new SubmissionError(errors);
      });
  }

  render() {
    const { submitState } = this.state;
    const { handleSubmit } = this.props;
    const buttonIconClasses = {
      default: 'btn-outline-primary',
      pending: 'btn-outline-primary',
      complete: 'btn-outline-success',
    };

    return (
      <StatefulButton
        className={classNames(buttonIconClasses[submitState], 'save-template-btn')}
        onClick={handleSubmit(this.handleSaveTemplate)}
        state={submitState}
        labels={{
          default: 'Save Template',
          pending: 'Saving Template...',
          complete: 'Template Saved',
        }}
        icons={{
          pending: <Icon className="fa fa-spinner fa-spin" />,
          complete: <Icon className="fa fa-check-circle" />,
        }}
        disabledStates={[SUBMIT_STATES.PENDING]}
      />
    );
  }
}

SaveTemplateButton.propTypes = {
  templateType: PropTypes.string.isRequired,
  saveTemplate: PropTypes.func.isRequired,
  setMode: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default SaveTemplateButton;
