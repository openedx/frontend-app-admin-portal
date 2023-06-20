import React, { useContext } from 'react';
import { Col, Row } from '@edx/paragon';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import ContactCustomerSupportButton from '../../ContactCustomerSupportButton';
import { NoAvailableCodesBanner, NoAvailableLicensesBanner } from '../../subsidy-request-management-alerts';
import SettingsAccessLinkManagement from './SettingsAccessLinkManagement';
import SettingsAccessSSOManagement from './SettingsAccessSSOManagement';
import SettingsAccessSubsidyRequestManagement from './SettingsAccessSubsidyRequestManagement';
import SettingsAccessSubsidyTypeSelection from './SettingsAccessSubsidyTypeSelection';
import SettingsAccessConfiguredSubsidyType from './SettingsAccessConfiguredSubsidyType';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';
import { getSubsidyTypeLabelAndRoute } from './data/utils';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';

const SettingsAccessTab = ({
  enterpriseId,
  enterpriseSlug,
  enableIntegratedCustomerLearnerPortalSearch,
  enableLearnerPortal,
  enableUniversalLink,
  identityProvider,
  updatePortalConfiguration,
}) => {
  const {
    subsidyRequestConfiguration,
    updateSubsidyRequestConfiguration,
    enterpriseSubsidyTypesForRequests,
  } = useContext(SubsidyRequestsContext);

  const {
    coupons,
    customerAgreement,
  } = useContext(EnterpriseSubsidiesContext);
  const subscriptions = customerAgreement?.subscriptions ?? [];

  const configuredRequestSubsidyType = subsidyRequestConfiguration?.subsidyType;
  const hasConfiguredSubsidyType = !!configuredRequestSubsidyType;

  const isLearnerPortalSearchEnabled = identityProvider && enableIntegratedCustomerLearnerPortalSearch;
  const hasActiveAccessChannel = enableUniversalLink || isLearnerPortalSearchEnabled;
  const isUniversalLinkEnabled = enableLearnerPortal;

  const isNoAvailableCodesBannerVisible = (
    configuredRequestSubsidyType === SUPPORTED_SUBSIDY_TYPES.coupon
    && subsidyRequestConfiguration?.subsidyRequestsEnabled
  );
  const isNoAvailableLicensesBannerVisible = (
    configuredRequestSubsidyType === SUPPORTED_SUBSIDY_TYPES.license
    && subsidyRequestConfiguration?.subsidyRequestsEnabled
  );

  const subsidyTypeLabelAndRoute = getSubsidyTypeLabelAndRoute(configuredRequestSubsidyType, enterpriseSlug);

  return (
    <div className="settings-access-tab mt-4">
      {isNoAvailableCodesBannerVisible && <NoAvailableCodesBanner coupons={coupons} />}
      {isNoAvailableLicensesBannerVisible && <NoAvailableLicensesBanner subscriptions={subscriptions} />}
      <Row>
        <Col>
          <h2>Enable browsing on-demand</h2>
        </Col>
      </Row>
      <Row className="mb-4 justify-content-between">
        <Col lg={8} xl={9}>
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
      {enterpriseSubsidyTypesForRequests.length > 1 && (
        <div className="mb-4">
          <h3>Subsidy type</h3>
          {hasConfiguredSubsidyType ? (
            <SettingsAccessConfiguredSubsidyType subsidyType={subsidyRequestConfiguration.subsidyType} />
          ) : (
            <SettingsAccessSubsidyTypeSelection
              subsidyRequestConfiguration={subsidyRequestConfiguration}
              subsidyTypes={enterpriseSubsidyTypesForRequests}
              disabled={hasConfiguredSubsidyType}
              updateSubsidyRequestConfiguration={updateSubsidyRequestConfiguration}
            />
          )}
        </div>
      )}
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
      {subsidyTypeLabelAndRoute && (
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
            Allow learners to request a {subsidyTypeLabelAndRoute.label} to access courses. You
            will see the requests under{' '}
            <Link to={subsidyTypeLabelAndRoute.route.path}>{subsidyTypeLabelAndRoute.route.label}</Link>.
            Disabling this feature will not affect learners&apos; ability to browse.
          </p>
        </div>
      )}
    </div>
  );
};

SettingsAccessTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
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
