import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {
  ValidationFormGroup, Input, StatefulButton, Icon, Alert,
} from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

import { snakeCaseFormData } from '../../utils';
import LmsApiService from '../../data/services/LmsApiService';
import SUBMIT_STATES from '../../data/constants/formSubmissions';
import { handleErrors, validateLmsConfigForm } from './common';

export const REQUIRED_MOODLE_CONFIG_FIELDS = [
  'moodleBaseUrl',
  'serviceShortName',
];

class MoodleIntegrationConfigForm extends React.Component {
  state = {
    invalidFields: {},
    submitState: SUBMIT_STATES.DEFAULT,
    active: this.props.config?.active,
    error: null,
  }

  /**
   * Creates a new third party provider configuration, then updates this list with the response.
   * Returns if there is an error.
   * @param {FormData} formData
   */
  createMoodleConfig = async (formData) => {
    const transformedData = snakeCaseFormData(formData);
    transformedData.append('enterprise_customer', this.props.enterpriseId);
    try {
      const response = await LmsApiService.postNewMoodleConfig(transformedData);
      this.setState({ config: response.data });
      return undefined;
    } catch (error) {
      return handleErrors(error);
    }
  }

  updateMoodleConfig = async (formData, configId) => {
    const transformedData = snakeCaseFormData(formData);
    transformedData.append('enterprise_customer', this.props.enterpriseId);
    try {
      const response = await LmsApiService.updateMoodleConfig(transformedData, configId);
      this.setState({ config: response.data });
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
    this.setState({ submitState: SUBMIT_STATES.PENDING, error: null, invalidFields: {} });
    let requiredFields = [];
    requiredFields = [...REQUIRED_MOODLE_CONFIG_FIELDS];
    if (!formData.get('token')) {
      requiredFields.push('username');
      requiredFields.push('password');
    } else if (!formData.get('username') && !formData.get('password')) {
      requiredFields.push('token');
    } else if ((formData.get('username') || formData.get('password')) && formData.get('token')) {
      requiredFields.push('duplicateCreds');
    }
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
      const err = await this.updateMoodleConfig(formData, config.id);
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
      const err = await this.createMoodleConfig(formData);
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
          <Alert
            variant="danger"
            icon={Error}
          >
            <Alert.Heading>Unable to submit config form:</Alert.Heading>
            <p>{error}</p>
          </Alert>
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
              for="moodleBaseUrl"
              invalid={invalidFields.moodleBaseUrl}
              invalidMessage="Moodle Instance URL is required."
              helpText="Your Moodle instance URL. Make sure to include the protocol (ie https/http)"
            >
              <label htmlFor="moodleBaseUrl">Moodle Instance URL</label>
              <Input
                type="text"
                id="moodleBaseUrl"
                name="moodleBaseUrl"
                defaultValue={config ? config.moodleBaseUrl : null}
                data-hj-suppress
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="serviceShortName"
              invalid={invalidFields.serviceShortName}
              invalidMessage="Webservice name is required."
              helpText="This should match the webservice's short name in Moodle."
            >
              <label htmlFor="serviceShortName">Webservice&apos;s Short Name</label>
              <Input
                type="text"
                id="serviceShortName"
                name="serviceShortName"
                defaultValue={config ? config.serviceShortName : null}
                data-hj-suppress
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="categoryId"
              helpText="The category id all edX courses will be added under. Default is 1 (Miscellaneous)"
            >
              <label htmlFor="categoryId">Moodle Category ID</label>
              <Input
                type="number"
                id="categoryId"
                name="categoryId"
                defaultValue={config ? config.categoryId : 1}
                data-hj-suppress
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="username"
              helpText="The Webservice's username in Moodle. You must provide this and password or a token"
              invalid={invalidFields.username || invalidFields.duplicateCreds}
              invalidMessage="A username and password must be provided when a token is not. However, you should not provide both user credentials and token."
            >
              <label htmlFor="username">Webservice Username</label>
              <Input
                type="text"
                id="username"
                name="username"
                defaultValue={config ? config.username : null}
                data-hj-suppress
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="password"
              helpText="The Webservice's password in Moodle. You must provide this and username or a token"
              invalid={invalidFields.password || invalidFields.duplicateCreds}
              invalidMessage="A username and password must be provided when a token is not. However, you should not provide both user credentials and token."
            >
              <label htmlFor="password">Webservice Password</label>
              <Input
                type="text"
                id="password"
                name="password"
                defaultValue={config ? config.password : null}
                data-hj-suppress
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col col-4">
            <ValidationFormGroup
              for="token"
              helpText="The Webservice user's auth token. Use this in place of a username/password."
              invalid={invalidFields.token || invalidFields.duplicateCreds}
              invalidMessage="A token must be provided when username/password is not. However, you should not provide both user credentials and token."
            >
              <label htmlFor="token">Webservice Auth Token</label>
              <Input
                type="text"
                id="token"
                name="token"
                defaultValue={config ? config.token : null}
                data-hj-suppress
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

MoodleIntegrationConfigForm.defaultProps = {
  config: null,
};

MoodleIntegrationConfigForm.propTypes = {
  config: PropTypes.shape({
    active: PropTypes.bool,
    moodleBaseUrl: PropTypes.string,
    serviceShortName: PropTypes.string,
    categoryId: PropTypes.number,
    username: PropTypes.string,
    password: PropTypes.string,
    token: PropTypes.string,
  }),
  enterpriseId: PropTypes.string.isRequired,
};

export default MoodleIntegrationConfigForm;
