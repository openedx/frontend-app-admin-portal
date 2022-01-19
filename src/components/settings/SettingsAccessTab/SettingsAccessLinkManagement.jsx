import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  DataTable,
  Alert,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import moment from 'moment';
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
import { SettingsContext } from '../SettingsContext';
import { SETTINGS_ACCESS_EVENTS } from '../../../eventTracking';

const SettingsAccessLinkManagement = ({
  enterpriseUUID,
  isUniversalLinkEnabled,
  dispatch,
}) => {
  const {
    links,
    loadingLinks,
    refreshLinks,
  } = useLinkManagement(enterpriseUUID);

  const {
    customerAgreement: { netDaysUntilExpiration },
  } = useContext(SettingsContext);

  const [isLinkManagementAlertModalOpen, setIsLinkManagementAlertModalOpen] = useState(false);
  const [isLoadingLinkManagementEnabledChange, setIsLoadingLinkManagementEnabledChange] = useState(false);
  const [hasLinkManagementEnabledChangeError, setHasLinkManagementEnabledChangeError] = useState(false);

  const toggleUniversalLink = async (newEnableUniversalLink) => {
    setIsLoadingLinkManagementEnabledChange(true);
    const args = {
      enterpriseUUID,
      enableUniversalLink: newEnableUniversalLink,
    };

    if (newEnableUniversalLink) {
      args.expirationDate = moment().add(netDaysUntilExpiration, 'days').startOf('day').format();
    }

    try {
      await LmsApiService.toggleEnterpriseCustomerUniversalLink(args);
      dispatch(updatePortalConfigurationEvent({ enableUniversalLink: newEnableUniversalLink }));
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
          There was an issue with your request, try again.
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
        <p>Generate a link to share with your learners.</p>
        <DataTable
          data={links}
          itemCount={links.length}
          isLoading={loadingLinks}
          tableActions={() => (
            <SettingsAccessGenerateLinkButton
              onSuccess={handleGenerateLinkSuccess}
              disabled={!isUniversalLinkEnabled}
            />
          )}
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
              Cell: props => (
                <ActionsTableCell
                  {...props}
                  enterpriseUUID={enterpriseUUID}
                  onDeactivateLink={handleDeactivatedLink}
                />
              ),
            },
          ]}
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
        isLoadingDisable={isLoadingLinkManagementEnabledChange}
        error={hasLinkManagementEnabledChangeError}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  isUniversalLinkEnabled: state.portalConfiguration.enableUniversalLink,
});

SettingsAccessLinkManagement.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  isUniversalLinkEnabled: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(SettingsAccessLinkManagement);
