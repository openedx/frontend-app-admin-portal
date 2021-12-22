import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { logError } from '@edx/frontend-platform/logging';
import url from 'url';
import LoadingMessage from '../LoadingMessage';
import ErrorPage from '../ErrorPage';
import { configuration } from '../../config';

import AnalyticsApiService from './data/service';

// eslint-disable-next-line no-unused-vars
export default function AnalyticsCharts(enterpriseId) {
  const [token, setToken] = useState(null);
  const [tokenUsedOnce, setTokenUsedOnce] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const ref = useRef(null);
  let tableauUrl = 'https://enterprise-tableau.edx.org/views/enterpriseadminanalytics/enroll_dash';
  if (configuration.TABLEAU_URL) {
    tableauUrl = `${configuration.TABLEAU_URL}/views/enterpriseadminanalytics/enroll_dash`;
  }
  const options = {
    height: 900,
    width: 1250,
    hideToolbar: true,
  };
  const getUrl = () => {
    const parsed = url.parse(tableauUrl, true);
    const { protocol, host, pathname } = parsed;
    const query = '?:embed=yes&:comments=no&:toolbar=no&:refresh=yes';
    if (!tokenUsedOnce && token) {
      setTokenUsedOnce(true);
      return `${protocol}//${host}/trusted/${token}${pathname}${query}`;
    }
    return `${protocol}//${host}${pathname}${query}`;
  };
  const initViz = () => {
    const containerDiv = document.getElementById('tableau_frame');
    const augmentedUrl = getUrl();
    const viz = new window.tableau.Viz(containerDiv, augmentedUrl, options);
    return viz;
  };

  // Initialize tableau Viz and fetch token
  useEffect(() => {
    setIsLoading(true);
    AnalyticsApiService.fetchTableauToken(enterpriseId)
      .then((response) => {
        setIsLoading(false);
        setToken(response.data);
        setTokenUsedOnce(false);
        initViz();
      })
      .catch((err) => {
        logError(err);
        setIsLoading(false);
        setError(err);
      });
  }, []);

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

  return <div id="tableau_frame" ref={ref} />;
}

AnalyticsCharts.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  enterpriseId: PropTypes.string.isRequired,
};
