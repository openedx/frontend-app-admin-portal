import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {
  ValidationFormGroup, Input, StatefulButton, Icon,
} from '@edx/paragon';
import { snakeCaseFormData } from '../../utils';
import LmsApiService from '../../data/services/LmsApiService';
import StatusAlert from '../StatusAlert';
import NewRelicService from '../../data/services/NewRelicService';
import SUBMIT_STATES from '../../data/constants/formSubmissions';

export const REQUIRED_BLACKBOARD_CONFIG_FIELDS = [
  'blackboardBaseUrl',
  'blackboardClientId',
  'blackboardClientSecret',
];

class BlackboardIntegrationConfigForm extends React.Component {
  state = {
    invalidFields: {},
    submitState: SUBMIT_STATES.DEFAULT,
    active: this.props.config?.active,
    error: null,
  }

  handleErrors = (error) => {
    const errorMsg = error.message || error.response?.status === 500
      ? error.message : JSON.stringify(error.response.data);
    NewRelicService.logAPIErrorResponse(errorMsg);
    return errorMsg;
  }

  /**
   * Creates a new third party provider configuration, then updates this list with the response.
   * Returns if there is an error.
   * @param {FormData} formData
   */
  createBlackboardConfig = async (formData) => {
    const transformedData = snakeCaseFormData(formData);
    transformedData.append('enterprise_customer', this.props.enterpriseId);
    try {
      const response = await LmsApiService.postNewBlackboardConfig(transformedData);
      this.setState({ config: response.data });
      return undefined;
    } catch (error) {
      return this.handleErrors(error);
    }
  }

  updateBlackboardConfig = async (formData, configId) => {
    const transformedData = snakeCaseFormData(formData);
    transformedData.append('enterprise_customer', this.props.enterpriseId);
    try {
      const response = await LmsApiService.updateBlackboardConfig(transformedData, configId);
      this.setState({ config: response.data });
      return undefined;
    } catch (error) {
      return this.handleErrors(error);
    }
  }

  /**
   * Validates this form. If the form is invalid, it will return the fields
   * that were invalid. Otherwise, it will return an empty object.
   * @param {FormData} formData
   * @param {[String]} requiredFields
   */
  validateBlackboardConfigForm = (formData, requiredFields) => {
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
    this.setState({ submitState: SUBMIT_STATES.PENDING, error: null });
    let requiredFields = [];
    requiredFields = [...REQUIRED_BLACKBOARD_CONFIG_FIELDS];
    // validate the form
    const invalidFields = this.validateBlackboardConfigForm(formData, requiredFields);
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
      const err = await this.updateBlackboardConfig(formData, config.id);
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
      const err = await this.createBlackboardConfig(formData);
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
    } = this.state;
    const { config } = this.props;
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
              for="blackboardBaseUrl"
              invalid={invalidFields.blackboardBaseUrl}
              invalidMessage="Blackboard Instance URL is required."
              helpText="Your Blackboard instance URL. Make sure to include the protocol (ie https/http)"
            >
              <label htmlFor="blackboardBaseUrl">Blackboard Instance URL</label>
              <Input
                type="text"
                id="blackboardBaseUrl"
                name="blackboardBaseUrl"
                defaultValue={config ? config.blackboardBaseUrl : null}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="blackboardClientId"
              invalid={invalidFields.blackboardClientId}
              invalidMessage="Blackboard client ID is required."
              helpText="This should match the API Client ID found on Blackboard."
            >
              <label htmlFor="blackboardClientId">Blackboard Client ID</label>
              <Input
                type="text"
                id="blackboardClientId"
                name="blackboardClientId"
                defaultValue={config ? config.blackboardClientId : null}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="blackboardClientSecret"
              invalid={invalidFields.blackboardClientSecret}
              invalidMessage="Blackboard client secret is required."
              helpText="This should match the API Client secret found on Blackboard."
            >
              <label htmlFor="blackboardClientSecret">Blackboard Client Secret</label>
              <Input
                type="text"
                id="blackboardClientSecret"
                name="blackboardClientSecret"
                defaultValue={config ? config.blackboardClientSecret : null}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="refreshToken"
              helpText="The Blackboard API's refresh token token. This should be automatically propagated once you visit the oauth complete endpoint."
              // invalid={invalidFields.refreshToken}
              // invalidMessage="A refresh token must be provided."
            >
              <label htmlFor="refreshToken">Blackboard API Refresh Token</label>
              <Input
                type="text"
                id="refreshToken"
                name="refreshToken"
                defaultValue={config ? config.refreshToken : null}
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
        <div className="row">
          <div className="col col-3 mt-3">
            {errorAlert}
          </div>
        </div>
      </form>
    );
  }
}

BlackboardIntegrationConfigForm.defaultProps = {
  config: null,
};

BlackboardIntegrationConfigForm.propTypes = {
  config: PropTypes.shape({
    active: PropTypes.bool,
    blackboardBaseUrl: PropTypes.string,
    refreshToken: PropTypes.string,
    blackboardClientId: PropTypes.string,
    blackboardClientSecret: PropTypes.string,
  }),
  enterpriseId: PropTypes.string.isRequired,
};

export default BlackboardIntegrationConfigForm;
