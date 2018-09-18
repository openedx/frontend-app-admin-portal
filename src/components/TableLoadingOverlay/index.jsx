import React from 'react';
import LoadingMessage from '../LoadingMessage';

import './TableLoadingOverlay.scss';

const TableLoadingOverlay = () => (
  <div>
    <div className="table-loading-overlay" />
    <div className="table-loading-message d-flex align-items-center justify-content-center ">
      <LoadingMessage className="loading" />
    </div>
  </div>
);

export default TableLoadingOverlay;
