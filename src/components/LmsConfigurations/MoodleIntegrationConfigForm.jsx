import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {
  Form, StatefulButton, Icon,
} from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import { snakeCaseFormData } from '../../utils';
import LmsApiService from '../../data/services/LmsApiService';
import StatusAlert from '../StatusAlert';
import SUBMIT_STATES from '../../data/constants/formSubmissions';
import { handleErrors, validateLmsConfigForm } from './common';

export const REQUIRED_MOODLE_CONFIG_FIELDS = [
  'moodleBaseUrl',
  'serviceShortName',
];

const MOODLE_FIELDS = [
  {
    key: 'moodleBaseUrl',
    invalidMessage: 'Moodle Instance URL is required.',
    helpText: 'Your Moodle instance URL. Make sure to include the protocol (ie https/http)',
    label: 'Moodle Instance URL',
  },
  {
    key: 'serviceShortName',
    invalidMessage: 'Webservice name is required.',
    helpText: 'This should match the webservice\'s short name in Moodle.',
    label: 'Webservice\'s Short Name',
  },
  {
    key: 'categoryId',
    helpText: 'The category id all edX courses will be added under. Default is 1 (Miscellaneous)',
    type: 'number',
    label: 'Moodle Category ID',
  },
  {
    key: 'username',
    invalidMessage: 'A username and password must be provided when a token is not. However, you should not provide both user credentials and token.',
    helpText: 'The Webservice\'s username in Moodle. You must provide this and password or a token',
    label: 'Webservice Username',
    invalidAdditionalCondition: 'duplicateCreds',
  },
  {
    key: 'password',
    invalidMessage: 'A username and password must be provided when a token is not. However, you should not provide both user credentials and token.',
    helpText: 'The Webservice\'s password in Moodle. You must provide this and username or a token',
    label: 'Webservice Password',
    invalidAdditionalCondition: 'duplicateCreds',
  },
  {
    key: 'token',
    invalidMessage: 'A token must be provided when username/password is not. However, you should not provide both user credentials and token.',
    helpText: 'The Webservice user\'s auth token. Use this in place of a username/password.',
    label: 'Webservice Auth Token',
    invalidAdditionalCondition: 'duplicateCreds',
  },
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
            <Form.Group controlId="active">
              <Form.Label htmlFor="active">Active</Form.Label>
              <Form.Checkbox
                id="active"
                name="active"
                className="ml-3"
                checked={active}
                onChange={() => this.setState(prevState => ({ active: !prevState.active }))}
                isInline
              />
            </Form.Group>
          </div>
        </div>

        {MOODLE_FIELDS.map(moodleField => (
          <div className="row" key={moodleField.key}>
            <div className="col col-4">
              <Form.Group
                controlId={moodleField.key}
                isInvalid={invalidFields[moodleField.key] || invalidFields[moodleField.invalidAdditionalCondition]}
              >
                <Form.Label htmlFor={moodleField.key}>{moodleField.label}</Form.Label>
                <Form.Control
                  type={moodleField.type || 'text'}
                  id={moodleField.key}
                  name={moodleField.key}
                  // eslint-disable-next-line no-nested-ternary
                  defaultValue={config ? config[moodleField.key] : moodleField.type === 'number' ? 1 : ''}
                  data-hj-suppress
                />
                <Form.Text>{moodleField.helpText}</Form.Text>
                {(invalidFields[moodleField.key] || invalidFields[moodleField.invalidAdditionalCondition])
                  && moodleField.invalidMessage && (
                  <Form.Control.Feedback icon={<Error className="mr-1" />}>
                    {moodleField.invalidMessage}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </div>
          </div>
        ))}

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
