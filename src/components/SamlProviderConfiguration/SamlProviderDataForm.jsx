import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {
  Form, StatefulButton, Icon, Button,
} from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import StatusAlert from '../StatusAlert';
import SUBMIT_STATES from '../../data/constants/formSubmissions';

export const REQUIRED_DATA_FIELDS = [
  'entityId',
  'ssoUrl',
  'publicKey',
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
    key: 'ssoUrl',
    invalidMessage: 'SSO URL required.',
    helpText: 'The SSO (Single Sign On) URL of the provider. Example: https://samltest.id/idp/profile/SAML2/Redirect/SSO',
    label: 'SSO URL',
    showRequired: true,
  },
  {
    key: 'publicKey',
    invalidMessage: 'Public Key is required.',
    helpText: 'The public key (May also be known as Signing Certificate) of your provider.',
    label: 'Public Key',
    showRequired: true,
  },
];

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
      this.setState((state) => ({
        invalidFields: {
          ...state.invalidFields,
          ...invalidFields,
        },
        submitState: SUBMIT_STATES.default,
      }));
      return;
    }

    const err = await this.props.createProviderData(formData);
    if (err) {
      this.setState({ submitState: SUBMIT_STATES.ERROR, error: err });
    }
  }

  handleDelete = async (providerDataId) => {
    const err = await this.props.deleteProviderData(providerDataId);
    if (err) {
      this.setState({ error: err });
    }
  }

  renderField = data => {
    const { invalidFields } = this.state;
    const { pData: config, entityId } = this.props;
    const defaultValue = data.key === 'entityId' ? entityId : '';

    return (
      <Form.Group
        controlId={data.key}
        isInvalid={invalidFields[data.key] || invalidFields[data.invalidAdditionalCondition]}
      >
        <Form.Label htmlFor={data.key}>{data.label}</Form.Label>
        <Form.Control
          type={data.type || 'text'}
          id={data.key}
          name={data.key}
          // eslint-disable-next-line no-nested-ternary
          defaultValue={config ? config[data.key] : data.type === 'number' ? 1 : defaultValue}
          disabled={!(config === undefined)}
          data-hj-suppress
        />
        <Form.Text>{data.helpText}{data.showRequired && <span className="required">*</span>}</Form.Text>
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
    const { pData, deleteEnabled } = this.props;
    const {
      submitState,
      error,
    } = this.state;
    let errorAlert;
    if (error) {
      errorAlert = (
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
        {CONFIG_FIELDS.map(field => (
          <div className="row" key={field.key}>
            <div className="col col-4">
              {this.renderField(field)}
            </div>
          </div>
        ))}
        <div className="row">
          {!pData && (
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
                className="ml-3 col"
                variant="primary"
              />
            </div>
          )}
          {pData && deleteEnabled && (
            <div className="col col-2">
              <Button
                className="btn-outline-danger  mr-3"
                onClick={() => this.handleDelete(pData.id)}
              >
                <Icon className="fa fa-times danger" /> Delete
              </Button>
            </div>
          )}
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

SamlProviderDataForm.defaultProps = {
  createProviderData: undefined,
  deleteProviderData: undefined,
  pData: undefined,
  entityId: undefined,
};

SamlProviderDataForm.propTypes = {
  createProviderData: PropTypes.func,
  deleteProviderData: PropTypes.func,
  deleteEnabled: PropTypes.bool.isRequired,
  entityId: PropTypes.string,
  pData: PropTypes.shape({
    entityId: PropTypes.string,
    ssoUrl: PropTypes.string,
    publicKey: PropTypes.string,
    id: PropTypes.number,
  }),
};

export default SamlProviderDataForm;
