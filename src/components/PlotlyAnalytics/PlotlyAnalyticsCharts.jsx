import React, { useState, useEffect } from 'react';
import { DashApp } from 'dash-embedded-component';
import { logError } from '@edx/frontend-platform/logging';
import PropTypes from 'prop-types';
import LoadingMessage from '../LoadingMessage';
import ErrorPage from '../ErrorPage';
import PlotlyAnalyticsApiService from './data/service';
import { configuration } from '../../config';

const PlotlyAnalyticsCharts = ({ enterpriseId }) => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshPlotlyToken = async () => {
    const response = await PlotlyAnalyticsApiService.fetchPlotlyToken({ enterpriseId });
    return response.data.token;
  };

  useEffect(() => {
    setIsLoading(true);
    PlotlyAnalyticsApiService.fetchPlotlyToken({ enterpriseId })
      .then((response) => {
        setToken(response.data.token);
        setIsLoading(false);
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

  return (
    <DashApp
      config={{
        url_base_pathname: configuration.PLOTLY_SERVER_URL,
        auth_token: token,
        request_refresh_jwt: refreshPlotlyToken,
      }}
    />
  );
};

PlotlyAnalyticsCharts.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default PlotlyAnalyticsCharts;
