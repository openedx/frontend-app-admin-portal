import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { logError } from '@edx/frontend-platform/logging';
import url from 'url';
import { Container } from '@edx/paragon';
import LoadingMessage from '../LoadingMessage';
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
      .then((response) => { // eslint-disable-line consistent-return
        setIsLoading(false);
        setTokenUsedOnce(false);
        if (response.data === '-1') {
          // tableau returns '-1' when user cannot be assigned a valid ticket because of license issues or bad request
          return Promise.reject(new Error('Ticket returned by tableau is invalid.'));
        }
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
      <Container size="lg" className="mt-5">
        <div style={{ textAlign: 'center' }}>
          <h2>
            We are updating our servers! We apologize for the interruption.
          </h2>
          <p>
            If you need something from here urgently, reach out to your customer success representative.
          </p>
        </div>
      </Container>
    );
  }

  return <div id="tableau_frame" ref={tableauRef} />;
}

AnalyticsCharts.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};
