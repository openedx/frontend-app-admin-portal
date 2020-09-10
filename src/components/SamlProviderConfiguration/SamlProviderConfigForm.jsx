import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { ValidationFormGroup, Input, StatefulButton, Icon, Button } from '@edx/paragon';
import StatusAlert from '../StatusAlert';
import SamlConfiguration from '../SamlConfiguration';

export const REQUIRED_CONFIG_FIELDS = [
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

  render() {
    const { config, deleteEnabled } = this.props;
    const {
      invalidFields,
      submitState,
      enabled,
      syncLearnerProfileData,
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
                id="maxSessionLength"
                name="maxSessionLength"
                defaultValue={config ? config.maxSessionLength : undefined}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="syncLearnerProfileData"
              helpText="Synchronize user profile data received from the identity provider with the edX user account on each SSO login. The user will be notified if the email address associated with their account is changed as a part of this synchronization."
            >
              <label htmlFor="syncLearnerProfileData">Sync learner profile data</label>
              <Input
                type="checkbox"
                id="syncLearnerProfileData"
                name="syncLearnerProfileData"
                className="ml-3"
                checked={syncLearnerProfileData}
                value={syncLearnerProfileData}
                onChange={() => this.setState(prevState => (
                  { syncLearnerProfileData: !prevState.syncLearnerProfileData }
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
              for="attrUserPermanentId"
              helpText="URN of the SAML attribute that we can use as a unique, persistent user ID. Leave blank for default."
            >
              <label htmlFor="attrUserPermanentId">User ID Attribute</label>
              <Input
                type="text"
                id="attrUserPermanentId"
                name="attrUserPermanentId"
                defaultValue={config ? config.attrUserPermanentId : ''}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="attrFullName"
              helpText="URN of SAML attribute containing the user's full name. Leave blank for default."
            >
              <label htmlFor="attrFullName">Full Name Attribute</label>
              <Input
                type="text"
                id="attrFullName"
                name="attrFullName"
                defaultValue={config ? config.attrFullName : ''}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="attrFirstName"
              helpText="URN of SAML attribute containing the user's first name. Leave blank for default."
            >
              <label htmlFor="attrFirstName">First Name Attribute</label>
              <Input
                type="text"
                id="attrFirstName"
                name="attrFirstName"
                defaultValue={config ? config.attrFirstName : ''}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="attrLastName"
              helpText="URN of SAML attribute containing the user's last name. Leave blank for default."
            >
              <label htmlFor="attrLastName">Last Name Attribute</label>
              <Input
                type="text"
                id="attrLastName"
                name="attrLastName"
                defaultValue={config ? config.attrLastName : ''}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="attrEmail"
              helpText="URN of SAML attribute containing the user's email address[es]. Leave blank for default."
            >
              <label htmlFor="attrEmail">Email Address Attribute</label>
              <Input
                type="text"
                id="attrEmail"
                name="attrEmail"
                defaultValue={config ? config.attrEmail : ''}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="country"
              helpText="URN of SAML attribute containing the user's country"
            >
              <label htmlFor="country">Country</label>
              <Input
                type="text"
                id="country"
                name="country"
                defaultValue={config ? config.country : ''}
              />
            </ValidationFormGroup>
          </div>
        </div>
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
            {config && deleteEnabled &&
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
