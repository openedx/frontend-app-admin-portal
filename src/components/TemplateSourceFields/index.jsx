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
    this.updateState = this.updateState.bind(this);
  }

  componentWillUnmount() {
    const { setEmailTemplateSource } = this.props;
    // set the email template source to default
    setEmailTemplateSource(EMAIL_TEMPLATE_SOURCE_NEW_EMAIL);
  }

  selectRenderField({ input, options }) {
    return (
      <div className="template-select-wrapper mb-3">
        <label htmlFor="templateNameSelect">Template Name</label>
        <Input
          {...input}
          type="select"
          id="templateNameSelect"
          options={options}
        />
      </div>
    );
  }

  updateState(emailTemplateSource) {
    const { setEmailTemplateSource } = this.props;
    setEmailTemplateSource(emailTemplateSource);
  }

  render() {
    const { savedTemplates, emailTemplateSource } = this.props;
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
            options={savedTemplates}
          />
        }
      </React.Fragment>
    );
  }
}

TemplateSourceFields.defaultProps = {
  savedTemplates: [],
};

TemplateSourceFields.propTypes = {
  emailTemplateSource: PropTypes.string.isRequired,
  setEmailTemplateSource: PropTypes.func.isRequired,
  savedTemplates: PropTypes.arrayOf(PropTypes.shape({})),
};

export default TemplateSourceFields;
