import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { logError } from '@edx/frontend-platform/logging';
import url from 'url';
import LoadingMessage from '../LoadingMessage';
import ErrorPage from '../ErrorPage';
import { configuration } from '../../config';

import AnalyticsApiService from './data/service';

export default function AnalyticsCharts({ enterpriseId }) {
  const [tokenUsedOnce, setTokenUsedOnce] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const tableauRef = useRef(null);
  let tableauUrl = 'https://enterprise-tableau.edx.org/views/enterpriseadminanalytics/enroll_dash';
  if (configuration.TABLEAU_URL) {
    tableauUrl = `${configuration.TABLEAU_URL}/views/enterpriseadminanalytics/enroll_dash`;
  }
  const options = {
    height: 900,
    width: 1250,
    hideToolbar: true,
  };
  const getUrl = (token) => {
    const parsed = url.parse(tableauUrl, true);
    const { protocol, host, pathname } = parsed;
    const query = '?:embed=yes&:comments=no&:toolbar=no&:refresh=yes';
    if (!tokenUsedOnce && token) {
      setTokenUsedOnce(true);
      return `${protocol}//${host}/trusted/${token}${pathname}${query}`;
    }
    return `${protocol}//${host}${pathname}${query}`;
  };
  const initViz = (token) => {
    const augmentedUrl = getUrl(token);
    const viz = new window.tableau.Viz(tableauRef.current, augmentedUrl, options);
    return viz;
  };

  // Initialize tableau Viz and fetch token
  useEffect(() => {
    setIsLoading(true);
    AnalyticsApiService.fetchTableauToken({ enterpriseId })
      .then((response) => {
        setIsLoading(false);
        setTokenUsedOnce(false);
        initViz(response.data);
      })
      .catch((err) => {
        logError(err);
        setIsLoading(false);
        setError(err);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return <LoadingMessage className="analytics" />;
  }
  if (error) {
    return (
      <ErrorPage
        status={error.response && error.response.status}
        message={error.message}
      />
    );
  }

  return <div id="tableau_frame" ref={tableauRef} />;
}

AnalyticsCharts.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};
