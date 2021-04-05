import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {
  ValidationFormGroup, Input, StatefulButton, Icon, Button,
} from '@edx/paragon';
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
    active: this.props.config ? this.props.config.active : false,
    submitState: SUBMIT_STATES.DEFAULT,
  }

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
    this.setState((state) => ({
      invalidFields: {
        ...state.invalidFields,
        [e.target.name]: validationFunction
          ? validationFunction()
          : !e.target.value.length,
      },
    }));
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
        return;
      }
    } else {
      // ...or create a new configuration
      const err = await this.props.createConfig(formData);
      if (err) {
        this.setState({ submitState: SUBMIT_STATES.ERROR });
        return;
      }
    }
    this.setState({ submitState: SUBMIT_STATES.COMPLETE });
  }

  render() {
    const { config, availableCatalogs } = this.props;
    const {
      frequency,
      invalidFields,
      deliveryMethod,
      active,
      submitState,
    } = this.state;
    const selectedCatalogs = (config?.enterpriseCustomerCatalogs || []).map(item => item.uuid);

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          this.handleSubmit(formData, config);
        }}
        onChange={() => this.setState({ submitState: SUBMIT_STATES.DEFAULT })}
      >
        <div className="col">
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
        <div className="row">
          <div className="col col-6">
            <ValidationFormGroup
              for="dataType"
              helpText="The type of data this report should contain. If this is an old report, you will not be able to change this field, and should create a new report"
            >
              <label htmlFor="dataType">Data Type</label>
              <Input
                type="select"
                id="dataType"
                name="dataType"
                defaultValue={config ? config.dataType : 'progress_v2'}
                disabled={config && config.dataType === 'progress'}
                options={[
                  { value: 'progress_v2', label: 'progress' },
                  { value: 'catalog', label: 'catalog' },
                  { value: 'progress', label: 'progress', hidden: true },
                ]}
              />
            </ValidationFormGroup>
            <ValidationFormGroup
              for="reportType"
              helpText="The type this report should be sent as, e.g. CSV"
            >
              <label htmlFor="reportType">Report Type</label>
              <Input
                type="select"
                id="reportType"
                name="reportType"
                defaultValue={config ? config.reportType : 'csv'}
                options={[
                  { value: 'csv', label: 'CSV' },
                  { value: 'json', label: 'JSON' },
                ]}
              />
            </ValidationFormGroup>
          </div>
          <div className="col col-6">
            <ValidationFormGroup
              for="deliveryMethod"
              helpText="The method in which the data should be sent"
            >
              <label htmlFor="deliveryMethod">Delivery Method</label>
              <Input
                type="select"
                id="deliveryMethod"
                name="deliveryMethod"
                defaultValue={config ? config.deliveryMethod : 'email'}
                options={[
                  { value: 'email', label: 'email' },
                  { value: 'sftp', label: 'sftp' },
                ]}
                onChange={e => this.setState({ deliveryMethod: e.target.value })}
              />
            </ValidationFormGroup>
            <ValidationFormGroup
              for="frequency"
              helpText="The frequency interval (daily, weekly, or monthly) that the report should be sent"
            >
              <label htmlFor="frequency">Frequency</label>
              <Input
                type="select"
                id="frequency"
                name="frequency"
                defaultValue={frequency}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
                onChange={e => this.setState({ frequency: e.target.value })}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <ValidationFormGroup
              for="dayOfMonth"
              helpText="The day of the month to send the report. This field is required and only valid when the frequency is monthly"
              invalid={frequency === 'monthly' && invalidFields.dayOfMonth}
            >
              <label htmlFor="dayOfMonth">Day of Month</label>
              <Input
                type="number"
                max={MONTHLY_MAX}
                min={MONTHLY_MIN}
                disabled={!(frequency === 'monthly')}
                id="dayOfMonth"
                name="dayOfMonth"
                defaultValue={config ? config.dayOfMonth : 1}
                onBlur={e => this.handleBlur(e)}
              />
            </ValidationFormGroup>
          </div>
          <div className="col">
            <ValidationFormGroup
              for="dayOfWeek"
              helpText="The day of the week to send the report. This field is required and only valid when the frequency is weekly"
            >
              <label htmlFor="dayOfWeek">Day of Week</label>
              <Input
                type="select"
                id="dayOfWeek"
                name="dayOfWeek"
                disabled={!(frequency === 'weekly')}
                options={[
                  { value: 0, label: 'Monday' },
                  { value: 1, label: 'Tuesday' },
                  { value: 2, label: 'Wednesday' },
                  { value: 3, label: 'Thursday' },
                  { value: 4, label: 'Friday' },
                  { value: 5, label: 'Saturday' },
                  { value: 6, label: 'Sunday' },
                ]}
                defaultValue={config ? config.dayOfWeek : undefined}
              />
            </ValidationFormGroup>
          </div>
          <div className="col">
            <ValidationFormGroup
              for="hourOfDay"
              helpText="The hour of the day to send the report, in Eastern Standard Time (EST). This is required for all frequency settings"
              invalid={invalidFields.hourOfDay}
              invalidMessage="Required for all frequency types"
            >
              <label htmlFor="hourOfDay">Hour of Day</label>
              <Input
                type="number"
                id="hourOfDay"
                name="hourOfDay"
                defaultValue={config ? config.hourOfDay : undefined}
                onBlur={e => this.handleBlur(e)}
              />
            </ValidationFormGroup>
          </div>
        </div>
        <ValidationFormGroup
          for="pgpEncyptionKey"
          helpText="The key for encyption, if PGP encrypted file is required"
        >
          <label htmlFor="pgpEncryptionKey">PGP Encryption Key</label>
          <Input
            type="textarea"
            id="pgpEncryptionKey"
            name="pgpEncryptionKey"
            defaultValue={config ? config.pgpEncryptionKey : undefined}
          />
        </ValidationFormGroup>
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
          <ValidationFormGroup
            for="enterpriseCustomerCatalogs"
            helpText="The catalogs that should be included in the report. No selection means all catalogs will be included."
          >
            <label htmlFor="enterpriseCustomerCatalogs">Enterprise Customer Catalogs</label>
            <Input
              type="select"
              id="enterpriseCustomerCatalogs"
              name="enterpriseCustomerCatalogUuids"
              multiple
              defaultValue={selectedCatalogs}
              options={
                availableCatalogs.map(item => ({
                  value: item.uuid,
                  label: `Catalog "${item.title}" with UUID "${item.uuid}"`,
                }))
              }
            />
          </ValidationFormGroup>
        </div>
        <div className="row justify-content-between align-items-center form-group">
          <ValidationFormGroup
            for="submitButton"
            invalidMessage="There was an error submitting, please try again."
            invalid={submitState === SUBMIT_STATES.ERROR}
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
          </ValidationFormGroup>
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
  createConfig: PropTypes.func.isRequired,
  updateConfig: PropTypes.func,
  deleteConfig: PropTypes.func,
};

export default ReportingConfigForm;
