import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {
  Form, StatefulButton, Icon, Button,
} from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import StatusAlert from '../StatusAlert';
import SamlConfiguration from '../SamlConfiguration';
import SUBMIT_STATES from '../../data/constants/formSubmissions';

export const REQUIRED_CONFIG_FIELDS = [
  'entityId',
  'metadataSource',
];

const CONFIG_FIELDS = [
  {
    key: 'entityId',
    invalidMessage: 'Entity ID is required.',
    helpText: 'The Entity ID of a provider is typically a url and would be provided by the SAMLProvider. Example: https://idp.testshib.org/idp/shibboleth',
    label: 'Entity ID',
    showRequired: true,
  },
  {
    key: 'metadataSource',
    invalidMessage: 'Metadata Source is required.',
    helpText: 'URL to this provider\'s XML metadata. Should be an HTTPS URL. Example: https://www.testshib.org/metadata/testshib-providers.xml',
    label: 'Metadata Source',
    showRequired: true,
  },
  {
    key: 'attrUserPermanentId',
    helpText: 'URN of the SAML attribute that we can use as a unique, persistent user ID. Leave blank for default.',
    label: 'User ID Attribute',
  },
  {
    key: 'attrFullName',
    helpText: 'URN of SAML attribute containing the user\'s full name. Leave blank for default.',
    label: 'Full Name Attribute',
  },
  {
    key: 'attrFirstName',
    helpText: 'URN of SAML attribute containing the user\'s first name. Leave blank for default.',
    label: 'First Name Attribute',
  },
  {
    key: 'attrLastName',
    helpText: 'URN of SAML attribute containing the user\'s last name. Leave blank for default.',
    label: 'Lasr Name Attribute',
  },
  {
    key: 'attrEmail',
    helpText: 'URN of SAML attribute containing the user\'s email address[es]. Leave blank for default.',
    label: 'Email Address Attribute',
  },
  {
    key: 'country',
    helpText: 'URN of SAML attribute containing the user\'s country.',
    label: 'Country',
  },
];

class SamlProviderConfigForm extends React.Component {
  state = {
    invalidFields: {},
    submitState: SUBMIT_STATES.DEFAULT,
    enabled: this.props.config?.enabled,
    syncLearnerProfileData: this.props.config?.syncLearnerProfileData,
    error: undefined,
  }

  /**
   * Validates this form. If the form is invalid, it will return the fields
   * that were invalid. Otherwise, it will return an empty object.
   * @param {FormData} formData
   * @param {[String]} requiredFields
   */
  validateProviderConfigForm = (formData, requiredFields) => {
    const invalidFields = requiredFields
      .filter(field => !formData.get(field))
      .reduce((prevFields, currField) => ({ ...prevFields, [currField]: true }), {});
    return invalidFields;
  }

  /**
   * attempt to submit the form data and show any error states or invalid fields.
   * @param {FormData} formData
   */
  handleSubmit = async (formData, config) => {
    this.setState({ submitState: SUBMIT_STATES.PENDING, error: undefined });
    let requiredFields = [];
    requiredFields = [...REQUIRED_CONFIG_FIELDS];
    // validate the form
    const invalidFields = this.validateProviderConfigForm(formData, requiredFields);
    if (!isEmpty(invalidFields)) {
      this.setState((state) => ({
        invalidFields: {
          ...state.invalidFields,
          ...invalidFields,
        },
        submitState: SUBMIT_STATES.default,
      }));
      return;
    }

    if (config) {
      const err = await this.props.updateProviderConfig(formData, config.id);
      if (err) {
        this.setState({
          submitState: SUBMIT_STATES.ERROR,
          error: err,
        });
      }
    } else {
      // ...or create a new configuration
      const err = await this.props.createProviderConfig(formData);
      if (err) {
        this.setState({
          submitState: SUBMIT_STATES.ERROR,
          error: err,
        });
      }
    }
  }

  renderField = data => {
    const { invalidFields } = this.state;
    const { config } = this.props;
    return (
      <Form.Group
        controlId={data.key}
        isInvalid={invalidFields[data.key] || invalidFields[data.invalidAdditionalCondition]}
      >
        <Form.Label>{data.label}{data.showRequired && <span className="required">*</span>}</Form.Label>
        <Form.Control
          type={data.type || 'text'}
          id={data.key}
          name={data.key}
          // eslint-disable-next-line no-nested-ternary
          defaultValue={config ? config[data.key] : data.type === 'number' ? 1 : ''}
          data-hj-suppress
        />
        <Form.Text>{data.helpText}</Form.Text>
        {(invalidFields[data.key] || invalidFields[data.invalidAdditionalCondition])
          && data.invalidMessage && (
          <Form.Control.Feedback icon={<Error className="mr-1" />}>
            {data.invalidMessage}
          </Form.Control.Feedback>
        )}
      </Form.Group>
    );
  }

