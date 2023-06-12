import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  DataTable,
  Alert,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { useLinkManagement } from '../data/hooks';
import SettingsAccessTabSection from './SettingsAccessTabSection';
import SettingsAccessGenerateLinkButton from './SettingsAccessGenerateLinkButton';
import StatusTableCell from './StatusTableCell';
import DateCreatedTableCell from './DateCreatedTableCell';
import LinkTableCell from './LinkTableCell';
import UsageTableCell from './UsageTableCell';
import ActionsTableCell from './ActionsTableCell';
import DisableLinkManagementAlertModal from './DisableLinkManagementAlertModal';
import { updatePortalConfigurationEvent } from '../../../data/actions/portalConfiguration';
import LmsApiService from '../../../data/services/LmsApiService';
import { SETTINGS_ACCESS_EVENTS } from '../../../eventTracking';
import { MAX_UNIVERSAL_LINKS } from '../data/constants';

const SettingsAccessLinkManagement = ({
  enterpriseUUID,
  isUniversalLinkEnabled,
  updatePortalConfiguration,
}) => {
  const {
    links,
    loadingLinks,
    refreshLinks,
  } = useLinkManagement(enterpriseUUID);

  const [isLinkManagementAlertModalOpen, setIsLinkManagementAlertModalOpen] = useState(false);
  const [isLoadingLinkManagementEnabledChange, setIsLoadingLinkManagementEnabledChange] = useState(false);
  const [hasLinkManagementEnabledChangeError, setHasLinkManagementEnabledChangeError] = useState(false);

  const toggleUniversalLink = async (newEnableUniversalLink) => {
    setIsLoadingLinkManagementEnabledChange(true);
    const args = {
      enterpriseUUID,
      enableUniversalLink: newEnableUniversalLink,
    };

    try {
      await LmsApiService.toggleEnterpriseCustomerUniversalLink(args);
      updatePortalConfiguration({ enableUniversalLink: newEnableUniversalLink });
      setIsLinkManagementAlertModalOpen(false);
      setHasLinkManagementEnabledChangeError(false);
      refreshLinks();
    } catch (error) {
      logError(error);
      setHasLinkManagementEnabledChangeError(true);
    } finally {
      sendEnterpriseTrackEvent(
        enterpriseUUID,
        SETTINGS_ACCESS_EVENTS.UNIVERSAL_LINK_TOGGLE,
        { toggle_to: newEnableUniversalLink },
      );
      setIsLoadingLinkManagementEnabledChange(false);
    }
  };

  const handleLinkManagementCollapsibleToggled = (isOpen) => {
    if (isOpen) {
      refreshLinks();
    }
  };

  const handleDeactivatedLink = () => {
    refreshLinks();
  };

  const handleGenerateLinkSuccess = () => {
    refreshLinks();
  };

  const handleLinkManagementFormSwitchChanged = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      toggleUniversalLink(isChecked);
    } else {
      setIsLinkManagementAlertModalOpen(true);
    }
  };

  return (
    <>
      {hasLinkManagementEnabledChangeError && !isLinkManagementAlertModalOpen && (
        <Alert icon={Info} variant="danger" dismissible>
          <Alert.Heading>Something went wrong</Alert.Heading>
          There was an issue with your request, please try again.
        </Alert>
      )}
      <SettingsAccessTabSection
        title="Access via Link"
        checked={isUniversalLinkEnabled}
        onFormSwitchChange={handleLinkManagementFormSwitchChanged}
        onCollapsibleToggle={handleLinkManagementCollapsibleToggled}
        loading={isLoadingLinkManagementEnabledChange}
        disabled={isLoadingLinkManagementEnabledChange}
      >
        <p>Generate a link to share with your learners (up to a maximum of {MAX_UNIVERSAL_LINKS} links).</p>
        {links.length >= MAX_UNIVERSAL_LINKS && (
          <Alert icon={Info} variant="danger">
            You generated the maximum of {MAX_UNIVERSAL_LINKS} links. No additional links may be generated.
          </Alert>
        )}
        <DataTable
          data={links}
          itemCount={links.length}
          isLoading={loadingLinks}
          tableActions={[
            <SettingsAccessGenerateLinkButton
              enterpriseUUID={enterpriseUUID}
              onSuccess={handleGenerateLinkSuccess}
              linksCount={links.length}
              disabled={!isUniversalLinkEnabled || loadingLinks}
            />,
          ]}
          columns={[
            {
              Header: 'Link',
              accessor: 'link',
              Cell: LinkTableCell,
            },
            {
              Header: 'Status',
              accessor: 'isValid',
              Cell: StatusTableCell,
            },
            {
              Header: 'Date created',
              accessor: 'created',
              Cell: DateCreatedTableCell,
            },
            {
              Header: 'Usage',
              accessor: 'usageCount',
              Cell: UsageTableCell,
            },
          ]}
          additionalColumns={[
            {
              id: 'action',
              Header: '',
              // eslint-disable-next-line react/no-unstable-nested-components
              Cell: (props) => (
                <ActionsTableCell
                  {...props}
                  enterpriseUUID={enterpriseUUID}
                  onDeactivateLink={handleDeactivatedLink}
                />
              ),
            },
          ]}
          disableElevation
        >
          <DataTable.TableControlBar />
          <DataTable.Table />
          {!loadingLinks && <DataTable.EmptyTable content="No links found" />}
        </DataTable>
      </SettingsAccessTabSection>
      <DisableLinkManagementAlertModal
        isOpen={isLinkManagementAlertModalOpen}
        onClose={() => { setIsLinkManagementAlertModalOpen(false); }}
        onDisable={() => (toggleUniversalLink(false))}
        isLoading={isLoadingLinkManagementEnabledChange}
        error={hasLinkManagementEnabledChangeError}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  isUniversalLinkEnabled: state.portalConfiguration.enableUniversalLink,
});

const mapDispatchToProps = dispatch => ({
  updatePortalConfiguration: data => dispatch(updatePortalConfigurationEvent(data)),
});

SettingsAccessLinkManagement.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  isUniversalLinkEnabled: PropTypes.bool.isRequired,
  updatePortalConfiguration: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsAccessLinkManagement);
