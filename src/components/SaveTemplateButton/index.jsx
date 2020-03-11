import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@edx/paragon';
import { SubmissionError } from 'redux-form';

class SaveTemplateButton extends React.Component {
  constructor(props) {
    super(props);
    this.handleSaveTemplate = this.handleSaveTemplate.bind(this);
  }

  handleSaveTemplate() {
    const {
      setMode,
      templateData,
      saveTemplate,
      templateType,
    } = this.props;

    const options = {
      email_type: templateType,
      email_greeting: templateData['email-template-greeting'],
      email_closing: templateData['email-template-closing'],
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

        Object.entries(fieldMap).forEach(([key, value]) => {
          if (response && response.data && response.data[key]) {
            errors[value] = response.data[key];
          }
        });
        /* eslint-disable no-underscore-dangle */
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
  templateData: PropTypes.shape({
    'email-template-greeting': PropTypes.string.isRequired,
    'email-template-closing': PropTypes.string.isRequired,
  }).isRequired,
  saveTemplate: PropTypes.func.isRequired,
  setMode: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  disabled: PropTypes.bool,
  buttonLabel: PropTypes.string,
};

export default SaveTemplateButton;
