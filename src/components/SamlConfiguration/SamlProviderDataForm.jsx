import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { ValidationFormGroup, Input, StatefulButton, Icon, Button } from '@edx/paragon';
import StatusAlert from '../StatusAlert';

const REQUIRED_DATA_FIELDS = [
  'entityId',
  'ssoUrl',
  'publicKey',
];

const SUBMIT_STATES = {
  ERROR: 'error',
  DEFAULT: 'default',
  COMPLETE: 'complete',
  PENDING: 'pending',
};

class SamlProviderDataForm extends React.Component {
  state = {
    invalidFields: {},
    submitState: SUBMIT_STATES.DEFAULT,
    error: undefined,
  }

  /**
   * Validates this form. If the form is invalid, it will return the fields
   * that were invalid. Otherwise, it will return an empty object.
   * @param {FormData} formData
   * @param {[String]} requiredFields
   */
  validateProviderDataForm = (formData, requiredFields) => {
    const invalidFields = requiredFields
      .filter(field => !formData.get(field))
      .reduce((prevFields, currField) => ({ ...prevFields, [currField]: true }), {});
    return invalidFields;
  }

  /**
   * attempt to submit the form data and show any error states or invalid fields.
   * @param {FormData} formData
   */
  handleSubmit = async (formData) => {
    this.setState({ submitState: SUBMIT_STATES.PENDING });
    let requiredFields = [];
    requiredFields = [...REQUIRED_DATA_FIELDS];

    // validate the form
    const invalidFields = this.validateProviderDataForm(formData, requiredFields);
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

    const err = await this.props.createProviderData(formData);
    if (err) {
      this.setState({ submitState: SUBMIT_STATES.ERROR, error: JSON.stringify(err.response.data) });
      return;
    }
    this.setState({ submitState: SUBMIT_STATES.COMPLETE });
  }

  render() {
    const { pData, entityId } = this.props;
    const {
      invalidFields,
      submitState,
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
              title="Unable to submit Data form:"
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
          this.handleSubmit(formData, pData);
        }}
        onChange={() => this.setState({ submitState: SUBMIT_STATES.DEFAULT })}
      >
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
                defaultValue={entityId || pData.entityId}
                disabled={!(pData === undefined)}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="ssoUrl"
              helpText="The SSO (Single Sign On URL) of the provider. Example: https://samltest.id/idp/profile/SAML2/Redirect/SSO"
              invalid={invalidFields.ssoUrl}
              invalidMessage="SSO URL required."
            >
              <label htmlFor="ssoUrl">SSO Url<span className="required">*</span></label>
              <Input
                type="text"
                id="ssoUrl"
                name="ssoUrl"
                defaultValue={pData ? pData.ssoUrl : ''}
                disabled={!(pData === undefined)}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="publicKey"
              helpText="The public key (May also be known as Signing Certificate) of your provider."
              invalid={invalidFields.publicKey}
              invalidMessage="Public Key is required."
            >
              <label htmlFor="publicKey">Public Key<span className="required">*</span></label>
              <Input
                type="textarea"
                id="publicKey"
                name="publicKey"
                defaultValue={pData ? pData.publicKey : ''}
                disabled={!(pData === undefined)}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          {!pData &&
            <div className="col-col2">
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
          }
          {pData &&
            <div className="col col-2">
              <Button
                className="btn-outline-danger  mr-3"
                onClick={() => this.props.deleteProviderData(pData.id)}
              >
                <Icon className="fa fa-times danger" /> Delete
              </Button>
            </div>
          }
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

SamlProviderDataForm.defaultProps = {
  createProviderData: undefined,
  deleteProviderData: undefined,
  pData: undefined,
  entityId: undefined,
};

SamlProviderDataForm.propTypes = {
  createProviderData: PropTypes.func,
  deleteProviderData: PropTypes.func,
  entityId: PropTypes.string,
  pData: PropTypes.shape({
    entityId: PropTypes.string,
    ssoUrl: PropTypes.string,
    publicKey: PropTypes.string,
    id: PropTypes.number,
  }),
};

export default SamlProviderDataForm;
