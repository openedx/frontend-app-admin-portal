import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, ActionRow, Button, Hyperlink, ModalDialog, Toast, Skeleton, useToggle,
} from '@edx/paragon';
import { Add, WarningFilled } from '@edx/paragon/icons';
import { HELP_CENTER_SAML_LINK } from '../data/constants';
import { useExistingSSOConfigs, useExistingProviderData } from './hooks';
import NoSSOCard from './NoSSOCard';
import SsoErrorPage from './SsoErrorPage';
import ExistingSSOConfigs from './ExistingSSOConfigs';
import NewExistingSSOConfigs from './NewExistingSSOConfigs';
import NewSSOConfigForm from './NewSSOConfigForm';
import { SSOConfigContext, SSOConfigContextProvider } from './SSOConfigContext';
import LmsApiService from '../../../data/services/LmsApiService';
import { features } from '../../../config';
import { isInProgressConfig } from './utils';

const SettingsSSOTab = ({ enterpriseId, setHasSSOConfig }) => {
  const {
    ssoState: { providerConfig, infoMessage, refreshBool },
    setInfoMessage,
    setRefreshBool,
  } = useContext(SSOConfigContext);
  const [existingConfigs, error, isLoading] = useExistingSSOConfigs(enterpriseId, refreshBool);
  const [existingProviderData, pdError, pdIsLoading] = useExistingProviderData(enterpriseId, refreshBool);
  const [showNewSSOForm, setShowNewSSOForm] = useState(false);
  const [showNoSSOCard, setShowNoSSOCard] = useState(false);
  const { AUTH0_SELF_SERVICE_INTEGRATION } = features;
  const [isOpen, open, close] = useToggle(false);
  const [pollingNetworkError, setPollingNetworkError] = useState(false);
  const [isStepperOpen, setIsStepperOpen] = useState(true);

  const newConfigurationButtonOnClick = async () => {
    Promise.all(existingConfigs.map(config => LmsApiService.updateEnterpriseSsoOrchestrationRecord(
      { active: false, is_removed: true },
      config.uuid,
    ))).then(() => {
      setRefreshBool(!refreshBool);
      close();
    });
  };

  useEffect(() => {
    if (AUTH0_SELF_SERVICE_INTEGRATION) {
      setHasSSOConfig(existingConfigs.some(config => config.validated_at));
    } else {
      setHasSSOConfig(existingConfigs.some(config => config.was_valid_at));
    }
    if (!existingConfigs || existingConfigs?.length < 1) {
      setShowNoSSOCard(true);
    } else {
      setShowNoSSOCard(false);
    }
  }, [AUTH0_SELF_SERVICE_INTEGRATION, existingConfigs, setHasSSOConfig]);

  if (AUTH0_SELF_SERVICE_INTEGRATION) {
    const newButtonVisible = existingConfigs?.length > 0 && (providerConfig === null);
    const newButtonDisabled = existingConfigs.some(isInProgressConfig);
    return (
      <div>
        <ModalDialog
          title="New SSO Configuration Dialog"
          isOpen={isOpen}
          onClose={close}
          size="md"
          hasCloseButton
          isFullscreenOnMobile
        >
          <ModalDialog.Header>
            <ModalDialog.Title>
              Create new SSO configuration?
            </ModalDialog.Title>
          </ModalDialog.Header>
          <ModalDialog.Body>
            <p>
              Only one SSO integration is supported at a time. <br />
              <br />
              To continue updating and editing your SSO integration, select &quot;Cancel&quot; and then
              &quot;Configure&quot; on the integration card. Creating a new SSO configuration will overwrite and delete
              your existing SSO configuration.
            </p>
          </ModalDialog.Body>
          <ModalDialog.Footer>
            <ActionRow>
              <ModalDialog.CloseButton variant="tertiary">
                Cancel
              </ModalDialog.CloseButton>
              <Button
                variant="primary"
                onClick={newConfigurationButtonOnClick}
              >
                Create new SSO
              </Button>
            </ActionRow>
          </ModalDialog.Footer>
        </ModalDialog>
        <div className="d-flex">
          <h2 className="py-2">Single Sign-On (SSO) Integrations</h2>
          <div className="mr-0 ml-auto flex-column d-flex">
            {newButtonVisible && (
              <Button
                className="btn btn-outline-primary mb-1"
                iconBefore={Add}
                onClick={open}
                disabled={newButtonDisabled}
              >
                New
              </Button>
            )}
            <Hyperlink
              destination={HELP_CENTER_SAML_LINK}
              className="btn btn-outline-primary my-2"
              target="_blank"
            >
              Help Center: Single Sign-On
            </Hyperlink>
          </div>
        </div>
        {(!isLoading || !pdIsLoading) && (
          <>
            {!error && (
              <div>
                {/* providerConfig represents the currently selected config to edit/create, if there are
                existing configs but no providerConfig then we can safely render the listings page */}
                {existingConfigs?.length > 0 && (providerConfig === null) && (
                  <NewExistingSSOConfigs
                    providerData={existingProviderData}
                    configs={existingConfigs}
                    refreshBool={refreshBool}
                    setRefreshBool={setRefreshBool}
                    setPollingNetworkError={setPollingNetworkError}
                    setIsStepperOpen={setIsStepperOpen}
                  />
                )}
                {/* Nothing found so guide user to creation/edit form */}
                {showNoSSOCard && (
                  <NoSSOCard setShowNoSSOCard={setShowNoSSOCard} setShowNewSSOForm={setShowNewSSOForm} />
                )}
                {/* Since we found a selected providerConfig we know we are in editing mode and can safely
                render the create/edit form */}
                {((existingConfigs?.length > 0 && providerConfig !== null) || showNewSSOForm) && (
                  <NewSSOConfigForm
                    setIsStepperOpen={setIsStepperOpen}
                    isStepperOpen={isStepperOpen}
                  />
                )}
                {pdError && (
                  <Alert variant="warning" icon={WarningFilled}>
                    An error occurred loading the SAML data: <p>{pdError?.message}</p>
                  </Alert>
                )}
                <Toast
                  onClose={() => setInfoMessage(null)}
                  show={infoMessage?.length > 0}
                >
                  {infoMessage}
                </Toast>
              </div>
            )}
            {(error || pollingNetworkError) && (
              <SsoErrorPage isOpen={error !== null} />
            )}
          </>
        )}
        {(isLoading || pdIsLoading) && <Skeleton count={5} height={10} />}
      </div>
    );
  }
  return (
    <div>
      <div className="d-flex">
        <h2 className="py-2">SAML Configuration</h2>
        <Hyperlink
          destination={HELP_CENTER_SAML_LINK}
          className="btn btn-outline-primary ml-auto my-2"
          target="_blank"
        >
          Help Center
        </Hyperlink>
      </div>
      {(!isLoading || !pdIsLoading) && (
        <div>
          {/* providerConfig represents the currently selected config to edit/create, if there are
          existing configs but no providerConfig then we can safely render the listings page */}
          {existingConfigs?.length > 0 && (providerConfig === null)
            && (
              <ExistingSSOConfigs
                providerData={existingProviderData}
                configs={existingConfigs}
                refreshBool={refreshBool}
                setRefreshBool={setRefreshBool}
              />
            )}
          {/* Nothing found so guide user to creation/edit form */}
          {showNoSSOCard && <NoSSOCard setShowNoSSOCard={setShowNoSSOCard} setShowNewSSOForm={setShowNewSSOForm} />}
          {/* Since we found a selected providerConfig we know we are in editing mode and can safely
          render the create/edit form */}
          {((existingConfigs?.length > 0 && providerConfig !== null) || showNewSSOForm) && (<NewSSOConfigForm />)}
          {error && (
            <Alert variant="warning" icon={WarningFilled}>
              An error occurred loading the SAML configs: <p>{error?.message}</p>
            </Alert>
          )}
          {pdError && (
            <Alert variant="warning" icon={WarningFilled}>
              An error occurred loading the SAML data: <p>{pdError?.message}</p>
            </Alert>
          )}
          {infoMessage && (
            <Toast
              onClose={() => setInfoMessage(null)}
              show={infoMessage.length > 0}
            >
              {infoMessage}
            </Toast>
          )}
        </div>
      )}
      {(isLoading || pdIsLoading) && <Skeleton count={5} height={10} />}
    </div>
  );
};

SettingsSSOTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  setHasSSOConfig: PropTypes.func.isRequired,
};

const WrappedSSOTab = ({ enterpriseId, setHasSSOConfig }) => (
  <SSOConfigContextProvider>
    <SettingsSSOTab enterpriseId={enterpriseId} setHasSSOConfig={setHasSSOConfig} />
  </SSOConfigContextProvider>
);

WrappedSSOTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  setHasSSOConfig: PropTypes.func.isRequired,
};

export default WrappedSSOTab;
