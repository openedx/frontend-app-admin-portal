import React, { useContext } from 'react';
import { Col, Row } from '@edx/paragon';
import PropTypes from 'prop-types';

import { features } from '../../../config';
import ContactCustomerSupportButton from '../../ContactCustomerSupportButton';
import SettingsAccessLinkManagement from './SettingsAccessLinkManagement';
import SettingsAccessSSOManagement from './SettingsAccessSSOManagement';
import SettingsAccessSubsidyRequestManagement from './SettingsAccessSubsidyRequestManagement';
import { SubsidyRequestConfigurationContext } from '../../subsidy-request-configuration';

const SettingsAccessTab = ({
  enterpriseId,
  enableBrowseAndRequest,
  enableIntegratedCustomerLearnerPortalSearch,
  enableLearnerPortal,
  enableUniversalLink,
  identityProvider,
  updatePortalConfiguration,
}) => {
  const {
    subsidyRequestConfiguration,
    updateSubsidyRequestConfiguration,
  } = useContext(SubsidyRequestConfigurationContext);

  const isEligibleForBrowseAndRequest = features.FEATURE_BROWSE_AND_REQUEST
   && enableBrowseAndRequest && !!subsidyRequestConfiguration?.subsidyType;

  const isBrowseAndRequestDisabled = !(enableUniversalLink || (
    identityProvider && enableIntegratedCustomerLearnerPortalSearch
  ));

  const isUniversalLinkEnabled = features.SETTINGS_UNIVERSAL_LINK && enableLearnerPortal;

  return (
    <div className="settings-access-tab mt-4">
      <Row>
        <Col>
          <h2>Enable browsing on-demand</h2>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <p>
            Allow learners without a subsidy to browse the catalog and request enrollment to courses.
            Browsing on demand will expire at the end of your latest subscription.
          </p>
        </Col>
        <Col md="auto">
          <ContactCustomerSupportButton variant="outline-primary">
            Contact support
          </ContactCustomerSupportButton>
        </Col>
      </Row>

      <h3>Select access channel</h3>
      <p>
        Channels determine how learners access the catalog(s).
        You can select one or both and change your selection at any time.
      </p>

      {isUniversalLinkEnabled && (
        <div className="mb-4">
          <SettingsAccessLinkManagement />
        </div>
      )}

      {identityProvider && (
        <SettingsAccessSSOManagement
          enterpriseId={enterpriseId}
          enableIntegratedCustomerLearnerPortalSearch={enableIntegratedCustomerLearnerPortalSearch}
          identityProvider={identityProvider}
          updatePortalConfiguration={updatePortalConfiguration}
        />
      )}

      {isEligibleForBrowseAndRequest && (
        <div className="mt-5">
          <h3>Manage course requests</h3>
          <p>
            Allow learners to request subsidy to courses. You will see the requests under subsidy tab.
            Disabling this feature will not affect learners&apos; browsing capability.
          </p>
          <SettingsAccessSubsidyRequestManagement
            subsidyRequestConfiguration={subsidyRequestConfiguration}
            updateSubsidyRequestConfiguration={updateSubsidyRequestConfiguration}
            disabled={isBrowseAndRequestDisabled}
          />
        </div>
      )}
    </div>
  );
};

SettingsAccessTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enableBrowseAndRequest: PropTypes.bool.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
  enableIntegratedCustomerLearnerPortalSearch: PropTypes.bool.isRequired,
  enableUniversalLink: PropTypes.bool.isRequired,
  identityProvider: PropTypes.string,
  updatePortalConfiguration: PropTypes.func.isRequired,
};

SettingsAccessTab.defaultProps = {
  identityProvider: undefined,
};

export default SettingsAccessTab;
