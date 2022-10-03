import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, Hyperlink, ModalDialog, Tab, Tabs,
} from '@edx/paragon';
import ContentMetadataTable from './ContentMetadataTable';

function ErrorReportingModal({
  isOpen, close, config, enterpriseCustomerUuid,
}) {
  const [key, setKey] = useState('contentMetadata');

  return (
    <>
      <ModalDialog
        title="My dialog"
        isOpen={isOpen}
        onClose={close}
        size="xl"
        hasCloseButton
        isFullscreenOnMobile
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            {config?.displayName} Sync History
          </ModalDialog.Title>
        </ModalDialog.Header>

        <ModalDialog.Body>
          <Tabs
            id="controlled-tab-example"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
          >
            <Tab eventKey="contentMetadata" title="Content Metadata">
              <h4 className="mt-4">Most recent data transmission</h4>
              From edX for Business to {config?.displayName}
              <ContentMetadataTable enterpriseCustomerUuid={enterpriseCustomerUuid} config={config} />
            </Tab>
            <Tab eventKey="learnerActivity" title="Learner Activity">
              Learner Activity.
            </Tab>
          </Tabs>
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <ActionRow>
            <Button variant="tertiary">
              <Hyperlink variant="muted" destination="https://www.edx.org" target="_blank">
                Help Center: Troubleshooting
              </Hyperlink>
            </Button>
            <ModalDialog.CloseButton variant="primary">
              Close
            </ModalDialog.CloseButton>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );
}

ErrorReportingModal.defaultProps = {
  config: null,
};

ErrorReportingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  config: PropTypes.shape({
    id: PropTypes.number,
    channelCode: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
  }),
  enterpriseCustomerUuid: PropTypes.string.isRequired,
};

export default ErrorReportingModal;
