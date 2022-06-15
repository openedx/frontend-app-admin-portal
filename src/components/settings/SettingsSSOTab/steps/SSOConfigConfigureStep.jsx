import React from 'react';
import {
  Alert, Button, Form, Hyperlink, ModalDialog,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { HELP_CENTER_SAML_LINK, INVALID_LENGTH, INVALID_NAME } from '../../data/constants';

const SSOConfigConfigureStep = ({
  setConfigValues,
  connectError,
  showExitModal,
  saveOnQuit,
  setProviderConfig,
  closeExitModal,
  existingConfigData,
  setRefreshBool,
  refreshBool,
  setFormUpdated,
  setConfigNextButtonDisabled,
}) => {
  const [nameValid, setNameValid] = React.useState(true);
  const [lengthValid, setLengthValid] = React.useState(true);

  const addConfigVal = (key, value) => {
    setConfigValues((configValues) => ({
      ...configValues,
      [key]: value,
    }));
  };

  const validateField = (field, input) => {
    let inputValid;
    switch (field) {
      case 'seconds':
        inputValid = (input <= 1210000);
        addConfigVal('max_session_length', input);
        setLengthValid(inputValid);
        setConfigNextButtonDisabled(!inputValid);
        break;
      case 'name':
        inputValid = (input?.length <= 20);
        addConfigVal('display_name', input);
        setNameValid(inputValid);
        setConfigNextButtonDisabled(!inputValid);
        break;
      default:
        break;
    }
    setFormUpdated(true);
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
        article.
      </p>
      <ModalDialog
        onClose={closeExitModal}
        isOpen={showExitModal}
        title="Save on Exit Modal"
      >
        <ModalDialog.Header className="mt-2 mb-n2">
          <ModalDialog.Title>
            Do you want to save your work?
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body className="mb-3.5 mt-n1 overflow-hidden">
          <p>
            Your changes will be lost without saving.
          </p>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ModalDialog.CloseButton
            className="mr-1"
            variant="tertiary"
            onClick={() => {
              setRefreshBool(!refreshBool);
              setProviderConfig(null);
            }}
          >
            Exit without saving
          </ModalDialog.CloseButton>
          <Button
            variant="primary"
            onClick={() => {
              // This will set provider config on its own once the request to update the config
              // responses with a success
              saveOnQuit();
            }}
          >
            Save
          </Button>
        </ModalDialog.Footer>
      </ModalDialog>
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
            defaultValue={(connectError ? errorData.displayName : existingConfigData?.display_name)}
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
            defaultValue={(connectError ? errorData.maxSessionLength : existingConfigData?.max_session_length)}
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
              addConfigVal('attr_user_permanent_id', e.target.value);
              setFormUpdated(true);
            }}
            maxLength={128}
            floatingLabel="User ID Attribute"
            defaultValue={(connectError ? errorData.userId : existingConfigData?.attr_user_permanent_id)}
          />
          <Form.Text>
            URN of the SAML attribute that we can use as a unique, persistent user ID. Leave blank for default.
          </Form.Text>
        </Form.Group>
        <Form.Group>
          <Form.Control
            type="text"
            onChange={(e) => {
              addConfigVal('attr_full_name', e.target.value);
              setFormUpdated(true);
            }}
            maxLength={255}
            floatingLabel="Full Name Attribute"
            defaultValue={(connectError ? errorData.fullName : existingConfigData?.attr_full_name)}
          />
          <Form.Text>
            URN of SAML attribute containing the user&apos;s full name. Leave blank for default.
          </Form.Text>
        </Form.Group>
        <Form.Group>
          <Form.Control
            type="text"
            onChange={(e) => {
              addConfigVal('attr_first_name', e.target.value);
              setFormUpdated(true);
            }}
            maxLength={128}
            floatingLabel="First Name Attribute"
            defaultValue={(connectError ? errorData.firstName : existingConfigData?.attr_first_name)}
          />
          <Form.Text>
            URN of SAML attribute containing the user&apos;s first name. Leave blank for default.
          </Form.Text>
        </Form.Group>
        <Form.Group>
          <Form.Control
            type="text"
            onChange={(e) => {
              addConfigVal('attr_last_name', e.target.value);
              setFormUpdated(true);
            }}
            maxLength={128}
            floatingLabel="Last Name Attribute"
            defaultValue={(connectError ? errorData.lastName : existingConfigData?.attr_last_name)}
          />
          <Form.Text>
            URN of SAML attribute containing the user&apos;s last name. Leave blank for default.
          </Form.Text>
        </Form.Group>

        <Form.Group>
          <Form.Control
            type="text"
            onChange={(e) => {
              addConfigVal('attr_email', e.target.value);
              setFormUpdated(true);
            }}
            maxLength={128}
            floatingLabel="Email Address Attribute"
            defaultValue={(connectError ? errorData.emailAddress : existingConfigData?.attr_email)}
          />
          <Form.Text>
            URN of SAML attribute containing the user&apos;s email address[es]. Leave blank for default.
          </Form.Text>
        </Form.Group>
      </div>
    </>
  );
};

SSOConfigConfigureStep.defaultProps = {
  existingConfigData: {
    displayName: '',
    userId: '',
    fullName: '',
    firstName: '',
    lastName: '',
    max_session_length: undefined,
    emailAddress: '',
    saml_configuration: -1,
  },
};

SSOConfigConfigureStep.propTypes = {
  setConfigValues: PropTypes.func.isRequired,
  connectError: PropTypes.bool.isRequired,
  showExitModal: PropTypes.bool.isRequired,
  setProviderConfig: PropTypes.func.isRequired,
  saveOnQuit: PropTypes.func.isRequired,
  closeExitModal: PropTypes.func.isRequired,
  existingConfigData: PropTypes.shape({
    display_name: PropTypes.string,
    attr_user_permanent_id: PropTypes.string,
    attr_full_name: PropTypes.string,
    attr_first_name: PropTypes.string,
    attr_last_name: PropTypes.string,
    attr_email: PropTypes.string,
    saml_configuration: PropTypes.number,
    max_session_length: PropTypes.number,
  }),
  setRefreshBool: PropTypes.func.isRequired,
  refreshBool: PropTypes.bool.isRequired,
  setFormUpdated: PropTypes.func.isRequired,
  setConfigNextButtonDisabled: PropTypes.func.isRequired,
};

export default SSOConfigConfigureStep;
