import React, { useContext } from 'react';
import { Row, Col } from '@edx/paragon';
import SearchBar from '../../SearchBar';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import DownloadCsvButton from '../buttons/DownloadCsvButton';

const LicenseAllocationHeader = () => {
  const {
    setSearchQuery,
    subscription,
  } = useContext(SubscriptionDetailContext);
  return (
    <>
      <h2 className="mb-2">License Allocation</h2>
      <p className="lead">
        {subscription.licenses?.allocated}
        {' of '}
        {subscription.licenses?.total} licenses allocated
      </p>
      <Row className="justify-content-between">
        <Col lg={6} xs={12} className="mb-2">
          <SearchBar
            placeholder="Search by email..."
            onSearch={searchQuery => setSearchQuery(searchQuery)}
            onClear={() => setSearchQuery(null)}
            inputProps={{ 'data-hj-suppress': true }}
          />
        </Col>
        <Col xs={12} className="col-lg-auto">
          <DownloadCsvButton />
        </Col>
      </Row>
    </>
  );
};

export default LicenseAllocationHeader;
