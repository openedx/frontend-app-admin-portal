import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, Input, OverlayTrigger, Tooltip,
} from '@edx/paragon';
import { Field } from 'redux-form';

import RenderField from '../RenderField';
import './TemplateSourceFields.scss';

import {
  EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
  EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE,
} from '../../data/constants/emailTemplate';

class TemplateSourceFields extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      templateOptions: [],
    };
    this.updateState = this.updateState.bind(this);
    this.makeOptions = this.makeOptions.bind(this);
    this.changeFromEmailTemplate = this.changeFromEmailTemplate.bind(this);
  }

  componentDidMount() {
    const {
      fetchEmailTemplates, emailTemplateType,
    } = this.props;
    fetchEmailTemplates({
      email_type: emailTemplateType,
      page_size: 1000,
    });
  }

  componentDidUpdate(prevProps) {
    const { allEmailTemplates, emailTemplateSource } = this.props;
    if (allEmailTemplates !== prevProps.allEmailTemplates
        && emailTemplateSource === EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE) {
      this.makeOptions(this.props);
      const emailTemplate = this.props.allEmailTemplates.filter(
        item => item.email_type === prevProps.emailTemplateType,
      );
      this.dispatchUpdatedTemplate(emailTemplate);
    }
  }

  componentWillUnmount() {
    const { setEmailTemplateSource } = this.props;
    // set the email template source to default
    setEmailTemplateSource(EMAIL_TEMPLATE_SOURCE_NEW_EMAIL);
  }

  selectRenderField({
    input, templateOptions, changeFromEmailTemplate, disabled,
  }) {
    return (
      <div className="template-select-wrapper mb-3">
        <label htmlFor="templateNameSelect">Template Name</label>
        <Input
          {...input}
          type="select"
          id="templateNameSelect"
          options={templateOptions}
          onChange={changeFromEmailTemplate}
          disabled={disabled}
        />
      </div>
    );
  }

  updateState(emailTemplateSource) {
    const {
      setEmailTemplateSource, allEmailTemplates, setEmailAddress, emailTemplateType, currentEmail,
    } = this.props;
    if (emailTemplateType === 'assign') {
      setEmailAddress(currentEmail, emailTemplateType);
    }
    setEmailTemplateSource(emailTemplateSource);
    if (emailTemplateSource === EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE) {
      this.makeOptions(this.props);
      this.dispatchUpdatedTemplate(allEmailTemplates);
    }
  }

  makeOptions(props) {
    if (props.allEmailTemplates.length > 0) {
      const templateOptions = [];
      props.allEmailTemplates.forEach((emailTemplate) => {
        if (emailTemplate.email_type === props.emailTemplateType) {
          templateOptions.push({ value: emailTemplate.name, label: emailTemplate.name });
        }
      });
      this.setState({ templateOptions });
    }
  }

  dispatchUpdatedTemplate(emailTemplate) {
    const { currentFromTemplate, emailTemplateType, currentEmail } = this.props;
    if (emailTemplate.length > 0) {
      const firstEmailTemplate = emailTemplate[0];

      if (emailTemplateType === 'assign') {
        firstEmailTemplate.email_address = currentEmail;
      }
      currentFromTemplate(emailTemplateType, firstEmailTemplate);
    }
  }

  changeFromEmailTemplate(e) {
    const emailTemplate = this.props.allEmailTemplates.filter(item => item.name === e.target.value);
    this.dispatchUpdatedTemplate(emailTemplate);
  }

  render() {
    const { emailTemplateSource, disabled } = this.props;
    const newEmail = EMAIL_TEMPLATE_SOURCE_NEW_EMAIL;
    const fromTemplate = EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE;

    return (
      <>
        <div
          className="d-flex mb-3 template-source-fields"
          role="group"
          aria-label="Press the button to select the template source"
        >
          <OverlayTrigger
            key="btn-new-email-tooltip"
            placement="top"
            overlay={(
              <Tooltip id="tooltip-top">
                Create new code assignment message. If you’d like to save the message as a
                template for future use, click “Save Template” before you “Assign Code”.
              </Tooltip>
            )}
          >
            <span className="template-source-btn-wrapper">
              <Button
                variant={emailTemplateSource === newEmail ? 'primary' : 'outline-primary'}
                id="btn-new-email-template"
                key="btn-new-email-template"
                className="rounded-left"
                style={{
                  pointerEvents: emailTemplateSource === newEmail ? 'none' : 'auto',
                }}
                aria-pressed={emailTemplateSource === newEmail ? 'true' : 'false'}
                onClick={() => this.updateState(newEmail)}
              >New Email
              </Button>
            </span>
          </OverlayTrigger>

          <OverlayTrigger
            key="btn-from-template-tooltip"
            placement="top"
            overlay={(
              <Tooltip id="tooltip-top">
                Make code assignment easier by loading any existing templates you have made here.
                Just click the dropdown on Template Name.
              </Tooltip>
            )}
          >
            <span className="template-source-btn-wrapper">
              <Button
                variant={emailTemplateSource !== newEmail ? 'primary' : 'outline-primary'}
                id="btn-old-email-template"
                key="btn-old-email-template"
                className="rounded-right"
                style={{
                  pointerEvents: emailTemplateSource === fromTemplate ? 'none' : 'auto',
                }}
                aria-pressed={emailTemplateSource === fromTemplate ? 'true' : 'false'}
                onClick={() => this.updateState(fromTemplate)}
              >From Template
              </Button>
            </span>
          </OverlayTrigger>
        </div>
        {emailTemplateSource === newEmail ? (
          <Field
            id="templateNameInput"
            name="template-name"
            type="text"
            component={RenderField}
            label="Template Name"
            required
            disabled={disabled}
          />
        ) : (
          <Field
            name="template-name-select"
            component={this.selectRenderField}
            templateOptions={this.state.templateOptions}
            changeFromEmailTemplate={this.changeFromEmailTemplate}
            disabled={disabled}
          />
        )}
      </>
    );
  }
}

TemplateSourceFields.defaultProps = {
  allEmailTemplates: [],
  disabled: false,
  currentEmail: '',
};

TemplateSourceFields.propTypes = {
  emailTemplateSource: PropTypes.string.isRequired,
  emailTemplateType: PropTypes.string.isRequired,
  currentEmail: PropTypes.string,
  setEmailTemplateSource: PropTypes.func.isRequired,
  setEmailAddress: PropTypes.func.isRequired,
  currentFromTemplate: PropTypes.func.isRequired,
  fetchEmailTemplates: PropTypes.func.isRequired,
  allEmailTemplates: PropTypes.arrayOf(PropTypes.shape({})),
  disabled: PropTypes.bool,
};

export default TemplateSourceFields;
