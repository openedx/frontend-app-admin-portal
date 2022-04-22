import React from 'react';
import { Alert, Form, Hyperlink } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { HELP_CENTER_SAML_LINK, INVALID_LENGTH, INVALID_NAME } from '../../data/constants';

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
          <Form.Control
            type="text"
            isInvalid={!nameValid}
            onChange={(e) => {
              validateField('name', e.target.value);
            }}
            floatingLabel="SSO Configuration Name"
            defaultValue={(connectError ? errorData.displayName : data.displayName)}
          />
          <Form.Text>Create a name for your configuration for easy navigation. Leave blank for default.</Form.Text>
          {!nameValid && (
            <Form.Control.Feedback type="invalid">
              {INVALID_NAME}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group>
          <Form.Control
            type="text"
            isInvalid={!lengthValid}
            onChange={(e) => {
              validateField('seconds', e.target.value);
            }}
            floatingLabel="Maximum Session Length (seconds)"
            defaultValue={(connectError ? errorData.maxSessionLength : data.maxSessionLength)}
          />
          <Form.Text>
            Setting this option will limit user&apos;s session length to the set value.
            If set to 0 (zero), the session will expire upon the user closing their browser.
            If left blank, the Django platform session default length will be used.
          </Form.Text>
          {!lengthValid && (
            <Form.Control.Feedback type="invalid">
              {INVALID_LENGTH}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group>
          <Form.Control
            type="text"
            onChange={(e) => {
              configData.set('attr_user_permanent_id', e.target.value);
              setConfigValues(configData);
            }}
            maxLength={128}
            floatingLabel="User ID Attribute"
            defaultValue={(connectError ? errorData.userId : data.userId)}
          />
          <Form.Text>
            URN of the SAML attribute that we can use as a unique, persistent user ID. Leave blank for default.
          </Form.Text>
        </Form.Group>
        <Form.Group>
          <Form.Control
            type="text"
            onChange={(e) => {
              configData.set('attr_full_name', e.target.value);
              setConfigValues(configData);
            }}
            maxLength={255}
            floatingLabel="Full Name Attribute"
            defaultValue={(connectError ? errorData.fullName : data.fullName)}
          />
          <Form.Text>
            URN of SAML attribute containing the user&apos;s full name. Leave blank for default.
          </Form.Text>
        </Form.Group>
        <Form.Group>
          <Form.Control
            type="text"
            onChange={(e) => {
              configData.set('attr_first_name', e.target.value);
              setConfigValues(configData);
            }}
            maxLength={128}
            floatingLabel="First Name Attribute"
            defaultValue={(connectError ? errorData.firstName : data.firstName)}
          />
          <Form.Text>
            URN of SAML attribute containing the user&apos;s first name. Leave blank for default.
          </Form.Text>
        </Form.Group>
        <Form.Group>
          <Form.Control
            type="text"
            onChange={(e) => {
              configData.set('attr_last_name', e.target.value);
              setConfigValues(configData);
            }}
            maxLength={128}
            floatingLabel="Last Name Attribute"
            defaultValue={(connectError ? errorData.lastName : data.lastName)}
          />
          <Form.Text>
            URN of SAML attribute containing the user&apos;s last name. Leave blank for default.
          </Form.Text>
        </Form.Group>

        <Form.Group>
          <Form.Control
            type="text"
            onChange={(e) => {
              configData.set('attr_email', e.target.value);
              setConfigValues(configData);
            }}
            maxLength={128}
            floatingLabel="Email Address Attribute"
            defaultValue={(connectError ? errorData.emailAddress : data.emailAddress)}
          />
          <Form.Text>
            URN of SAML attribute containing the user&apos;s email address[es]. Leave blank for default.
          </Form.Text>
        </Form.Group>

        <Form.Group>
          <Form.Control
            type="text"
            readOnly
            floatingLabel="SAML Configuration"
            defaultValue={(connectError ? errorData.samlConfig : data.samlConfig)}
          />
          <Form.Text>
            We use the default SAML certificate for all configurations.
          </Form.Text>
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
