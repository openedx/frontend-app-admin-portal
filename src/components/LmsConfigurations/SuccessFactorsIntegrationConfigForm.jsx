import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {
  ValidationFormGroup, Input, StatefulButton, Icon,
} from '@edx/paragon';
import { snakeCaseFormData } from '../../utils';
import LmsApiService from '../../data/services/LmsApiService';
import StatusAlert from '../StatusAlert';
import SUBMIT_STATES from '../../data/constants/formSubmissions';
import { handleErrors, validateLmsConfigForm } from './common';

export const REQUIRED_SUCCESS_FACTOR_CONFIG_FIELDS = [
  'sapsfBaseUrl',
  'sapsfCompanyId',
  'sapsfUserId',
  'key',
  'secret',
  'userType',
];

class SuccessFactorsIntegrationConfigForm extends React.Component {
  state = {
    invalidFields: {},
    submitState: SUBMIT_STATES.DEFAULT,
    active: this.props.config?.active,
    error: null,
    transmitTotalHours: this.props.config?.transmitTotalHours,
  }

  /**
   * Creates a new third party provider configuration, then updates this list with the response.
   * Returns if there is an error.
   * @param {FormData} formData
   */
  createSuccessFactorsConfig = async (formData) => {
    const transformedData = snakeCaseFormData(formData);
    transformedData.append('enterprise_customer', this.props.enterpriseId);
    try {
      const response = await LmsApiService.postNewSuccessFactorsConfig(transformedData);
      return this.setState({ config: response.data });
    } catch (error) {
      return handleErrors(error);
    }
  }

  updateSuccessFactorsConfig = async (formData, configId) => {
    const transformedData = snakeCaseFormData(formData);
    transformedData.append('enterprise_customer', this.props.enterpriseId);
    try {
      const response = await LmsApiService.updateSuccessFactorsConfig(transformedData, configId);
      return this.setState({ config: response.data });
    } catch (error) {
      return handleErrors(error);
    }
  }

  /**
   * attempt to submit the form data and show any error states or invalid fields.
   * @param {FormData} formData
   */
  handleSubmit = async (formData, config) => {
    this.setState({ submitState: SUBMIT_STATES.PENDING, error: null });
    const requiredFields = [...REQUIRED_SUCCESS_FACTOR_CONFIG_FIELDS];

    // validate the form
    const invalidFields = validateLmsConfigForm(formData, requiredFields);
    if (!isEmpty(invalidFields)) {
      this.setState({
        invalidFields: {
          ...invalidFields,
        },
        submitState: SUBMIT_STATES.default,
      });
      return;
    }

    if (config) {
      const err = await this.updateSuccessFactorsConfig(formData, config.id);
      if (err) {
        this.setState({
          submitState: SUBMIT_STATES.ERROR,
          error: err,
        });
      } else {
        this.setState({ submitState: SUBMIT_STATES.COMPLETE });
      }
    } else {
      // ...or create a new configuration
      const err = await this.createSuccessFactorsConfig(formData);
      if (err) {
        this.setState({
          submitState: SUBMIT_STATES.ERROR,
          error: err,
        });
      } else {
        this.setState({ submitState: SUBMIT_STATES.COMPLETE });
      }
    }
  }

