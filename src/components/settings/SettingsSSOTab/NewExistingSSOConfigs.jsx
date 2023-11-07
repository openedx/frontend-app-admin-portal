import _ from 'lodash';
import {
  CardGrid,
  Skeleton,
  useToggle,
} from '@edx/paragon';
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
  configs, refreshBool, setRefreshBool, enterpriseId,
}) => {
  const [inactiveConfigs, setInactiveConfigs] = useState([]);
  const [activeConfigs, setActiveConfigs] = useState([]);
  const [inProgressConfigs, setInProgressConfigs] = useState([]);
  const [untestedConfigs, setUntestedConfigs] = useState([]);
  const [liveConfigs, setLiveConfigs] = useState([]);
  const [notConfiguredConfigs, setNotConfiguredConfigs] = useState([]);
  const [queryForTestedConfigs, setQueryForTestedConfigs] = useState(false);
  const [queryForConfiguredConfigs, setQueryForConfiguredConfigs] = useState(false);
  const [intervalMs, setIntervalMs] = React.useState(FRESH_CONFIG_POLLING_INTERVAL);
  const [loading, setLoading] = useState(false);
  const [showAlerts, openAlerts, closeAlerts] = useToggle(false);

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
              <NewSSOConfigCard
                key={config.uuid}
                config={config}
                setLoading={setLoading}
                setRefreshBool={setRefreshBool}
                refreshBool={refreshBool}
              />
            ))}
          </CardGrid>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const [active, inactive] = _.partition(configs, config => config.active);
    const inProgress = configs.filter(isInProgressConfig);
    const untested = configs.filter(config => !config.validated_at);
    const live = configs.filter(
      config => (config.validated_at && config.active && config.validated_at > config.configured_at),
    );
    const notConfigured = configs.filter(config => !config.configured_at);

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
      const res = await LmsApiService.listEnterpriseSsoOrchestrationRecords(enterpriseId);
      const inProgress = res.data.filter(
        config => (config.submitted_at && !config.configured_at) || (config.configured_at < config.submitted_at),
      );
      const untested = res.data.filter(config => !config.validated_at || config.validated_at < config.configured_at);

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
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(NewExistingSSOConfigs);
