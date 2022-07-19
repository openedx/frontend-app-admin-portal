import React, { useEffect } from 'react';
import {
  Alert, Button, Form, Hyperlink, ModalDialog,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isURL from 'validator/lib/isURL';
import {
  HELP_CENTER_SAML_LINK,
  INVALID_LENGTH,
  INVALID_NAME,
  INVALID_API_ROOT_URL,
  INVALID_SAPSF_OAUTH_ROOT_URL,
  HELP_CENTER_SAP_IDP_LINK,
  INVALID_ODATA_API_TIMEOUT_INTERVAL,
} from '../../data/constants';

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
  isUsingSap,
  setIsUsingSap,
}) => {
  const [nameValid, setNameValid] = React.useState(true);
  const [odataApiRootUrlValid, setOdataApiRootUrlValid] = React.useState(true);
  const [sapsfOauthRootUrlValid, setSapsfOauthRootUrlValid] = React.useState(true);
  const [odataApiTimeoutIntervalValid, setODataApiTimeoutIntervalValid] = React.useState(true);
  const [lengthValid, setLengthValid] = React.useState(true);
  const [currentOtherSettings, setCurrentOtherSettings] = React.useState({});

  // Setting current other settings object from the existing config data object
  useEffect(() => {
    if (existingConfigData.identity_provider_type === 'sap_success_factors') { setIsUsingSap(true); }
    if (existingConfigData.other_settings) {
      const existingOtherSettings = JSON.parse(existingConfigData.other_settings);
      const newOtherSettings = { ...currentOtherSettings, ...existingOtherSettings };
      setCurrentOtherSettings(newOtherSettings);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingConfigData, setCurrentOtherSettings]);

  // Disabling/enabling the next button based on the "using SAP" check box value and required fields
  useEffect(() => {
    if (isUsingSap) {
      // If the user is using SAP we need all 7 additional SAP attributes
      if (Object.keys(currentOtherSettings).length === 7) {
        let buttonDisabled = false;
        Object.keys(currentOtherSettings).forEach(key => {
          // Sometimes the key will exist and the value will be empty
          if (currentOtherSettings[key].length === 0) { buttonDisabled = true; }
        });
        setConfigNextButtonDisabled(buttonDisabled);
      } else {
        setConfigNextButtonDisabled(true);
      }
    } else {
      setConfigNextButtonDisabled(false);
    }
  }, [isUsingSap, currentOtherSettings, setConfigNextButtonDisabled]);

  const addConfigVal = (key, value) => {
    setConfigValues((configValues) => ({
      ...configValues,
      [key]: value,
    }));
  };

  // "Using SAP" checkbox event onChange function
  const handleChange = (event) => {
    setIsUsingSap(event.target.checked);
  };

  // "Using SAP" checkbox onClick function
  const updateAdvanceSettings = (advancedKey, advancedValue) => {
    setFormUpdated(true);
    const newAdvSetting = {};
    newAdvSetting[advancedKey] = advancedValue;
    const advSettings = { ...currentOtherSettings, ...newAdvSetting };
    addConfigVal('other_settings', JSON.stringify(advSettings));
    setCurrentOtherSettings(advSettings);
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
      case 'odata_api_root_url':
        inputValid = (isURL(input));
        updateAdvanceSettings('odata_api_root_url', input);
        setOdataApiRootUrlValid(inputValid);
        setConfigNextButtonDisabled(!inputValid);
        break;
      case 'sapsf_oauth_root_url':
        inputValid = (isURL(input));
        updateAdvanceSettings('sapsf_oauth_root_url', input);
        setSapsfOauthRootUrlValid(inputValid);
        setConfigNextButtonDisabled(!inputValid);
        break;
      case 'odata_api_timeout_interval':
        inputValid = (!Number.isNaN(Number(input)) && Number(input) <= 30);
        updateAdvanceSettings('odata_api_timeout_interval', input);
        setODataApiTimeoutIntervalValid(inputValid);
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
        If necessary, enter any customized or unique SAML attributes as needed.
        <strong> If no custom action is required, we will use</strong>{' '}
        <Hyperlink destination={HELP_CENTER_SAML_LINK} target="_blank">
          these default attributes.
        </Hyperlink>{' '}
      </p>
      <p>
        <strong>Please note</strong> that if you are using SAP Success Factors as an identity provider
        <strong>you must check the box</strong> at the top of the form and fill out the appropriate
        custom SAP attributes.
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
        <Form.Group className="mb-5">
          <Form.Checkbox checked={isUsingSap} onChange={handleChange}>
            I am using SAP Success Factors as an Identity Provider
          </Form.Checkbox>
        </Form.Group>

        {!isUsingSap && (
        <>
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
        </>
        )}
        {isUsingSap && (
        <>
          <p className="mb-5 mt-n4">
            Find examples of these values in our {' '}
            <Hyperlink destination={HELP_CENTER_SAP_IDP_LINK} target="_blank">
              SAP Help Center Article.
            </Hyperlink>
          </p>
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
              onChange={(e) => {
                validateField('odata_api_root_url', e.target.value);
              }}
              floatingLabel="OData API Root URL"
              defaultValue={
                existingConfigData.other_settings ? JSON.parse(existingConfigData.other_settings).odata_api_root_url : ''
              }
            />
            <Form.Text>The BizX OData API service hostname, typically aligned with the IdP entity id.</Form.Text>
            {!odataApiRootUrlValid && (
              <Form.Control.Feedback type="invalid">
                {INVALID_API_ROOT_URL}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group>
            <Form.Control
              type="text"
              onChange={(e) => {
                updateAdvanceSettings('odata_company_id', e.target.value);
              }}
              floatingLabel="OData Company ID"
              defaultValue={
                existingConfigData.other_settings ? JSON.parse(existingConfigData.other_settings).odata_company_id : ''
              }
            />
            <Form.Text>The BizX company profile identifier for your tenant.</Form.Text>
          </Form.Group>

          <Form.Group>
            <Form.Control
              type="text"
              onChange={(e) => {
                updateAdvanceSettings('odata_client_id', e.target.value);
              }}
              floatingLabel="OData Client ID"
              defaultValue={
                existingConfigData.other_settings ? JSON.parse(existingConfigData.other_settings).odata_client_id : ''
              }
            />
            <Form.Text>The API Key value found in the OAuth2 Client Application profile.</Form.Text>
          </Form.Group>

          <Form.Group>
            <Form.Control
              type="text"
              onChange={(e) => {
                validateField('odata_api_timeout_interval', e.target.value);
              }}
              floatingLabel="OData API Timeout Interval"
              defaultValue={
                existingConfigData.other_settings ? JSON.parse(existingConfigData.other_settings).odata_api_timeout_interval : ''
              }
            />
            <Form.Text>
              Configurable value that represents the amount of time in seconds, no greater than 30, that the
              edX system will wait for a response before cancelling the request.
            </Form.Text>
            {!odataApiTimeoutIntervalValid && (
              <Form.Control.Feedback type="invalid">
                {INVALID_ODATA_API_TIMEOUT_INTERVAL}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group>
            <Form.Control
              type="text"
              onChange={(e) => {
                validateField('sapsf_oauth_root_url', e.target.value);
              }}
              floatingLabel="SAP SuccessFactors OAuth Root URL"
              defaultValue={
                existingConfigData.other_settings ? JSON.parse(existingConfigData.other_settings).sapsf_oauth_root_url : ''
              }
            />
            <Form.Text>
              The URL hostname is what you see upon initial login to the SuccessFactors BizX system,
              typically aligned with the IdP Entity ID.
            </Form.Text>
            {!sapsfOauthRootUrlValid && (
              <Form.Control.Feedback type="invalid">
                {INVALID_SAPSF_OAUTH_ROOT_URL}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group>
            <Form.Control
              type="text"
              onChange={(e) => {
                updateAdvanceSettings('sapsf_private_key', e.target.value);
              }}
              floatingLabel="SAP SuccessFactors Private Key"
              defaultValue={
                existingConfigData.other_settings ? JSON.parse(existingConfigData.other_settings).sapsf_private_key : ''
              }
            />
            <Form.Text>
              The Private Key value found in the PEM file generated from the OAuth2 Client Application Profile.
            </Form.Text>
          </Form.Group>

          <Form.Group>
            <Form.Control
              type="text"
              onChange={(e) => {
                updateAdvanceSettings('oauth_user_id', e.target.value);
              }}
              floatingLabel="OAuth User ID"
              defaultValue={
                existingConfigData.other_settings ? JSON.parse(existingConfigData.other_settings).oauth_user_id : ''
              }
            />
            <Form.Text>
              Username of the BizX administrator account that is configured for edX by the customer.
            </Form.Text>
          </Form.Group>
        </>
        )}
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
    other_settings: PropTypes.string,
    identity_provider_type: PropTypes.string,
  }),
  setRefreshBool: PropTypes.func.isRequired,
  refreshBool: PropTypes.bool.isRequired,
  setFormUpdated: PropTypes.func.isRequired,
  setConfigNextButtonDisabled: PropTypes.func.isRequired,
  isUsingSap: PropTypes.bool.isRequired,
  setIsUsingSap: PropTypes.func.isRequired,
};

export default SSOConfigConfigureStep;
