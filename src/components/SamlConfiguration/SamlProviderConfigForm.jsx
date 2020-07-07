import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { ValidationFormGroup, Input, StatefulButton, Icon, Button } from '@edx/paragon';
import StatusAlert from '../StatusAlert';

const REQUIRED_CONFIG_FIELDS = [
  'entityId',
  'metadataSource',
];

const SUBMIT_STATES = {
  ERROR: 'error',
  DEFAULT: 'default',
  COMPLETE: 'complete',
  PENDING: 'pending',
};


class SamlProviderConfigForm extends React.Component {
  state = {
    invalidFields: {},
    submitState: SUBMIT_STATES.DEFAULT,
    enabled: this.props.config ? this.props.config.enabled : false,
    syncProfile: this.props.config &&
      this.props.config.syncProfile ? this.props.config.syncProfile : true,
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
      this.setState({
        invalidFields: {
          ...this.state.invalidFields,
          ...invalidFields,
        },
        submitState: SUBMIT_STATES.default,
      });
      return;
    }

    if (config) {
      // formData.append('enterprise_customer_id', config.enterpriseCustomer.uuid);
      const err = await this.props.updateProviderConfig(formData, config.id);
      if (err) {
        this.setState({ submitState: SUBMIT_STATES.ERROR });
        return;
      }
    } else {
      // ...or create a new configuration
      const err = await this.props.createProviderConfig(formData);
      if (err) {
        this.setState({
          submitState: SUBMIT_STATES.ERROR,
          error: JSON.stringify(err.response.data),
        });
        return;
      }
    }
    this.setState({ submitState: SUBMIT_STATES.COMPLETE });
  }

  render() {
    const { config } = this.props;
    const {
      invalidFields,
      submitState,
      enabled,
      syncProfile,
      error,
    } = this.state;
    let errorAlert;
    if (error) {
      errorAlert =
        (
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
            <ValidationFormGroup
              for="enabled"
            >
              <label htmlFor="enabled">Enabled</label>
              <Input
                type="checkbox"
                id="enabled"
                name="enabled"
                className="ml-3"
                checked={enabled}
                onChange={() => this.setState(prevState => ({ enabled: !prevState.enabled }))}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="maxSession"
              helpText="If this option is set, then users logging in using this SSO provider will have their session length limited to no longer than this value. If set to 0 (zero), the session will expire upon the user closing their browser. If left blank, the Django platform session default length will be used."
            >
              <label htmlFor="maxSession">Max session length (seconds)</label>
              <Input
                type="number"
                id="maxSession"
                name="maxSession"
                defaultValue={config ? config.maxSession : undefined}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="syncProfile"
              helpText="Synchronize user profile data received from the identity provider with the edX user account on each SSO login. The user will be notified if the email address associated with their account is changed as a part of this synchronization."
            >
              <label htmlFor="syncProfile">Sync learner profile data</label>
              <Input
                type="checkbox"
                id="syncProfile"
                name="syncProfile"
                className="ml-3"
                checked={syncProfile}
                value={syncProfile}
                onChange={() => this.setState(prevState => (
                  { syncProfile: !prevState.syncProfile }
                ))}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="entityId"
              helpText="The Entity ID of a provider is typically a url and would be provided by the SAMLProvider. Example: https://idp.testshib.org/idp/shibboleth"
              invalid={invalidFields.entityId}
              invalidMessage="Entity ID is required."
            >
              <label htmlFor="entityId">Entity ID<span className="required">*</span></label>
              <Input
                type="text"
                id="entityId"
                name="entityId"
                defaultValue={config ? config.entityId : ''}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="metadataSource"
              helpText="URL to this provider's XML metadata. Should be an HTTPS URL. Example: https://www.testshib.org/metadata/testshib-providers.xml"
              invalid={invalidFields.metadataSource}
              invalidMessage="Metadata Source is required."
            >
              <label htmlFor="metadataSource">Metadata Source<span className="required">*</span></label>
              <Input
                type="text"
                id="metadataSource"
                name="metadataSource"
                defaultValue={config ? config.metadataSource : ''}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="userIdAttr"
              helpText="URN of the SAML attribute that we can use as a unique, persistent user ID. Leave blank for default."
            >
              <label htmlFor="userIdAttr">User ID Attribute</label>
              <Input
                type="text"
                id="userIdAttr"
                name="userIdAttr"
                defaultValue={config ? config.userIdAttr : ''}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="fullNameAttr"
              helpText="URN of SAML attribute containing the user's full name. Leave blank for default."
            >
              <label htmlFor="fullNameAttr">Full Name Attribute</label>
              <Input
                type="text"
                id="fullNameAttr"
                name="fullNameAttr"
                defaultValue={config ? config.fullNameAttr : ''}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="firstNameAttr"
              helpText="URN of SAML attribute containing the user's first name. Leave blank for default."
            >
              <label htmlFor="firstNameAttr">First Name Attribute</label>
              <Input
                type="text"
                id="firstNameAttr"
                name="firstNameAttr"
                defaultValue={config ? config.firstNameAttr : ''}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="lastNameAttr"
              helpText="URN of SAML attribute containing the user's last name. Leave blank for default."
            >
              <label htmlFor="lastNameAttr">Last Name Attribute</label>
              <Input
                type="text"
                id="lastNameAttr"
                name="lastNameAttr"
                defaultValue={config ? config.lastNameAttr : ''}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="emailAttr"
              helpText="URN of SAML attribute containing the user's email address[es]. Leave blank for default."
            >
              <label htmlFor="emailAttr">Email Address Attribute</label>
              <Input
                type="text"
                id="emailAttr"
                name="emailAttr"
                defaultValue={config ? config.emailAttr : ''}
              />
            </ValidationFormGroup>
          </div>
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
              className="btn-primary ml-3 col"
            />
          </div>
          <div className="col col-2">
            {config &&
              <Button
                className="btn-outline-danger  mr-3"
                onClick={() => this.props.deleteProviderConfig(config.id)}
              >
                <Icon className="fa fa-times danger" /> Delete
              </Button>
            }
          </div>
        </div>
        <div className="row">
          <div className="col col-3">
            <br />
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
  config: PropTypes.shape({
    enabled: PropTypes.bool,
    entityId: PropTypes.string,
    metadataSource: PropTypes.string,
    uuid: PropTypes.string,
    syncProfile: PropTypes.bool,
    userIdAttr: PropTypes.string,
    fullNameAttr: PropTypes.string,
    firstNameAttr: PropTypes.string,
    lastNameAttr: PropTypes.string,
    emailAttr: PropTypes.string,
    maxSession: PropTypes.number,
    id: PropTypes.number,
  }),
};

export default SamlProviderConfigForm;
