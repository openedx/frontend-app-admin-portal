import React from 'react';
import {
  DataTable,
  Button,
} from '@edx/paragon';

import { useLinkManagement } from '../data/hooks';
import SettingsAccessTabSection from './SettingsAccessTabSection';
import SettingsAccessGenerateLinkButton from './SettingsAccessGenerateLinkButton';

const SettingsAccessLinkManagement = () => {
  const {
    links,
    loadingLinks,
    refreshLinks,
  } = useLinkManagement();

  const handleLinkManagementToggleChanged = () => {
    // console.log(e.target.checked);
  };

  const handleCopyLink = () => {
    // TODO: Handle Copy link to clipboard
    // console.log('handleCopyLink', rowData);
  };

  const handleDeactivateLink = () => {
    // TODO: Handle deactivate link
    // console.log('handleDeactivateLink', rowData);
  };

  /**
   * When we successfully create a link we should refresh links
   */
  const handleGenerateLinkSuccess = () => {
    refreshLinks();
  };

  // TODO: Make sure our data is being mapped correctly
  const data = links;

  return (
    <SettingsAccessTabSection
      title="Access via Link"
      checked
      onChange={handleLinkManagementToggleChanged}

    >
      <p>Generate a link to share with your learners.</p>

      <DataTable
        data={data}
        itemCount={data.length}
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
          },
          {
            Header: 'Status',
            accessor: 'linkStatus',
          },
          {
            Header: 'Date created',
            accessor: 'dateCreated',
          },
          {
            Header: 'Usage',
            accessor: 'usage',
          },
        ]}
        additionalColumns={[
          {
            id: 'action',
            Header: '',
            /* eslint-disable react/prop-types */
            Cell: ({ row }) => {
              if (row.original.linkStatus === 'activated') {
                return (
                  <div className="d-flex flex-row-reverse">
                    <Button onClick={() => handleCopyLink(row)} variant="link">Copy</Button>
                    <Button onClick={() => handleDeactivateLink(row)} variant="link">Deactivate</Button>
                  </div>
                );
              }
              return null;
            },
            /* eslint-enable */
          },
        ]}
      >
        <DataTable.TableControlBar />
        <DataTable.Table />
        <DataTable.EmptyTable content={loadingLinks ? 'Loading...' : 'No links found'} />
      </DataTable>
    </SettingsAccessTabSection>

  );
};

export default SettingsAccessLinkManagement;
