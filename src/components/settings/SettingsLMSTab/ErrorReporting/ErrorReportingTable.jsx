import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Tab, Tabs,
} from '@edx/paragon';
import ContentMetadataTable from './ContentMetadataTable';
import LearnerMetadataTable from './LearnerMetadataTable';

const ErrorReportingTable = ({ config }) => {
  const [key, setKey] = useState('contentMetadata');
  // notification for tab must be a non-empty string to appear
  const contentError = config.lastContentSyncErroredAt == null ? null : ' ';
  const learnerError = config.lastLearnerSyncErroredAt == null ? null : ' ';
  const enterpriseCustomerUuid = config.enterpriseCustomer;
  return (
    <>
      <h3 className="mt-5">Sync History</h3>
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        <Tab eventKey="contentMetadata" title="Content Metadata" notification={contentError}>
          <h4 className="mt-4">Most recent data transmission</h4>
          From edX for Business to {config.displayName}
          <ContentMetadataTable enterpriseCustomerUuid={enterpriseCustomerUuid} config={config} />
        </Tab>
        <Tab eventKey="learnerActivity" title="Learner Activity" notification={learnerError}>
          <h4 className="mt-4">Most recent data transmission</h4>
          From edX for Business to {config.displayName}
          <LearnerMetadataTable enterpriseCustomerUuid={enterpriseCustomerUuid} config={config} />
        </Tab>
      </Tabs>
    </>
  );
};

ErrorReportingTable.propTypes = {
  config: PropTypes.shape({
    id: PropTypes.number,
    channelCode: PropTypes.string,
    displayName: PropTypes.string,
    enterpriseCustomer: PropTypes.string,
    lastContentSyncErroredAt: PropTypes.string,
    lastLearnerSyncErroredAt: PropTypes.string,
  }).isRequired,
};

export default ErrorReportingTable;
