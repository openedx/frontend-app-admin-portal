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
      <Row className="my-3">
        <Col className="col-8">
          <SearchBar
            placeholder="Search by email..."
            onSearch={searchQuery => setSearchQuery(searchQuery)}
            onClear={() => setSearchQuery(null)}
          />
        </Col>
        <Col className="d-flex justify-content-end">
          <DownloadCsvButton />
        </Col>
      </Row>
    </>
  );
};

export default LicenseAllocationHeader;
