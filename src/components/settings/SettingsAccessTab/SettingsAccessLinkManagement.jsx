import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  DataTable,
  Alert,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
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
  const intl = useIntl();

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
          <Alert.Heading>
            <FormattedMessage
              id="settings.access.linkManagement.error.title"
              defaultMessage="Something went wrong"
              description="Error message for link management section."
            />
          </Alert.Heading>
          <FormattedMessage
            id="settings.access.linkManagement.error.description"
            defaultMessage="There was an issue with your request, please try again."
            description="Error description for link management section."
          />
        </Alert>
      )}
      <SettingsAccessTabSection
        title={intl.formatMessage({
          id: 'adminPortal.settings.access.linkManagement.title',
          defaultMessage: 'Access via Link',
          description: 'Title for the link management section in the settings page.',
        })}
        checked={isUniversalLinkEnabled}
        onFormSwitchChange={handleLinkManagementFormSwitchChanged}
        onCollapsibleToggle={handleLinkManagementCollapsibleToggled}
        loading={isLoadingLinkManagementEnabledChange}
        disabled={isLoadingLinkManagementEnabledChange}
      >
        <p>
          <FormattedMessage
            id="adminPortal.settings.access.linkManagement.description"
            defaultMessage="Generate a link to share with your learners (up to a maximum of {MAX_UNIVERSAL_LINKS} links)."
            description="Description for the link management section in the settings page."
            values={{ MAX_UNIVERSAL_LINKS }}
          />
        </p>
        {links.length >= MAX_UNIVERSAL_LINKS && (
          <Alert icon={Info} variant="danger">
            <FormattedMessage
              id="settings.access.linkManagement.maxLinks"
              defaultMessage="You generated the maximum of {MAX_UNIVERSAL_LINKS} links. No additional links may be generated."
              description="Message for when the maximum number of links have been generated."
              values={{ MAX_UNIVERSAL_LINKS }}
            />
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
              Header: intl.formatMessage({
                id: 'adminPortal.settings.access.linkManagement.link',
                defaultMessage: 'Link',
                description: 'Column header for the link management data table in the settings page.',
              }),
              accessor: 'link',
              Cell: LinkTableCell,
            },
            {
              Header: intl.formatMessage({
                id: 'adminPortal.settings.access.linkManagement.status',
                defaultMessage: 'Status',
                description: 'Column header for the status column in the link management data table in the settings page.',
              }),
              accessor: 'isValid',
              Cell: StatusTableCell,
            },
            {
              Header: intl.formatMessage({
                id: 'adminPortal.settings.access.linkManagement.created',
                defaultMessage: 'Date created',
                description: 'Column header for the date created column in the link management data table in the settings page.',
              }),
              accessor: 'created',
              Cell: DateCreatedTableCell,
            },
            {
              Header: intl.formatMessage({
                id: 'adminPortal.settings.access.linkManagement.usage',
                defaultMessage: 'Usage',
                description: 'Column header for the usage count column in the link management data table in the settings page.',
              }),
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
          {!loadingLinks && (
            <DataTable.EmptyTable
              content={intl.formatMessage({
                id: 'adminPortal.settings.access.linkManagement.noLinks',
                defaultMessage: 'No links found',
                description: 'Message displayed when no links are found in the link management section.',
              })}
            />
          )}
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