  render() {
    const { config, deleteEnabled } = this.props;
    const {
      submitState,
      enabled,
      syncLearnerProfileData,
      error,
    } = this.state;
    let errorAlert;
    if (error) {
      errorAlert = (
        <div className="form-group is-invalid align-items-left">
          <StatusAlert
            alertType="danger"
            iconClassName="fa fa-times-circle"
            title="Unable to submit config form:"
            message={error}
          />
        </div>
      );
    }

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          this.handleSubmit(formData, config);
        }}
        onChange={() => this.setState({ submitState: SUBMIT_STATES.DEFAULT })}
      >
        <div className="row">
          <div className="col col-6">
            <Form.Group controlId="enabled">
              <Form.Checkbox
                id="enabled"
                name="enabled"
                checked={enabled}
                onChange={() => this.setState(prevState => ({ enabled: !prevState.enabled }))}
                floatLabelLeft
              >
                Enabled
              </Form.Checkbox>
            </Form.Group>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            {this.renderField({
              key: 'maxSession',
              helpText: 'If this option is set, then users logging in using this SSO provider will have their session length limited to no longer than this value. If set to 0 (zero), the session will expire upon the user closing their browser. If left blank, the Django platform session default length will be used.',
              label: 'Max session length (seconds)',
              type: 'number',
            })}
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <Form.Group controlId="syncLearnerProfileData">
              <Form.Checkbox
                id="syncLearnerProfileData"
                name="syncLearnerProfileData"
                checked={syncLearnerProfileData}
                value={syncLearnerProfileData}
                onChange={() => this.setState(prevState => (
                  { syncLearnerProfileData: !prevState.syncLearnerProfileData }
                ))}
                floatLabelLeft
              >
                Sync learner profile data
              </Form.Checkbox>
              <Form.Text>
                Synchronize user profile data received from the identity provider with the edX user account on each SSO
                login. The user will be notified if the email address associated with their account is changed as a
                part of this synchronization.
              </Form.Text>
            </Form.Group>
          </div>
        </div>
        {CONFIG_FIELDS.map(field => (
          <div className="row" key={field.key}>
            <div className="col col-4">
              {this.renderField(field)}
            </div>
          </div>
        ))}
        <div className="row">
          <SamlConfiguration
            currentConfig={config ? config.samlConfiguration : undefined}
          />
        </div>

        <div className="row">
          <div className="col col-2">
            <StatefulButton
              state={submitState}
              type="submit"
              id="submitButton"
              labels={{
                default: 'Submit',
                pending: 'Saving...',
                complete: 'Complete',
                error: 'Error',
              }}
              icons={{
                default: <Icon className="fa fa-download" />,
                pending: <Icon className="fa fa-spinner fa-spin" />,
                complete: <Icon className="fa fa-check" />,
                error: <Icon className="fa fa-times" />,
              }}
              disabledStates={[SUBMIT_STATES.PENDING]}
              variant="primary"
              className="ml-3 col"
            />
          </div>
          <div className="col col-2">
            {config && deleteEnabled && (
              <Button
                variant="outline-danger"
                className=" mr-3"
                onClick={() => this.props.deleteProviderConfig(config.id)}
              >
                <Icon className="fa fa-times danger" /> Delete
              </Button>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col col-3 mt-3">
            {errorAlert}
          </div>
        </div>
      </form>
    );
  }
}

SamlProviderConfigForm.defaultProps = {
  config: undefined,
  updateProviderConfig: undefined,
  createProviderConfig: undefined,
  deleteProviderConfig: undefined,
};

SamlProviderConfigForm.propTypes = {
  updateProviderConfig: PropTypes.func,
  createProviderConfig: PropTypes.func,
  deleteProviderConfig: PropTypes.func,
  deleteEnabled: PropTypes.bool.isRequired,
  config: PropTypes.shape({
    enabled: PropTypes.bool,
    entityId: PropTypes.string,
    metadataSource: PropTypes.string,
    uuid: PropTypes.string,
    syncLearnerProfileData: PropTypes.bool,
    attrUserPermanentId: PropTypes.string,
    attrFullName: PropTypes.string,
    attrFirstName: PropTypes.string,
    attrLastName: PropTypes.string,
    attrEmail: PropTypes.string,
    maxSessionLength: PropTypes.number,
    id: PropTypes.number,
    country: PropTypes.string,
    samlConfiguration: PropTypes.number,
  }),
};

export default SamlProviderConfigForm;
