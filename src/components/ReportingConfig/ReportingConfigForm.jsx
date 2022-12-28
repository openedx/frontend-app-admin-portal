import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import {
  Form, StatefulButton, Icon, Button,
} from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import SFTPDeliveryMethodForm from './SFTPDeliveryMethodForm';
import EmailDeliveryMethodForm from './EmailDeliveryMethodForm';
import SUBMIT_STATES from '../../data/constants/formSubmissions';

//  All the fields in this form that need to be validated can be added here.
const REQUIRED_FIELDS = [
  'hourOfDay',
];
// for the email delivery method
const REQUIRED_EMAIL_FIELDS = [
  ...REQUIRED_FIELDS,
  'emailRaw',
];
// for the sftp delivery mothod
const REQUIRED_SFTP_FIELDS = [
  ...REQUIRED_FIELDS,
  'sftpPort',
  'sftpHostname',
  'sftpUsername',
  'sftpFilePath',
];
const REQUIRED_NEW_SFTP_FEILDS = [
  ...REQUIRED_SFTP_FIELDS,
  'encryptedSftpPassword',
];
const REQUIRED_NEW_EMAIL_FIELDS = [
  ...REQUIRED_EMAIL_FIELDS,
  'encryptedPassword',
];
const MONTHLY_MAX = 31;
const MONTHLY_MIN = 1;

