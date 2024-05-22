import _ from 'lodash';
import {
  Alert,
  CardGrid,
  Skeleton,
  useToggle,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import LmsApiService from '../../../data/services/LmsApiService';
import NewSSOConfigAlerts from './NewSSOConfigAlerts';
import NewSSOConfigCard from './NewSSOConfigCard';
import { isInProgressConfig } from './utils';

const FRESH_CONFIG_POLLING_INTERVAL = 30000;
const UPDATED_CONFIG_POLLING_INTERVAL = 2000;

const NewExistingSSOConfigs = ({
  configs, refreshBool, setRefreshBool, enterpriseId, setPollingNetworkError, setIsStepperOpen,
}) => {
  const [inactiveConfigs, setInactiveConfigs] = useState([]);
  const [activeConfigs, setActiveConfigs] = useState([]);
  const [inProgressConfigs, setInProgressConfigs] = useState([]);
  const [untestedConfigs, setUntestedConfigs] = useState([]);
  const [liveConfigs, setLiveConfigs] = useState([]);
  const [erroredConfigs, setErroredConfigs] = useState([]);
  const [timedOutConfigs, setTimedOutConfigs] = useState([]);
  const [notConfiguredConfigs, setNotConfiguredConfigs] = useState([]);
  const [queryForTestedConfigs, setQueryForTestedConfigs] = useState(false);
  const [queryForConfiguredConfigs, setQueryForConfiguredConfigs] = useState(false);
  const [intervalMs, setIntervalMs] = React.useState(FRESH_CONFIG_POLLING_INTERVAL);
  const [loading, setLoading] = useState(false);
  const [showAlerts, openAlerts, closeAlerts] = useToggle(false);
  const [updateError, setUpdateError] = useState(null);

  const queryClient = useQueryClient();

  const renderCards = (gridTitle, configList) => {
    if (configList.length > 0) {
      return (
        <div>
          <h3 className="mb-4.5">{gridTitle}</h3>
          <CardGrid
            key={gridTitle}
            className="mb-2 mr-3"
            columnSizes={{
              xs: 9,
              s: 9,
              m: 9,
              l: 9,
              xl: 9,
            }}
          >
            {configList.map((config) => (
              <div className="flex-fill" key={config.uuid}>
                <NewSSOConfigCard
                  config={config}
                  setLoading={setLoading}
                  setRefreshBool={setRefreshBool}
                  refreshBool={refreshBool}
                  setUpdateError={setUpdateError}
                  setIsStepperOpen={setIsStepperOpen}
                />
                {updateError?.config === config.uuid && (
                  <div>
                    <Alert
                      variant="danger"
                      dismissible
                      icon={Info}
                      onClose={() => (setUpdateError(null))}
                    >
                      <Alert.Heading>Something went wrong behind the scenes</Alert.Heading>
                      <p>
                        We were unable to {updateError?.action} your SSO configuration due to an internal error. Please
                        {' '}try again in a couple of minutes. If the problem persists, contact enterprise customer
                        {' '}support.
                      </p>
                    </Alert>
                  </div>
                )}
              </div>
            ))}
          </CardGrid>
        </div>
      );
    }
    return null;
  };

  function checkConfiguring(config) {
    return !config.configured_at || config.submitted_at > config.configured_at;
  }

  function checkErrored(config) {
    return config.errored_at && (config.submitted_at < config.errored_at);
  }

  function checkTimedOut(config) {
    return config.submitted_at && checkConfiguring(config) && !config.is_pending_configuration && !checkErrored(config);
  }

  useEffect(() => {
    const [active, inactive] = _.partition(configs, config => config.active);
    const inProgress = configs.filter(isInProgressConfig);
    const untested = configs.filter(config => !config.validated_at);
    const live = configs.filter(
      config => (config.validated_at && config.active && config.validated_at > config.configured_at),
    );
    const notConfigured = configs.filter(config => !config.configured_at);

    const handleCheckTimedOut = (config) => (
      config.submitted_at && checkConfiguring(config) && !config.is_pending_configuration && !checkErrored(config)
    );

    const timedOut = configs.filter(handleCheckTimedOut);
    const errored = configs.filter(checkErrored);
    setTimedOutConfigs(timedOut);
    setErroredConfigs(errored);

    if (live.length >= 1) {
      setLiveConfigs(live);
      openAlerts();
    }

    setUntestedConfigs(untested);
    if (untested.length >= 1) {
      setQueryForTestedConfigs(true);
      openAlerts();
    }
    setInProgressConfigs(inProgress);
    if (inProgress.length >= 1) {
      const beenConfigured = inProgress.filter(config => config.configured_at);
      if (beenConfigured.length >= 1) {
        setIntervalMs(UPDATED_CONFIG_POLLING_INTERVAL);
      }
      setQueryForConfiguredConfigs(true);
      openAlerts();
    }

    if (notConfigured.length >= 1) {
      setNotConfiguredConfigs(notConfigured);
    }

    setActiveConfigs(active);
    setInactiveConfigs(inactive);
    setLoading(false);
  }, [configs, refreshBool, openAlerts]);

  useQuery({
    queryKey: ['ssoOrchestratorConfigPoll'],
    queryFn: async () => {
      const res = await LmsApiService.listEnterpriseSsoOrchestrationRecords(enterpriseId).catch(() => {
        setPollingNetworkError(true);
        return { data: [] };
      });
      const inProgress = res.data.filter(
        config => (config.submitted_at && !config.configured_at) || (config.configured_at < config.submitted_at),
      );
      const untested = res.data.filter(config => !config.validated_at || config.validated_at < config.configured_at);
      const timedOut = res.data.filter(checkTimedOut);
      const errored = res.data.filter(checkErrored);
      if (timedOut.length >= 1) {
        setTimedOutConfigs(timedOut);
      }

      if (errored.length >= 1) {
        setErroredConfigs(errored);
      }

      if (queryForConfiguredConfigs) {
        if (inProgress.length === 0) {
          setRefreshBool(!refreshBool);
          setQueryForConfiguredConfigs(false);
        }
      }

      if (queryForTestedConfigs) {
        if (untested.length === 0) {
          setRefreshBool(!refreshBool);
          setQueryForTestedConfigs(false);
        }
      }

      if (inProgress.length === 0 && untested.length === 0) {
        queryClient.invalidateQueries({ queryKey: ['ssoOrchestratorConfigPoll'] });
      }

      return res.data;
    },
    refetchInterval: intervalMs,
    enabled: queryForTestedConfigs || queryForConfiguredConfigs,
    refetchOnWindowFocus: true,
  });

  return (
    <>
      {!loading && (
        <>
          {showAlerts && (
            <NewSSOConfigAlerts
              liveConfigs={liveConfigs}
              inProgressConfigs={inProgressConfigs}
              untestedConfigs={untestedConfigs}
              notConfigured={notConfiguredConfigs}
              closeAlerts={closeAlerts}
              timedOutConfigs={timedOutConfigs}
              erroredConfigs={erroredConfigs}
              setIsStepperOpen={setIsStepperOpen}
            />
          )}
          {renderCards('Active', activeConfigs)}
          {renderCards('Inactive', inactiveConfigs)}
        </>
      )}
      {loading && (
        <div data-testid="sso-self-service-skeleton">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      )}
    </>
  );
};

NewExistingSSOConfigs.propTypes = {
  configs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  refreshBool: PropTypes.bool.isRequired,
  setRefreshBool: PropTypes.func.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  setPollingNetworkError: PropTypes.func.isRequired,
  setIsStepperOpen: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(NewExistingSSOConfigs);
