import React from 'react';
import { Alert, Form, Hyperlink } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { HELP_CENTER_SAML_LINK, INVALID_LENGTH, INVALID_NAME } from '../../data/constants';

const SSOFormControl = ({
  label, floatingLabel, defaultValue, onChange, readOnly,
  valid, invalidMessage, type,
}) => {
  const labelNoSpaces = label.replace(/ /g, '');
  return (
    <>
      <Form.Control
        readOnly={readOnly}
        className="mt-4 mb-1"
        type={type}
        onChange={onChange}
        floatingLabel={floatingLabel || label}
        defaultValue={defaultValue}
        aria-labelledby={labelNoSpaces}
      />
      <Form.Label id={`sso-field-${labelNoSpaces}`} className="mb-2">
        {label}
      </Form.Label>
      {!valid && (
        <Form.Control.Feedback type="invalid">
            {invalidMessage}
        </Form.Control.Feedback>
      )}
    </>
  );
};

SSOFormControl.defaultProps = {
  floatingLabel: '',
  readOnly: false,
  defaultValue: undefined,
  onChange: () => {},
  type: 'text',
  valid: true,
  invalidMessage: null,
};

SSOFormControl.propTypes = {
  label: PropTypes.string.isRequired,
  floatingLabel: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  valid: PropTypes.bool,
  invalidMessage: PropTypes.string,
  type: PropTypes.string,
};

const SSOConfigConfigureStep = ({ setConfigValues, connectError }) => {
  const configData = new FormData();
  const [nameValid, setNameValid] = React.useState(true);
  const [lengthValid, setLengthValid] = React.useState(true);

  const validateField = (field, input) => {
    switch (field) {
      case 'seconds':
        configData.set('max_session_length', input);
        setLengthValid(input <= 1210000);
        break;
      case 'name':
        configData.set('display_name', input);
        setNameValid(input?.length <= 20);
        break;
      default:
        break;
    }
    setConfigValues(configData);
  };

  const data = {
    displayName: '',
    userId: '',
    fullName: '',
    firstName: '',
    lastName: '',
    maxSessionLength: undefined,
    emailAddress: '',
    samlConfig: '',
  };

  // these are the suggested values we've come back to this step after an error
  // https://edx.readthedocs.io/projects/edx-installing-configuring-and-running/en/latest/configuration/tpa/tpa_integrate_open/tpa_SAML_IdP.html#configure-the-saml-identity-provider
  const errorData = {
    displayName: '',
    userId: 'userid',
    fullName: 'commonName',
    firstName: 'givenName',
    lastName: 'surname',
    maxSessionLength: undefined,
    emailAddress: 'mail',
    samlConfig: '',
  };

  return (
    <>
      <p>
        Next, enter additional information to customize SAML attributes if
        needed. We, by default, expect attributes as documented at the{' '}
        <Hyperlink destination={HELP_CENTER_SAML_LINK} target="_blank">
          Help Center
        </Hyperlink>{' '}
        article
      </p>
      {connectError && (
        <Alert
          variant="danger"
          actions={[
            <Hyperlink
              target="_blank"
              className={classNames('btn', 'btn-primary')}
              destination={HELP_CENTER_SAML_LINK}
            >
              Contact Support
            </Hyperlink>,
          ]}
          icon={Info}
        >
          <Alert.Heading>Connection Failed</Alert.Heading>
          <p>
            We weren&apos;t able to establish a connection due to improperly
            configured fields. We&apos;ve pre-populated the form for you. You can
            accept our suggestions, make your own changes and try connecting
            again, or contact support.
          </p>
        </Alert>
      )}
      <div className="py-4">
        <Form.Group>
          <SSOFormControl
            label="Create a name for your configuration for easy navigation. Leave blank for default."
            floatingLabel="SSO Configuration Name"
            defaultValue={(connectError ? errorData.displayName : data.displayName)}
            onChange={(e) => {
              validateField('name', e.target.value);
            }}
            valid={nameValid}
            invalidMessage={INVALID_NAME}
          />
          <SSOFormControl
            label={`Setting this option will limit user's session length to the set value.
                 If set to 0 (zero), the session will expire upon the user closing their browser.
                 If left blank, the Django platform session default length will be used.
          `}
            floatingLabel="Maximum Session Length (seconds)"
            defaultValue={(connectError ? errorData.maxSessionLength : data.maxSessionLength)}
            onChange={(e) => {
              validateField('seconds', e.target.value);
            }}
            valid={lengthValid}
            invalidMessage={INVALID_LENGTH}
          />
          <SSOFormControl
            label="URN of the SAML attribute that we can use as a unique, persistent user ID. Leave blank for default."
            floatingLabel="User ID Attribute"
            maxLength={128}
            defaultValue={(connectError ? errorData.userId : data.userId)}
            onChange={(e) => {
              configData.set('attr_user_permanent_id', e.target.value);
              setConfigValues(configData);
            }}
          />
          <SSOFormControl
            label="URN of SAML attribute containing the user's full name. Leave blank for default."
            floatingLabel="Full Name Attribute"
            maxLength={255}
            defaultValue={(connectError ? errorData.fullName : data.fullName)}
            onChange={(e) => {
              configData.set('attr_full_name', e.target.value);
              setConfigValues(configData);
            }}
          />
          <SSOFormControl
            label="URN of SAML attribute containing the user's first name. Leave blank for default."
            floatingLabel="First Name Attribute"
            maxLength={128}
            defaultValue={(connectError ? errorData.firstName : data.firstName)}
            onChange={(e) => {
              configData.set('attr_first_name', e.target.value);
              setConfigValues(configData);
            }}
          />
          <SSOFormControl
            label="URN of SAML attribute containing the user's last name. Leave blank for default."
            floatingLabel="Last Name Attribute"
            maxLength={128}
            defaultValue={(connectError ? errorData.lastName : data.lastName)}
            onChange={(e) => {
              configData.set('attr_last_name', e.target.value);
              setConfigValues(configData);
            }}
          />
          <SSOFormControl
            label="URN of SAML attribute containing the user's email address[es]. Leave blank for default."
            floatingLabel="Email Address Attribute"
            maxLength={128}
            defaultValue={(connectError ? errorData.emailAddress : data.emailAddress)}
            onChange={(e) => {
              configData.set('attr_email', e.target.value);
              setConfigValues(configData);
            }}
          />
          <SSOFormControl
            label="We use the default SAML certificate for all configurations"
            floatingLabel="SAML configuration"
            defaultValue={(connectError ? errorData.samlConfig : data.samlConfig)}
            readOnly
          />
        </Form.Group>
      </div>
    </>
  );
};

SSOConfigConfigureStep.propTypes = {
  setConfigValues: PropTypes.func.isRequired,
  connectError: PropTypes.bool.isRequired,
};

export default SSOConfigConfigureStep;