class ReportingConfigForm extends React.Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    frequency: this.props.config ? this.props.config.frequency : 'monthly',
    deliveryMethod: this.props.config ? this.props.config.deliveryMethod : 'email',
    invalidFields: {},
    APIErrors: {},
    active: this.props.config ? this.props.config.active : false,
    submitState: SUBMIT_STATES.DEFAULT,
  };

  /**
   * Validates this form. If the form is invalid, it will return the fields
   * that were invalid. Otherwise, it will return an empty object.
   * @param {FormData} formData
   * @param {[String]} requiredFields
   */
  validateReportingForm = (formData, requiredFields) => {
    const invalidFields = requiredFields
      .filter(field => !formData.get(field))
      .reduce((prevFields, currField) => ({ ...prevFields, [currField]: true }), {});
    return invalidFields;
  };

  /**
   * Handles the state change for when a form field validation onBlur is called. An
   * optional second param can be added to give a specific validation function,
   * otherwise it is just checked to see if it is empty.
   * @param {Event} e
   * @param {Func} validationFunction -> to see and example of this,
   * check the <EmailDeliveryMethodForm />
   */
  handleBlur = (e, validationFunction) => {
    // One special case for email fields
    const field = e.target;
    const error = validationFunction ? validationFunction() : !field.value.length;
    this.setState((state) => ({
      invalidFields: {
        ...state.invalidFields,
        [field.name]: error,
      },
      // Remove the field that changed from APIErrors. It will b validated again on the next API request/
      APIErrors: {
        ...omit(state.APIErrors, [field.name]),
      },
    }));
  };

  handleAPIErrorResponse = (response) => {
    const responseData = response && camelCaseObject(response.data);
    const invalidFields = {};

    if (!isEmpty(responseData)) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(responseData)) {
        [invalidFields[key]] = value;
      }

      this.setState((state) => ({
        APIErrors: {
          ...state.APIErrors,
          ...invalidFields,
        },
      }));
    }
  };

  /**
   * attempt to submit the form data and show any error states or invalid fields.
   * @param {FormData} formData
   * @param {*} config
   */
  handleSubmit = async (formData, config) => {
    await this.setState({ submitState: SUBMIT_STATES.PENDING });
    let requiredFields = [];
    if (formData.get('deliveryMethod') === 'email') {
      requiredFields = config ? [...REQUIRED_EMAIL_FIELDS] : [...REQUIRED_NEW_EMAIL_FIELDS];
      // transform email field to match what the api is looking for
      const emails = formData.get('emailRaw').split('\n');
      emails.forEach(email => formData.append('email[]', email));
    } else {
      // Password field needs to be required only when creating a new configuration
      requiredFields = config ? [...REQUIRED_SFTP_FIELDS] : [...REQUIRED_NEW_SFTP_FEILDS];
    }
    // validate the form
    const invalidFields = this.validateReportingForm(formData, requiredFields);
    // if there are invalid fields, reflect that in the UI
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

    // append the enterprise customer data if editing an already created reporting form
    if (config) {
      formData.append('uuid', config.uuid);
      formData.append('enterprise_customer_id', config.enterpriseCustomer.uuid);
      const err = await this.props.updateConfig(formData, config.uuid);
      if (err) {
        this.setState({ submitState: SUBMIT_STATES.ERROR });
        this.handleAPIErrorResponse(err.response);
        return;
      }
    } else {
      // ...or create a new configuration
      formData.append('enterprise_customer_id', this.props.enterpriseCustomerUuid);
      const err = await this.props.createConfig(formData);
      if (err) {
        this.setState({ submitState: SUBMIT_STATES.ERROR });
        this.handleAPIErrorResponse(err.response);
        return;
      }
    }
    this.setState({ submitState: SUBMIT_STATES.COMPLETE });
  };

  renderSelect = data => {
    const { config, reportingConfigTypes } = this.props;
    const { invalidFields } = this.state;
    const options = data.options.map(userType => (
      <option value={userType.value} key={userType.value} hidden={userType.hidden}>
        {userType.label}
      </option>
    ));
    const otherProps = {
      ...data.multiple && { multiple: data.multiple },
      ...data.onChange && { onChange: data.onChange },
    };

    return (
      <Form.Group
        controlId={data.key}
        isInvalid={invalidFields[data.key]}
      >
        <Form.Label>{data.label}</Form.Label>
        <Form.Control
          as="select"
          name={data.key}
          // eslint-disable-next-line no-nested-ternary
          defaultValue={data.defaultValue ? data.defaultValue : config
            ? config[data.key] : reportingConfigTypes[data.key][0][0]}
          disabled={data.disabled}
          {...otherProps}
        >
          {options}
        </Form.Control>
        {data.helpText && <Form.Text>{data.helpText}</Form.Text>}
        {invalidFields[data.key] && data.invalidMessage && (
          <Form.Control.Feedback icon={<Error className="mr-1" />}>
            {data.invalidMessage}
          </Form.Control.Feedback>
        )}
      </Form.Group>
    );
  };

  renderNumberField = data => {
    const { invalidFields } = this.state;
    const { config } = this.props;
    const otherProps = {
      ...data.max && { max: data.max },
      ...data.min && { min: data.min },
    };
    return (
      <Form.Group
        controlId={data.key}
        isInvalid={data.isInvalid ? data.isInvalid : invalidFields[data.key]}
      >
        <Form.Label>{data.label}</Form.Label>
        <Form.Control
          type="number"
          name={data.key}
          defaultValue={config ? config[data.key] : 1}
          disabled={data.disabled}
          data-hj-suppress
          onBlur={e => this.handleBlur(e)}
          {...otherProps}
        />
        <Form.Text>{data.helpText}</Form.Text>
        {invalidFields[data.key] && data.invalidMessage && (
          <Form.Control.Feedback icon={<Error className="mr-1" />}>
            {data.invalidMessage}
          </Form.Control.Feedback>
        )}
      </Form.Group>
    );
  };

  render() {
    const { config, availableCatalogs, reportingConfigTypes } = this.props;
    const {
      frequency,
      invalidFields,
      APIErrors,
      deliveryMethod,
      active,
      submitState,
    } = this.state;
    const selectedCatalogs = (config?.enterpriseCustomerCatalogs || []).map(item => item.uuid);
    const dataTypesOptions = reportingConfigTypes.dataType.map((item, index) => ({
      key: index, label: item[1], value: item[0],
    }));
    const dataTypesOptionsValues = dataTypesOptions.map(item => item.value);
    const selectedDataTypesOption = config ? [{ label: config.dataType, value: config.dataType, hidden: true }] : [];
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
          <div className="col">
            <Form.Group controlId="active">
              <Form.Checkbox
                name="active"
                checked={active}
                onChange={() => this.setState(prevState => ({ active: !prevState.active }))}
                floatLabelLeft
              >
                Active?
              </Form.Checkbox>
            </Form.Group>
          </div>
        </div>
        <div className="row">
          <div className="col col-6">
            {this.renderSelect({
              key: 'dataType',
              helpText: 'The type of data this report should contain. If this is an old report, you will not be able to change this field, and should create a new report',
              label: 'Data Type',
              options: [...dataTypesOptions, ...selectedDataTypesOption],
              disabled: config && !dataTypesOptionsValues.includes(config.dataType),
            })}
            {this.renderSelect({
              key: 'reportType',
              helpText: 'The type this report should be sent as, e.g. CSV',
              label: 'Report Type',
              options: reportingConfigTypes.reportType.map(item => ({ label: item[1], value: item[0] })),
            })}
          </div>
          <div className="col col-6">
            {this.renderSelect({
              key: 'deliveryMethod',
              helpText: 'The method in which the data should be sent',
              label: 'Delivery Method',
              options: reportingConfigTypes.deliveryMethod.map(item => ({ label: item[1], value: item[0] })),
              onChange: event => this.setState({ deliveryMethod: event.target.value }),
            })}
            {this.renderSelect({
              key: 'frequency',
              helpText: 'The frequency interval (daily, weekly, or monthly) that the report should be sent',
              label: 'Frequency',
              options: reportingConfigTypes.frequency.map(item => ({ label: item[1], value: item[0] })),
              defaultValue: frequency,
              onChange: event => this.setState({ frequency: event.target.value }),
            })}
          </div>
        </div>
        <div className="row">
          <div className="col">
            {this.renderNumberField({
              key: 'dayOfMonth',
              helpText: 'The day of the month to send the report. This field is required and only valid when the frequency is monthly',
              isInvalid: frequency === 'monthly' && invalidFields.dayOfMonth,
              label: 'Day of Month',
              max: MONTHLY_MAX,
              min: MONTHLY_MIN,
              disabled: !(frequency === 'monthly'),
              onBlur: event => this.handleBlur(event),
            })}
          </div>
          <div className="col">
            {this.renderSelect({
              key: 'dayOfWeek',
              helpText: 'The day of the week to send the report. This field is required and only valid when the frequency is weekly',
              label: 'Day of Week',
              options: reportingConfigTypes.dayOfWeek.map(item => ({ label: item[1], value: item[0] })),
              disabled: !(frequency === 'weekly'),
            })}
          </div>
          <div className="col">
            {this.renderNumberField({
              key: 'hourOfDay',
              helpText: 'The hour of the day to send the report, in Eastern Standard Time (EST). This is required for all frequency settings',
              invalidMessage: 'Required for all frequency types',
              label: 'Hour of Day',
            })}
          </div>
        </div>
        <Form.Group controlId="pgpEncyptionKey">
          <Form.Label>PGP Encryption Key</Form.Label>
          <Form.Control
            as="textarea"
            name="pgpEncryptionKey"
            defaultValue={config ? config.pgpEncryptionKey : undefined}
            data-hj-suppress
            autoResize
            invalid={!!APIErrors.pgpEncryptionKey}
            invalidMessage={APIErrors.pgpEncryptionKey}
            onBlur={e => this.handleBlur(e)}
          />
          <Form.Text>The key for encyption, if PGP encrypted file is required</Form.Text>
        </Form.Group>
        {deliveryMethod === 'email' && (
          <EmailDeliveryMethodForm
            config={config}
            invalidFields={invalidFields}
            handleBlur={this.handleBlur}
          />
        )}
        {deliveryMethod === 'sftp' && (
          <SFTPDeliveryMethodForm
            config={config}
            invalidFields={invalidFields}
            handleBlur={this.handleBlur}
          />
        )}
        <div className="col">
          {this.renderSelect({
            key: 'enterpriseCustomerCatalogUuids',
            helpText: 'The catalogs that should be included in the report. No selection means all catalogs will be included.',
            label: 'Enterprise Customer Catalogs',
            options: availableCatalogs && availableCatalogs.map(item => ({
              value: item.uuid,
              label: `Catalog "${item.title}" with UUID "${item.uuid}"`,
            })),
            multiple: true,
            defaultValue: selectedCatalogs,
          })}
        </div>
        <div className="row justify-content-between align-items-center form-group">
          <Form.Group
            controlId="submitButton"
            isInvalid={submitState === SUBMIT_STATES.ERROR}
            className="mb-0"
          >
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
            {submitState === SUBMIT_STATES.ERROR && (
              <Form.Control.Feedback icon={<Error className="mr-1" />}>
                There was an error submitting, please try again.
              </Form.Control.Feedback>
            )}
          </Form.Group>
          {config && (
            <Button
              className="btn-outline-danger  mr-3"
              onClick={() => this.props.deleteConfig(config.uuid)}
            >
              <Icon className="fa fa-times danger" /> Delete
            </Button>
          )}
        </div>
      </form>
    );
  }
}
ReportingConfigForm.defaultProps = {
  config: undefined,
  deleteConfig: undefined,
  updateConfig: undefined,
};

ReportingConfigForm.propTypes = {
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  config: PropTypes.shape({
    active: PropTypes.bool,
    dataType: PropTypes.string,
    dayOfMonth: PropTypes.number,
    dayOfWeek: PropTypes.number,
    deliveryMethod: PropTypes.string,
    email: PropTypes.arrayOf(PropTypes.string),
    frequency: PropTypes.string,
    hourOfDay: PropTypes.number,
    reportType: PropTypes.string,
    sftpFilePath: PropTypes.string,
    sftpHostname: PropTypes.string,
    sftpPort: PropTypes.number,
    sftpUsername: PropTypes.string,
    pgpEncryptionKey: PropTypes.string,
    uuid: PropTypes.string,
    enterpriseCustomerCatalogs: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string,
      title: PropTypes.string,
    })),
  }),
  availableCatalogs: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string,
    title: PropTypes.string,
  })).isRequired,
  reportingConfigTypes: PropTypes.shape({
    dataType: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    reportType: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    deliveryMethod: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    dayOfWeek: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]))),
    frequency: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  }).isRequired,
  createConfig: PropTypes.func.isRequired,
  updateConfig: PropTypes.func,
  deleteConfig: PropTypes.func,
};

export default ReportingConfigForm;
