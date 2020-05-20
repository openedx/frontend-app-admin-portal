import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from '@edx/paragon';
import { Field } from 'redux-form';
import classNames from 'classnames';

import RenderField from '../RenderField';

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
    if (allEmailTemplates !== prevProps.allEmailTemplates &&
        emailTemplateSource === EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE) {
      this.makeOptions(this.props);
      const emailTemplate = this.props.allEmailTemplates.filter(item =>
        item.email_type === prevProps.emailTemplateType);
      this.dispatchUpdatedTemplate(emailTemplate);
    }
  }

  componentWillUnmount() {
    const { setEmailTemplateSource } = this.props;
    // set the email template source to default
    setEmailTemplateSource(EMAIL_TEMPLATE_SOURCE_NEW_EMAIL);
  }

  selectRenderField({ input, templateOptions, changeFromEmailTemplate }) {
    return (
      <div className="template-select-wrapper mb-3">
        <label htmlFor="templateNameSelect">Template Name</label>
        <Input
          {...input}
          type="select"
          id="templateNameSelect"
          options={templateOptions}
          onChange={changeFromEmailTemplate}
        />
      </div>
    );
  }

  updateState(emailTemplateSource) {
    const {
      setEmailTemplateSource, allEmailTemplates,
    } = this.props;
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
    const { currentFromTemplate, emailTemplateType } = this.props;
    if (emailTemplate.length > 0) {
      currentFromTemplate(emailTemplateType, emailTemplate[0]);
    }
  }

  changeFromEmailTemplate(e) {
    const emailTemplate = this.props.allEmailTemplates.filter(item => item.name === e.target.value);
    this.dispatchUpdatedTemplate(emailTemplate);
  }

  render() {
    const { emailTemplateSource } = this.props;
    const newEmail = EMAIL_TEMPLATE_SOURCE_NEW_EMAIL;
    const fromTemplate = EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE;

    return (
      <React.Fragment>
        <div
          className="btn-group d-flex mb-3"
          role="group"
          aria-label="Press the button to select the template source"
        >
          <Button
            id="btn-new-email-template"
            key="btn-new-email-template"
            className={classNames(
                'rounded-left',
                emailTemplateSource === newEmail ? 'btn-primary' : 'btn-outline-primary',
            )}
            style={{
                pointerEvents: emailTemplateSource === newEmail ? 'none' : 'auto',
            }}
            aria-pressed={emailTemplateSource === newEmail ? 'true' : 'false'}
            onClick={() => this.updateState(newEmail)}
          >New Email
          </Button>
          <Button
            id="btn-old-email-template"
            key="btn-old-email-template"
            className={classNames(
                'rounded-right',
                emailTemplateSource === fromTemplate ? 'btn-primary' : 'btn-outline-primary',
            )}
            style={{
                pointerEvents: emailTemplateSource === fromTemplate ? 'none' : 'auto',
            }}
            aria-pressed={emailTemplateSource === fromTemplate ? 'true' : 'false'}
            onClick={() => this.updateState(fromTemplate)}
          >From Template
          </Button>
        </div>
        {emailTemplateSource === newEmail ?
          <Field
            id="templateNameInput"
            name="template-name"
            type="text"
            component={RenderField}
            label="Template Name"
            required
          />
          :
          <Field
            name="template-name-select"
            component={this.selectRenderField}
            templateOptions={this.state.templateOptions}
            changeFromEmailTemplate={this.changeFromEmailTemplate}
          />
        }
      </React.Fragment>
    );
  }
}

TemplateSourceFields.defaultProps = {
  allEmailTemplates: [],
};

TemplateSourceFields.propTypes = {
  emailTemplateSource: PropTypes.string.isRequired,
  emailTemplateType: PropTypes.string.isRequired,
  setEmailTemplateSource: PropTypes.func.isRequired,
  currentFromTemplate: PropTypes.func.isRequired,
  fetchEmailTemplates: PropTypes.func.isRequired,
  allEmailTemplates: PropTypes.arrayOf(PropTypes.shape({})),
};

export default TemplateSourceFields;
