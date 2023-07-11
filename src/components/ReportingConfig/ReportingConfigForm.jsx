import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import {
  Form, StatefulButton, Icon, Button,
} from '@edx/paragon';
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
    enableCompression: this.props.config ? this.props.config.enableCompression : true,
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

    // Password is conditionally required only when pgp key will not be present
    // and delivery method is email
    if (!formData.get('pgpEncryptionKey') && formData.get('deliveryMethod') === 'email') {
      if (!formData.get('encryptedPassword')) {
        invalidFields.encryptedPassword = true;
      }
    }
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

  render() {
    const { config, availableCatalogs, reportingConfigTypes } = this.props;
    const {
      frequency,
      invalidFields,
      APIErrors,
      deliveryMethod,
      active,
      enableCompression,
      submitState,
    } = this.state;

    const selectedCatalogs = (config?.enterpriseCustomerCatalogs || []).map(item => item.uuid);
    const dataTypesOptions = reportingConfigTypes.dataType.map((item, index) => ({
      key: index, label: item[1], value: item[0],
    }));
    const dataTypesOptionsValues = dataTypesOptions.map(item => item.value);
    const selectedDataTypesOption = config ? [{ label: config.dataType, value: config.dataType, hidden: true }] : [];
    return (
      <Form>
        <Form.Row>
          <Form.Group>
            <Form.Checkbox
              id="active"
              checked={active}
              onChange={() => this.setState(prevState => ({ active: !prevState.active }))}
            >Active
            </Form.Checkbox>
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group>
            <Form.Control
              floatingLabel="Data type"
              id="dataType"
              disabled={config && !dataTypesOptionsValues.includes(config.dataType)}
              as="select"
            >
              {dataTypesOptions.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
              {selectedDataTypesOption.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
            </Form.Control>
            <Form.Text>
              The type of data this report should contain. If this is an old report, you will not be able
              to change this field, and should create a new report
            </Form.Text>
          </Form.Group>
          <Form.Group>
            <Form.Control
              floatingLabel="Report type"
              id="reportType"
              disabled={config && !dataTypesOptionsValues.includes(config.dataType)}
              as="select"
              defaultValue={config ? config.reportType : reportingConfigTypes.reportType[0][0]}
            >
              {reportingConfigTypes.reportType.map(
                (item => <option key={item[0]} value={item[0]}>{item[1]}</option>),
              )}
            </Form.Control>
            <Form.Text>
              The type this report should be sent as, e.g. CSV
            </Form.Text>
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group>
            <Form.Control
              floatingLabel="Delivery method"
              id="deliveryMethod"
              as="select"
              disabled={config}
              defaultValue={config ? config.deliveryMethod : reportingConfigTypes.deliveryMethod[0][0]}
              onChange={e => this.setState({ deliveryMethod: e.target.value })}
            >
              {reportingConfigTypes.deliveryMethod.map(
                item => (<option key={item[0]} data-testid={`delivery-method-${item[0]}`} value={item[0]}>{item[1]}</option>),
              )}
            </Form.Control>
            <Form.Text>
              The method in which the data should be sent
            </Form.Text>
            {!!APIErrors.deliveryMethod && (
              <Form.Control.Feedback type="invalid">
                {APIErrors.deliveryMethod}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Control
              as="select"
              floatingLabel="Frequency"
              id="frequency"
              disabled={config}
              defaultValue={frequency}
              onChange={e => this.setState({ frequency: e.target.value })}
            >
              {reportingConfigTypes.frequency.map(item => (<option key={item[0]} value={item[0]}>{item[1]}</option>))}
            </Form.Control>
            <Form.Text>
              The frequency interval (daily, weekly, or monthly) that the report should be sent
            </Form.Text>
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group>
            <Form.Control
              floatingLabel="Day of the month"
              type="number"
              id="dayOfWeek"
              max={MONTHLY_MAX}
              min={MONTHLY_MIN}
              disabled={!(frequency === 'monthly')}
              defaultValue={config ? config.dayOfMonth : 1}
            />
            <Form.Text>
              The hour of the day to send the report, in Eastern Standard Time (EST).
              This is required for all frequency settings
            </Form.Text>
            {(frequency === 'monthly' && invalidFields.dayOfMonth) && (
            <Form.Control.Feedback type="invalid">
              The day of the month to send the report. This field is required
              and only valid when the frequency is monthly
            </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Control
              floatingLabel="Day of the week"
              type="number"
              id="dayOfWeek"
              disabled={!(frequency === 'weekly')}
              defaultValue={config ? config.dayOfWeek : undefined}
              as="select"
            >
              {reportingConfigTypes.dayOfWeek.map(item => (<option key={item[0]} value={item[0]}>{item[1]}</option>))}
            </Form.Control>
            <Form.Text>
              The day of the week to send the report. This field is required and only valid when the frequency is weekly
            </Form.Text>
          </Form.Group>
          <Form.Group>
            <Form.Control
              as="select"
              floatingLabel="Hour of the day"
              type="number"
              id="hourOfDay"
              disabled={!(frequency === 'weekly')}
              defaultValue={config ? config.dayOfWeek : undefined}
            >
              {reportingConfigTypes.dayOfWeek.map(item => (<option key={item[0]} value={item[0]}>{item[1]}</option>))}
            </Form.Control>
            <Form.Text>
              The hour of the day to send the report, in Eastern Standard Time (EST).
              This is required for all frequency settings
            </Form.Text>
            {invalidFields.hourOfDay && (
            <Form.Control.Feedback type="invalid">
              Required for all frequency types
            </Form.Control.Feedback>
            )}
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group>
            <Form.Control
              id="pgpEncryptionKey"
              floatingLabel="PGP Encryption Key"
              as="textarea"
              defaultValue={config ? config.pgpEncryptionKey : undefined}
            />
            <Form.Text>
              The key for encryption, if PGP encrypted file is required
            </Form.Text>
            {!!APIErrors.pgpEncryptionKey && (
            <Form.Control.Feedback type="invalid">
              {APIErrors.pgpEncryptionKey}
            </Form.Control.Feedback>
            )}
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
            />
          )}
        </Form.Row>
        <Form.Row>
          <Form.Group>
            <Form.Checkbox
              id="enableCompression"
              checked={enableCompression}
              onChange={() => this.setState(prevState => ({ enableCompression: !prevState.enableCompression }))}
            >Enable compression
            </Form.Checkbox>
          </Form.Group>
          <Form.Group>
            <Form.Control
              floatingLabel="Enterprise Customer Catalogs"
              id="enterpriseCustomerCatalogs"
              as="select"
              multiple
            >
              {availableCatalogs && availableCatalogs.map(item => (
                <option
                  key={item.uuid}
                  value={item.uuid}
                  selected={selectedCatalogs.includes(item.uuid)}
                >
                  {`Catalog "${item.title}" with UUID "${item.uuid}"`}
                </option>
              ))}
            </Form.Control>
            <Form.Text>
              The catalogs that should be included in the report. No selection means all catalogs will be included.
            </Form.Text>
          </Form.Group>
        </Form.Row>
        <Form.Row className="justify-content-between align-items-center">
          <Form.Control
            id="submitButton"
            as="button"
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
              onClick={() => this.handleSubmit()}
              className="ml-3 col"
              variant="primary"
            />
          </Form.Control>
          {submitState === SUBMIT_STATES.ERROR && (
          <Form.Control.Feedback type="invalid">
            There was an error submitting, please try again.
          </Form.Control.Feedback>
          )}
          {config && (
            <Button
              className="btn-outline-danger  mr-3"
              onClick={() => this.props.deleteConfig(config.uuid)}
            >
              <Icon className="fa fa-times danger" /> Delete
            </Button>
          )}
        </Form.Row>
      </Form>
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
    enableCompression: PropTypes.bool,
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
