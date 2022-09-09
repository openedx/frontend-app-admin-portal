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

export const REQUIRED_SUCCESS_FACTOR_CONFIG_FIELDS = [
  'sapsfBaseUrl',
  'sapsfCompanyId',
  'sapsfUserId',
  'key',
  'secret',
  'userType',
];

const SUCCESS_FACTOR_FIELDS = [
  {
    key: 'sapsfBaseUrl',
    invalidMessage: 'SAP Success Factors Instance URL is required.',
    helpText: 'Your SAP Success Factors instance URL. Make sure to include the protocol (ie https/http)',
    label: 'SAP Success Factors Instance URL',
  },
  {
    key: 'sapsfCompanyId',
    invalidMessage: 'SAP Success Factors Company Id field is required.',
    helpText: 'This should match the Company Id as found in SAP Success Factors.',
    label: 'SAP Success Factors Company Id',
  },
  {
    key: 'key',
    invalidMessage: 'Success Factors\' Client Id is required.',
    helpText: 'Oauth client identifier.',
    label: 'Client Id',
  },
  {
    key: 'secret',
    invalidMessage: 'Success Factors\' Client Secret is required.',
    helpText: 'OAuth client secret.',
    label: 'Client Secret',
    type: 'password',
  },
  {
    key: 'sapsfUserId',
    invalidMessage: 'Success Factors\' User Id is required.',
    helpText: 'Success Factors user identifier',
    label: 'SAP Success Factors User Id',
  },
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
    this.setState({ submitState: SUBMIT_STATES.PENDING, error: null, invalidFields: {} });
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

  renderField = data => {
    const { invalidFields } = this.state;
    const { config } = this.props;
    return (
      <div className="row" key={data.key}>
        <div className="col col-4">
          <Form.Group
            controlId={data.key}
            isInvalid={invalidFields[data.key]}
          >
            <Form.Label>{data.label}</Form.Label>
            <Form.Control
              type={data.type || 'text'}
              name={data.key}
              // eslint-disable-next-line no-nested-ternary
              defaultValue={config ? config[data.key] : data.type === 'number' ? 1 : ''}
              data-hj-suppress
            />
            <Form.Text>{data.helpText}</Form.Text>
            {invalidFields[data.key] && data.invalidMessage && (
              <Form.Control.Feedback icon={<Error className="mr-1" />}>
                {data.invalidMessage}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </div>
      </div>
    );
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

    const userTypeOptions = [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'User' },
      { value: null, label: 'blank', hidden: true },
    ].map(userType => (
      <option value={userType.value} key={userType.value} hidden={userType.hidden}>
        {userType.label}
      </option>
    ));

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
              <Form.Checkbox
                name="active"
                checked={active}
                onChange={() => this.setState(prevState => ({ active: !prevState.active }))}
                floatLabelLeft
              >
                Active
              </Form.Checkbox>
            </Form.Group>
          </div>
        </div>

        {SUCCESS_FACTOR_FIELDS.map(this.renderField)}

        <div className="row">
          <div className="col col-4">
            <Form.Group
              controlId="userType"
              isInvalid={invalidFields.userType}
            >
              <Form.Label>SAP Success Factors User Type</Form.Label>
              <Form.Control
                as="select"
                name="userType"
                defaultValue={config ? config.userType : null}
              >
                {userTypeOptions}
              </Form.Control>
              <Form.Text>Type of SAP User (admin or user).</Form.Text>
              {invalidFields.userType && (
                <Form.Control.Feedback icon={<Error className="mr-1" />}>
                  Success Factors&apos; User Type is required.
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </div>
        </div>
        <div className="row">
          <div className="col col-6">
            <Form.Group controlId="transmitTotalHours">
              <Form.Checkbox
                name="transmitTotalHours"
                checked={transmitTotalHours}
                onChange={() => this.setState(prevState => ({ transmitTotalHours: !prevState.transmitTotalHours }))}
                floatLabelLeft
              >
                Transmit Total Hours?
              </Form.Checkbox>
              <Form.Text>Include totalHours in the transmitted completion data.</Form.Text>
            </Form.Group>
          </div>
        </div>
        {this.renderField({
          key: 'additionalLocales',
          helpText: "A comma separated list of any additional locales used in SAP (such as 'Dutch' or 'English Canadian'). See SAP's documentation for more examples.",
          label: 'Additional Locales',
        })}

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
