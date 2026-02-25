import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { isEmpty, omit } from 'lodash-es';
import {
  Button, Form, Icon, Spinner, StatefulButton,
} from '@openedx/paragon';
import {
  Check, Close, Download, Error,
} from '@openedx/paragon/icons';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
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

const ReportingConfigForm = ({
  config,
  createConfig,
  deleteConfig,
  updateConfig,
  reportingConfigTypes,
  availableCatalogs,
  enterpriseCustomerUuid,
}) => {
  const [frequency, setFrequency] = useState(config?.frequency || 'monthly');
  const [deliveryMethod, setDeliveryMethod] = useState(config?.deliveryMethod || 'email');
  const [invalidFields, setInvalidFields] = useState({});
  const [APIErrors, setAPIErrors] = useState({});
  const [active, setActive] = useState(config?.active ?? false);
  const [enableCompression, setEnableCompression] = useState(config?.enableCompression ?? true);
  const [submitState, setSubmitState] = useState(SUBMIT_STATES.DEFAULT);
  const [includeDate, setIncludeDate] = useState(config?.includeDate ?? true);

  const intl = useIntl();
  /**
   * Validates this form. If the form is invalid, it will return the fields
   * that were invalid. Otherwise, it will return an empty object.
   * @param {FormData} formData
   * @param {[String]} requiredFields
   */
  const validateReportingForm = (configProps, formData, requiredFields) => {
    const currentInvalidFields = requiredFields
      .filter(field => !formData.get(field))
      .reduce((prevFields, currField) => ({ ...prevFields, [currField]: true }), {});

    // Password is conditionally required only when pgp key will not be present
    // and delivery method is email
    if (!formData.get('pgpEncryptionKey') && formData.get('deliveryMethod') === 'email') {
      if (!formData.get('encryptedPassword') && !configProps?.encryptedPassword) {
        currentInvalidFields.encryptedPassword = true;
      }
    }
    return currentInvalidFields;
  };

  /**
   * Handles the state change for when a form field validation onBlur is called. An
   * optional second param can be added to give a specific validation function,
   * otherwise it is just checked to see if it is empty.
   * @param {Event} e
   * @param {Func} validationFunction -> to see and example of this,
   * check the <EmailDeliveryMethodForm />
   */
  const handleBlur = (e, validationFunction) => {
    // One special case for email fields
    const field = e.target;
    const error = validationFunction ? validationFunction() : !field.value?.length;
    setInvalidFields((prevInvalidFields) => ({
      ...prevInvalidFields,
      [field.name]: error,
    }));
    // Remove the field that changed from APIErrors. It will b validated again on the next API request/
    setAPIErrors((prevAPIErrors) => ({
      ...omit(prevAPIErrors, [field.name]),
    }));
  };

  const handleAPIErrorResponse = (response) => {
    const responseData = response && camelCaseObject(response.data);
    const invalidFieldsResponse = {};

    if (!isEmpty(responseData)) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(responseData)) {
        [invalidFieldsResponse[key]] = value;
      }

      setAPIErrors((prevAPIErrors) => ({
        ...prevAPIErrors,
        ...invalidFieldsResponse,
      }));
    }
  };

  /**
   * attempt to submit the form data and show any error states or invalid fields.
   * @param {FormData} formData
   * @param {*} configProps
   */
  const handleSubmit = async (formData, configProps) => {
    await setSubmitState(SUBMIT_STATES.PENDING);
    let requiredFields = [];
    formData.append('active', active);
    formData.append('enableCompression', enableCompression);
    formData.append('includeDate', includeDate);
    if (formData.get('deliveryMethod') === 'email') {
      requiredFields = configProps ? [...REQUIRED_EMAIL_FIELDS] : [...REQUIRED_NEW_EMAIL_FIELDS];
      // transform email field to match what the api is looking for
      const emails = formData.get('emailRaw').split('\n');
      emails.forEach(email => formData.append('email[]', email));
    } else {
      // Password field needs to be required only when creating a new configuration
      requiredFields = configProps ? [...REQUIRED_SFTP_FIELDS] : [...REQUIRED_NEW_SFTP_FEILDS];
    }
    // validate the form
    const currentInvalidFields = validateReportingForm(configProps, formData, requiredFields);
    // if there are invalid fields, reflect that in the UI
    if (!isEmpty(currentInvalidFields)) {
      setInvalidFields((prevInvalidFields) => ({
        ...prevInvalidFields,
        ...currentInvalidFields,
      }));
      setSubmitState(SUBMIT_STATES.DEFAULT);
      return;
    }

    // append the enterprise customer data if editing an already created reporting form
    if (configProps) {
      formData.append('uuid', configProps.uuid);
      formData.append('enterprise_customer_id', configProps.enterpriseCustomer.uuid);
      const err = await updateConfig(formData, configProps.uuid);
      if (err) {
        setSubmitState(SUBMIT_STATES.ERROR);
        handleAPIErrorResponse(err.response);
        return;
      }
    } else {
      // ...or create a new configuration
      formData.append('enterprise_customer_id', enterpriseCustomerUuid);
      const err = await createConfig(formData);
      if (err) {
        setSubmitState(SUBMIT_STATES.ERROR);
        handleAPIErrorResponse(err.response);
        return;
      }
    }
    setSubmitState(SUBMIT_STATES.COMPLETE);
  };

  const renderSelect = data => {
    const options = data.options?.map(userType => (
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
        data-testid="reporting-config-form"
        controlId={data.key}
        isInvalid={invalidFields[data.key]}
      >
        <Form.Label>{data.label}</Form.Label>
        <Form.Control
          as="select"
          data-testid={data.dataTestId}
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

  const renderNumberField = data => {
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
          onBlur={e => handleBlur(e)}
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
        handleSubmit(formData, config);
      }}
      onChange={() => setSubmitState(SUBMIT_STATES.DEFAULT)}
    >
      <div className="col">
        <Form.Group>
          <Form.Checkbox
            className="ml-3"
            checked={active}
            onChange={() => setActive(prevState => !prevState)}
          >
            <FormattedMessage
              id="admin.portal.reporting.config.active"
              defaultMessage="Active"
              description="Checkbox label for whether the reporting configuration is active"
            />
          </Form.Checkbox>
        </Form.Group>
      </div>
      <div className="row">
        <div className="col col-6">
          {renderSelect({
            key: 'dataType',
            dataTestId: 'data-type-select',
            helpText: intl.formatMessage({
              id: 'admin.portal.reporting.config.data.type.help',
              defaultMessage: 'The type of data this report should contain. If this is an old report, you will not be able to change this field, and should create a new report',
              description: 'Help text for the data type field in the reporting configuration form',
            }),
            label: intl.formatMessage({
              id: 'admin.portal.reporting.config.dataType',
              defaultMessage: 'Data Type',
              description: 'Label for the data type field in the reporting configuration form',
            }),
            options: [...dataTypesOptions, ...selectedDataTypesOption],
            disabled: config && !dataTypesOptionsValues.includes(config.dataType),
          })}
          {renderSelect({
            key: 'reportType',
            helpText: intl.formatMessage({
              id: 'admin.portal.reporting.config.report.type.help',
              defaultMessage: 'The type this report should be sent as, e.g. CSV',
              description: 'Help text for the report type field in the reporting configuration form',
            }),
            label: intl.formatMessage({
              id: 'admin.portal.reporting.config.report.type',
              defaultMessage: 'Report Type',
              description: 'Label for the report type field in the reporting configuration form',
            }),
            options: reportingConfigTypes.reportType.map(item => ({ label: item[1], value: item[0] })),
          })}
        </div>
        <div className="col col-6">
          {renderSelect({
            key: 'deliveryMethod',
            dataTestId: 'delivery-method-select',
            helpText: intl.formatMessage({
              id: 'admin.portal.reporting.config.delivery.method.help',
              defaultMessage: 'The method in which the data should be sent',
              description: 'Help text for the delivery method field in the reporting configuration form',
            }),
            label: intl.formatMessage({
              id: 'admin.portal.reporting.config.delivery.method.field',
              defaultMessage: 'Delivery Method',
              description: 'Label for the delivery method field in the reporting configuration form',
            }),
            options: reportingConfigTypes.deliveryMethod.map(item => ({ label: item[1], value: item[0] })),
            onChange: event => setDeliveryMethod(event.target.value),
            isInvalid: !!APIErrors.deliveryMethod,
            invalidMessage: APIErrors.deliveryMethod,
          })}
          {renderSelect({
            key: 'frequency',
            dataTestId: 'frequency-select',
            helpText: intl.formatMessage({
              id: 'admin.portal.reporting.config.frequency.help',
              defaultMessage: 'The frequency interval (daily, weekly, or monthly) that the report should be sent',
              description: 'Help text for the frequency field in the reporting configuration form',
            }),
            label: intl.formatMessage({
              id: 'admin.portal.reporting.config.frequency.1',
              defaultMessage: 'Frequency',
              description: 'Label for the frequency field in the reporting configuration form',
            }),
            options: reportingConfigTypes.frequency.map(item => ({ label: item[1], value: item[0] })),
            defaultValue: frequency,
            onChange: event => setFrequency(event.target.value),
          })}
        </div>
      </div>
      <div className="row">
        <div className="col">
          {renderNumberField({
            key: 'dayOfMonth',
            helpText: intl.formatMessage({
              id: 'admin.portal.reporting.config.day.of.month.help',
              defaultMessage: 'The day of the month to send the report. This field is required and only valid when the frequency is monthly',
              description: 'Help text for the day of the month field in the reporting configuration form',
            }),
            isInvalid: frequency === 'monthly' && invalidFields.dayOfMonth,
            label: intl.formatMessage({
              id: 'admin.portal.reporting.config.day.of.month',
              defaultMessage: 'Day of Month',
              description: 'Label for the day of the month field in the reporting configuration form',
            }),
            max: MONTHLY_MAX,
            min: MONTHLY_MIN,
            disabled: !(frequency === 'monthly'),
            onBlur: event => handleBlur(event),
          })}
        </div>
        <div className="col">
          {renderSelect({
            key: 'dayOfWeek',
            helpText: intl.formatMessage({
              id: 'admin.portal.reporting.config.day.of.week.help',
              defaultMessage: 'The day of the week to send the report. This field is required and only valid when the frequency is weekly',
              description: 'Help text for the day of the week field in the reporting configuration form',
            }),
            label: intl.formatMessage({
              id: 'admin.portal.reporting.config.day.of.week',
              defaultMessage: 'Day of Week',
              description: 'Label for the day of the week field in the reporting configuration form',
            }),
            options: reportingConfigTypes.dayOfWeek.map(item => ({ label: item[1], value: item[0] })),
            disabled: !(frequency === 'weekly'),
          })}
        </div>
        <div className="col">
          {renderNumberField({
            key: 'hourOfDay',
            id: 'hourOfDay',
            helpText: intl.formatMessage({
              id: 'admin.portal.reporting.config.hour.of.day.help',
              defaultMessage: 'The hour of the day to send the report, in Eastern Standard Time (EST). This is required for all frequency settings',
              description: 'Help text for the hour of the day field in the reporting configuration form',
            }),
            invalidMessage: 'Required for all frequency types',
            isInvalid: invalidFields.hourOfDay,
            min: 0,
            label: intl.formatMessage({
              id: 'admin.portal.reporting.config.hour.of.day',
              defaultMessage: 'Hour of Day',
              description: 'Label for the hour of the day field in the reporting configuration form',
            }),
          })}
        </div>
      </div>
      <Form.Group
        isInvalid={!!APIErrors.pgpEncryptionKey}
      >
        <Form.Label>
          <FormattedMessage
            id="admin.portal.reporting.config.pgp.encryption.ke"
            defaultMessage="PGP Encryption Key"
            description="Label for the PGP Encryption Key field in the reporting configuration form"
          />
        </Form.Label>
        <Form.Control
          as="textarea"
          defaultValue={config ? config.pgpEncryptionKey : undefined}
          data-hj-suppress
          onBlur={e => handleBlur(e)}
        />
        <Form.Text>
          <FormattedMessage
            id="admin.portal.reporting.config.pgp.encryption.key.help"
            defaultMessage="The key for encryption, if PGP encrypted file is required"
            description="Help text for the PGP Encryption Key field in the reporting configuration form"
          />
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
        handleBlur={handleBlur}
      />
      )}
      {deliveryMethod === 'sftp' && (
      <SFTPDeliveryMethodForm
        config={config}
        invalidFields={invalidFields}
        handleBlur={handleBlur}
      />
      )}
      <Form.Group
        isInvalid={!!APIErrors.enableCompression}
      >
        <Form.Label>
          <FormattedMessage
            id="admin.portal.reporting.config.enable.compression"
            defaultMessage="Enable Compression"
            description="Label for the Enable Compression field in the reporting configuration form"
          />
        </Form.Label>
        <Form.Checkbox
          data-testid="compressionCheckbox"
          className="ml-3"
          checked={enableCompression}
          onChange={() => setEnableCompression(prevState => !prevState)}
        />
        <Form.Text>
          <FormattedMessage
            id="admin.portal.reporting.config.enable.compression.help"
            defaultMessage="Specifies whether report should be compressed. Without compression files will not be password protected or encrypted."
            description="Help text for the Enable Compression field in the reporting configuration form"
          />
        </Form.Text>
        {!!APIErrors.enableCompression && (
        <Form.Control.Feedback type="invalid">
          {APIErrors.enableCompression}
        </Form.Control.Feedback>
        )}
      </Form.Group>
      <Form.Group>
        <Form.Label>
          <FormattedMessage
            id="admin.portal.reporting.config.include.date"
            defaultMessage="Include Date"
            description="Label for the Include Date field in the reporting configuration form"
          />
        </Form.Label>
        <Form.Checkbox
          data-testid="includeDateCheckbox"
          className="ml-3"
          checked={includeDate}
          onChange={() => setIncludeDate(prevState => !prevState)}
        />
        <Form.Text>
          <FormattedMessage
            id="admin.portal.reporting.config.include.date.option.help"
            defaultMessage="Specifies whether the report's filename should include the date."
            description="Help text for the Include Date field in the reporting configuration form"
          />
        </Form.Text>
      </Form.Group>
      <Form.Group controlId="enterpriseCustomerCatalogs">
        <Form.Label>
          <FormattedMessage
            id="admin.portal.reporting.config.enterprise.customer.catalogs"
            defaultMessage="Enterprise Customer Catalogs"
            description="Label for the Enterprise Customer Catalogs field in the reporting configuration form"
          />
        </Form.Label>
        <Form.Control
          as="select"
          name="enterpriseCustomerCatalogUuids"
          multiple
          defaultValue={selectedCatalogs}
        >
          {availableCatalogs && (availableCatalogs.map((item) => (
            <option key={item.uuid} value={item.uuid}>Catalog {item.title} with UUID {item.uuid}</option>
          )))}
        </Form.Control>
        <Form.Text>
          <FormattedMessage
            id="admin.portal.reporting.config.enterprise.customer.catalogs.help"
            defaultMessage="The catalogs that should be included in the report. No selection means all catalogs will be included."
            description="Help text for the Enterprise Customer Catalogs field in the reporting configuration form"
          />
        </Form.Text>
      </Form.Group>
      <div className="row justify-content-between align-items-center form-group">
        <Form.Group
          className="mb-0"
          isInvalid={submitState === SUBMIT_STATES.ERROR}
        >
          <StatefulButton
            state={submitState}
            type="submit"
            id="submitButton"
            labels={{
              default: intl.formatMessage({
                id: 'admin.portal.reporting.config.submit',
                defaultMessage: 'Submit',
                description: 'Label for the button when use click to submit the reporting configuration form',
              }),
              pending: intl.formatMessage({
                id: 'admin.portal.reporting.config.saving',
                defaultMessage: 'Saving...',
                description: 'Label for the button when the form is being saved',
              }),
              complete: intl.formatMessage({
                id: 'admin.portal.reporting.config.complete',
                defaultMessage: 'Complete',
                description: 'Label for the button when the form is complete',
              }),
              error: intl.formatMessage({
                id: 'admin.portal.reporting.config.error',
                defaultMessage: 'Error',
                description: 'Label for the button when there is an error',
              }),
            }}
            icons={{
              default: <Icon src={Download} />,
              pending: <Spinner animation="border" variant="light" size="sm" />,
              complete: <Icon src={Check} />,
              error: <Icon src={Close} />,
            }}
            disabledStates={[SUBMIT_STATES.PENDING]}
            className="ml-3 col"
            variant="primary"
          />
          {submitState === SUBMIT_STATES.ERROR && (
          <Form.Control.Feedback type="invalid">
            <FormattedMessage
              id="admin.portal.reporting.config.error.submitting"
              defaultMessage="There was an error submitting, please try again."
              description="Error message when there is an error submitting the reporting configuration form"
            />
          </Form.Control.Feedback>
          )}
        </Form.Group>
        {config && (
        <Button
          data-testid="deleteConfigButton"
          className="btn-outline-danger mr-3"
          onClick={() => deleteConfig(config.uuid)}
        >
          <Icon src={Close} className="danger" />
          <FormattedMessage
            id="admin.portal.reporting.config.delete"
            defaultMessage="Delete"
            description="Label for the button to delete the reporting configuration form"
          />
        </Button>
        )}
      </div>
    </form>
  );
};
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
    includeDate: PropTypes.bool,
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