  render() {
    const {
      invalidFields,
      submitState,
      active,
      error,
      transmitTotalHours,
    } = this.state;
    const { config } = this.props;

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          this.handleSubmit(formData, this.state.config ? this.state.config : config);
        }}
        onChange={() => this.setState({ submitState: SUBMIT_STATES.DEFAULT })}
      >
        <div className="row">
          <div className="col col-6">
            <ValidationFormGroup
              for="active"
            >
              <label htmlFor="active">Active</label>
              <Input
                type="checkbox"
                id="active"
                name="active"
                className="ml-3"
                checked={active}
                onChange={() => this.setState(prevState => ({ active: !prevState.active }))}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="sapsfBaseUrl"
              invalid={invalidFields.sapsfBaseUrl}
              invalidMessage="SAP Success Factors Instance URL is required."
              helpText="Your SAP Success Factors instance URL. Make sure to include the protocol (ie https/http)"
            >
              <label htmlFor="sapsfBaseUrl">SAP Success Factors Instance URL</label>
              <Input
                type="text"
                id="sapsfBaseUrl"
                name="sapsfBaseUrl"
                defaultValue={config ? config.sapsfBaseUrl : null}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="sapsfCompanyId"
              invalid={invalidFields.sapsfCompanyId}
              invalidMessage="SAP Success Factors Company Id field is required."
              helpText="This should match the Company Id as found in SAP Success Factors."
            >
              <label htmlFor="sapsfCompanyId">SAP Success Factors Company Id</label>
              <Input
                type="text"
                id="sapsfCompanyId"
                name="sapsfCompanyId"
                defaultValue={config ? config.sapsfCompanyId : null}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="key"
              invalid={invalidFields.key}
              invalidMessage="Success Factors' Client Id is required."
              helpText="Oauth client identifier."
            >
              <label htmlFor="key">Client Id</label>
              <Input
                type="text"
                id="key"
                name="key"
                defaultValue={config ? config.key : null}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="secret"
              invalid={invalidFields.key}
              invalidMessage="Success Factors' Client Secret is required."
              helpText="OAuth client secret."
            >
              <label htmlFor="secret">Client Secret</label>
              <Input
                type="password"
                id="secret"
                name="secret"
                defaultValue={config ? config.secret : null}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="sapsfUserId"
              invalid={invalidFields.sapsfUserId}
              invalidMessage="Success Factors' User Id is required."
              helpText="Success Factors user identifier"
            >
              <label htmlFor="secret">SAP Success Factors User Id</label>
              <Input
                type="text"
                id="sapsfUserId"
                name="sapsfUserId"
                defaultValue={config ? config.sapsfUserId : null}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="userType"
              invalid={invalidFields.userType}
              invalidMessage="Success Factors' User Type is required."
              helpText="Type of SAP User (admin or user)."
            >
              <label htmlFor="userType">SAP Success Factors User Type</label>
              <Input
                type="select"
                id="userType"
                name="userType"
                defaultValue={config ? config.userType : null}
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'user', label: 'User' },
                  { value: null, label: 'blank', hidden: true },
                ]}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-6">
            <ValidationFormGroup
              for="transmitTotalHours"
              helpText="Include totalHours in the transmitted completion data"
            >
              <label htmlFor="transmitTotalHours">Transmit Total Hours?</label>
              <Input
                type="checkbox"
                id="transmitTotalHours"
                name="transmitTotalHours"
                className="ml-3"
                checked={transmitTotalHours}
                onChange={() => this.setState(prevState => ({ transmitTotalHours: !prevState.transmitTotalHours }))}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="additionalLocales"
              helpText="A comma separated list of any additional locales used in SAP (such as 'Dutch' or 'English Canadian'). See SAP's documentation for more examples."
            >
              <label htmlFor="additionalLocales">Additional Locales</label>
              <Input
                type="text"
                id="additionalLocales"
                name="additionalLocales"
                defaultValue={config ? config.additionalLocales : null}
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
              variant="primary"
              className="ml-3 col"
            />
          </div>
        </div>
        {error && (
          <div className="row">
            <div className="col col-3 mt-3">
              <div className="form-group is-invalid align-items-left">
                <StatusAlert
                  alertType="danger"
                  iconClassName="fa fa-times-circle"
                  title="Unable to submit config form:"
                  message={error}
                />
              </div>
            </div>
          </div>
        )}
      </form>
    );
  }
}

SuccessFactorsIntegrationConfigForm.defaultProps = {
  config: null,
};

SuccessFactorsIntegrationConfigForm.propTypes = {
  config: PropTypes.shape({
    active: PropTypes.bool,
    sapsfBaseUrl: PropTypes.string,
    sapsfCompanyId: PropTypes.string,
    sapsfUserId: PropTypes.string,
    key: PropTypes.string,
    secret: PropTypes.string,
    userType: PropTypes.string,
    transmitTotalHours: PropTypes.bool,
    additionalLocales: PropTypes.string,
  }),
  enterpriseId: PropTypes.string.isRequired,
};

export default SuccessFactorsIntegrationConfigForm;
