import React, { useContext } from 'react';
import { Col, Row } from '@edx/paragon';
import PropTypes from 'prop-types';

import { features } from '../../../config';
import ContactCustomerSupportButton from '../../ContactCustomerSupportButton';
import { NoAvailableCodesBanner, NoAvailableLicensesBanner } from '../../subsidy-request-management-alerts';
import SettingsAccessLinkManagement from './SettingsAccessLinkManagement';
import SettingsAccessSSOManagement from './SettingsAccessSSOManagement';
import SettingsAccessSubsidyRequestManagement from './SettingsAccessSubsidyRequestManagement';
import SettingsAccessSubsidyTypeSelection from './SettingsAccessSubsidyTypeSelection';
import { SettingsContext } from '../SettingsContext';
import SettingsAccessConfiguredSubsidyType from './SettingsAccessConfiguredSubsidyType';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';

const SettingsAccessTab = ({
  enterpriseId,
  enableIntegratedCustomerLearnerPortalSearch,
  enableLearnerPortal,
  enableUniversalLink,
  identityProvider,
  updatePortalConfiguration,
}) => {
  const {
    subsidyRequestConfiguration,
    updateSubsidyRequestConfiguration,
  } = useContext(SubsidyRequestsContext);
  const {
    couponsData: { results: coupons },
    customerAgreement: { subscriptions },
    enterpriseSubsidyTypes,
  } = useContext(SettingsContext);

  const hasConfiguredSubsidyType = !!subsidyRequestConfiguration?.subsidyType;
  const isBrowseAndRequestEnabled = features.FEATURE_BROWSE_AND_REQUEST;

  const isLearnerPortalSearchEnabled = identityProvider && enableIntegratedCustomerLearnerPortalSearch;
  const hasActiveAccessChannel = enableUniversalLink || isLearnerPortalSearchEnabled;

  const isUniversalLinkEnabled = features.SETTINGS_UNIVERSAL_LINK && enableLearnerPortal;

  return (
    <div className="settings-access-tab mt-4">
      {subsidyRequestConfiguration?.subsidyType === SUPPORTED_SUBSIDY_TYPES.coupon
       && subsidyRequestConfiguration?.subsidyRequestsEnabled
        && <NoAvailableCodesBanner coupons={coupons} /> }
      {subsidyRequestConfiguration?.subsidyType === SUPPORTED_SUBSIDY_TYPES.license
       && subsidyRequestConfiguration?.subsidyRequestsEnabled
        && <NoAvailableLicensesBanner subscriptions={subscriptions} /> }
      <Row>
        <Col>
          <h2>Enable browsing on-demand</h2>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <p>
            Allow learners without a subsidy to browse the catalog and request enrollment to courses.
            Browsing on demand will expire at the end of your latest purchase.
          </p>
        </Col>
        <Col md="auto">
          <ContactCustomerSupportButton variant="outline-primary">
            Contact support
          </ContactCustomerSupportButton>
        </Col>
      </Row>

      {enterpriseSubsidyTypes.length > 1 && (
        <div className="mb-4">
          <h3>Subsidy type</h3>
          {hasConfiguredSubsidyType
            ? <SettingsAccessConfiguredSubsidyType subsidyType={subsidyRequestConfiguration.subsidyType} />
            : (
              <SettingsAccessSubsidyTypeSelection
                subsidyRequestConfiguration={subsidyRequestConfiguration}
                subsidyTypes={enterpriseSubsidyTypes}
                disabled={hasConfiguredSubsidyType}
                updateSubsidyRequestConfiguration={updateSubsidyRequestConfiguration}
              />
            )}
        </div>
      )}

      {hasConfiguredSubsidyType && (
        <>
          <div className="mb-5">
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
          </div>

          {isBrowseAndRequestEnabled && (
            <div>
              <div className="d-flex justify-content-between">
                <h3>Manage course requests</h3>
                <SettingsAccessSubsidyRequestManagement
                  subsidyRequestConfiguration={subsidyRequestConfiguration}
                  updateSubsidyRequestConfiguration={updateSubsidyRequestConfiguration}
                  disabled={!hasActiveAccessChannel}
                />
              </div>
              <p>
                Allow learners to request subsidy to courses. You will see the requests under subsidy tab.
                Disabling this feature will not affect learners&apos; browsing capability.
              </p>

            </div>
          )}
        </>
      )}
    </div>
  );
};

SettingsAccessTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
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
