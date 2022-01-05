import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  DataTable,
} from '@edx/paragon';

import { useLinkManagement } from '../data/hooks';
import SettingsAccessTabSection from './SettingsAccessTabSection';
import SettingsAccessGenerateLinkButton from './SettingsAccessGenerateLinkButton';
import StatusTableCell from './StatusTableCell';
import DateCreatedTableCell from './DateCreatedTableCell';
import LinkTableCell from './LinkTableCell';
import UsageTableCell from './UsageTableCell';
import ActionsTableCell from './ActionsTableCell';
import DisableLinkManagementAlertModal from './DisableLinkManagementAlertModal';

const SettingsAccessLinkManagement = ({ enterpriseUUID }) => {
  const {
    links,
    loadingLinks,
    refreshLinks,
  } = useLinkManagement(enterpriseUUID);
  const [isLinkManagementEnabled, setisLinkManagementEnabled] = useState(true);
  const [isLinkManagementAlertModalOpen, setIsLinkManagementAlertModalOpen] = useState(false);

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

  const handleLinkManagementAlertModalClose = () => {
    setIsLinkManagementAlertModalOpen(false);
  };

  const handleLinkManagementDisabledSuccess = () => {
    refreshLinks();
    setisLinkManagementEnabled(false);
    setIsLinkManagementAlertModalOpen(false);
  };

  const handleLinkManagementFormSwitchChanged = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setisLinkManagementEnabled(e.target.checked);
    } else {
      setIsLinkManagementAlertModalOpen(true);
    }
  };

  return (
    <>
      <SettingsAccessTabSection
        title="Access via Link"
        checked={isLinkManagementEnabled}
        onFormSwitchChange={handleLinkManagementFormSwitchChanged}
        onCollapsibleToggle={handleLinkManagementCollapsibleToggled}
      >
        <p>Generate a link to share with your learners.</p>
        <DataTable
          data={links}
          itemCount={links.length}
          // eslint-disable-next-line no-unused-vars
          tableActions={(i) => (
            <SettingsAccessGenerateLinkButton
              onSuccess={handleGenerateLinkSuccess}
              // TODO: Handle error
              onError={() => {}}
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
              Cell: props => <ActionsTableCell {...props} onDeactivateLink={handleDeactivatedLink} />,
            },
          ]}
        >
          <DataTable.TableControlBar />
          <DataTable.Table />
          <DataTable.EmptyTable content={loadingLinks ? 'Loading...' : 'No links found'} />
        </DataTable>
      </SettingsAccessTabSection>
      <DisableLinkManagementAlertModal
        isOpen={isLinkManagementAlertModalOpen}
        onDisableLinkManagement={handleLinkManagementDisabledSuccess}
        onClose={handleLinkManagementAlertModalClose}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

SettingsAccessLinkManagement.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(SettingsAccessLinkManagement);
