import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from '@edx/paragon';
import { Field } from 'redux-form';
import classNames from 'classnames';

import RenderField from '../RenderField';

class TemplateSourceFields extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      emailTemplateSource: 'new_email',
    };
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

  render() {
    const { emailTemplateSource } = this.state;
    const { savedTemplates } = this.props;

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
                emailTemplateSource === 'new_email' ? 'btn-primary' : 'btn-outline-primary',
            )}
            style={{
                pointerEvents: emailTemplateSource === 'new_email' ? 'none' : 'auto',
            }}
            aria-pressed={emailTemplateSource === 'new_email' ? 'true' : 'false'}
            onClick={() => this.setState({
                emailTemplateSource: 'new_email',
            })}
          >New Email
          </Button>
          <Button
            id="btn-old-email-template"
            key="btn-old-email-template"
            className={classNames(
                'rounded-right',
                emailTemplateSource === 'from_template' ? 'btn-primary' : 'btn-outline-primary',
            )}
            style={{
                pointerEvents: emailTemplateSource === 'from_template' ? 'none' : 'auto',
            }}
            aria-pressed={emailTemplateSource === 'from_template' ? 'true' : 'false'}
            onClick={() => this.setState({
                emailTemplateSource: 'from_template',
            })}
          >From Template
          </Button>
        </div>
        {emailTemplateSource === 'new_email' ?
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
  savedTemplates: PropTypes.arrayOf(PropTypes.shape({})),
};

export default TemplateSourceFields;
