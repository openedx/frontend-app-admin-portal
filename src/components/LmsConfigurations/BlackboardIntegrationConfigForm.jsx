import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {
  ValidationFormGroup, Input, StatefulButton, Icon, Hyperlink,
} from '@edx/paragon';
import { snakeCaseFormData } from '../../utils';
import LmsApiService from '../../data/services/LmsApiService';
import StatusAlert from '../StatusAlert';
import SUBMIT_STATES from '../../data/constants/formSubmissions';
import { handleErrors, validateLmsConfigForm } from './common';

export const REQUIRED_BLACKBOARD_CONFIG_FIELDS = [
  'blackboardBaseUrl',
  'clientId',
  'clientSecret',
];

class BlackboardIntegrationConfigForm extends React.Component {
  state = {
    invalidFields: {},
    submitState: SUBMIT_STATES.DEFAULT,
    active: this.props.config?.active,
    error: undefined,
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
      this.setState({ config: response.data, error: undefined });
      return undefined;
    } catch (error) {
      return handleErrors(error);
    }
  }

  updateBlackboardConfig = async (formData, configUuid) => {
    const transformedData = snakeCaseFormData(formData);
    transformedData.append('enterprise_customer', this.props.enterpriseId);
    try {
      const response = await LmsApiService.updateBlackboardConfig(transformedData, configUuid);
      this.setState({ config: response.data, error: undefined });
      return undefined;
    } catch (error) {
      return handleErrors(error);
    }
  }

  /**
   * attempt to submit the form data and show any error states or invalid fields.
   * @param {FormData} formData
   */
  handleSubmit = async (formData, config) => {
    this.setState({ submitState: SUBMIT_STATES.PENDING });
    const invalidFields = validateLmsConfigForm(formData, REQUIRED_BLACKBOARD_CONFIG_FIELDS);
    if (!isEmpty(invalidFields)) {
      this.setState({
        invalidFields: {
          ...invalidFields,
        },
        submitState: SUBMIT_STATES.DEFAULT,
      });
      return;
    }

    formData.append('enterprise_customer', this.props.enterpriseId);

    let err;
    if (config) {
      err = await this.updateBlackboardConfig(formData, config.id);
    } else {
      err = await this.createBlackboardConfig(formData);
    }
    if (err) {
      this.setState({
        submitState: SUBMIT_STATES.ERROR,
        error: err,
      });
      return;
    }
    this.setState({ submitState: SUBMIT_STATES.COMPLETE });
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
                data-hj-suppress
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="clientId"
              invalid={invalidFields.clientId}
              invalidMessage="Blackboard client ID is required."
              helpText="This should match the API Client ID found on Blackboard."
            >
              <label htmlFor="clientId">Blackboard Client ID</label>
              <Input
                type="text"
                id="clientId"
                name="clientId"
                defaultValue={config ? config.clientId : null}
                data-hj-suppress
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="clientSecret"
              invalid={invalidFields.clientSecret}
              invalidMessage="Blackboard client secret is required."
              helpText="This should match the API Client secret found on Blackboard."
            >
              <label htmlFor="clientSecret">Blackboard Client Secret</label>
              <Input
                type="text"
                id="clientSecret"
                name="clientSecret"
                defaultValue={config ? config.clientSecret : null}
                data-hj-suppress
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="refreshToken"
              helpText="The Blackboard API's refresh token token. This should be automatically propagated once you visit the oauth complete endpoint."
            >
              <label htmlFor="refreshToken">Blackboard API Refresh Token</label>
              <Input
                type="text"
                id="refreshToken"
                name="refreshToken"
                defaultValue={config ? config.refreshToken : null}
                data-hj-suppress
              />
            </ValidationFormGroup>
          </div>
        </div>

        <div className="row">
          <div className="col col-4">
            {config?.oauthAuthorizationUrl && (
            <div className="form-group align-items-left">
              <Hyperlink destination={config ? config.oauthAuthorizationUrl : null} target="_blank">
                Authorize
              </Hyperlink>
              <p className="small">
                OAuth Authorization Link. Will be available once Base URL and Client ID are supplied.
              </p>
            </div>
            )}
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
  enterpriseId: null,
};

BlackboardIntegrationConfigForm.propTypes = {
  config: PropTypes.shape({
    active: PropTypes.bool,
    blackboardBaseUrl: PropTypes.string,
    refreshToken: PropTypes.string,
    clientId: PropTypes.string,
    clientSecret: PropTypes.string,
    oauthAuthorizationUrl: PropTypes.string,
  }),
  enterpriseId: PropTypes.string,
};

export default BlackboardIntegrationConfigForm;
