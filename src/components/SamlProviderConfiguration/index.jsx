/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Collapsible, Icon } from '@edx/paragon';
import classNames from 'classnames';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import { connect } from 'react-redux';
import SamlProviderConfigForm from './SamlProviderConfigForm';
import SamlProviderDataForm from './SamlProviderDataForm';
import { snakeCaseFormData } from '../../utils';
import LmsApiService from '../../data/services/LmsApiService';
import LoadingMessage from '../LoadingMessage';
import ErrorPage from '../ErrorPage';
import { configuration } from '../../config';
import { createSAMLURLs } from './utils';

export class SamlProviderConfigurationCore extends React.Component {
  state = {
    providerConfig: undefined,
    providerData: undefined,
    error: undefined,
    loading: true,
    deleteEnabled: false,
  };

  componentDidMount() {
    Promise.allSettled([
      LmsApiService.getProviderConfig(this.props.enterpriseId),
      LmsApiService.getProviderData(this.props.enterpriseId),
    ]).then((responses) => {
      this.setState({
        providerConfig: responses[0].status === 'fulfilled' ? responses[0].value.data.results[0] : undefined,
        providerData: responses[1].status === 'fulfilled' ? responses[1].value.data.results[0] : undefined,
        loading: false,
      });
    })
      .catch((error) => {
        const errorMsg = error.message || error.response.status === 500
          ? error.message : JSON.stringify(error.response.data);
        logError.logAPIErrorResponse(errorMsg);
        this.setState({
          error,
          loading: false,
        });
      });
  }

  /**
   * Creates a new third party provider configuration, then updates this list with the response.
   * Returns if there is an error.
   * @param {FormData} formData
   */
  createProviderConfig = async (formData) => {
    const transformedData = snakeCaseFormData(formData);
    transformedData.append('name', this.props.enterpriseName);
    transformedData.append('slug', this.props.enterpriseSlug);
    transformedData.append('enterprise_customer_uuid', this.props.enterpriseId);
    try {
      const response = await LmsApiService.postNewProviderConfig(transformedData);
      this.setState({ providerConfig: response.data });
      return undefined;
    } catch (error) {
      return this.handleErrors(error);
    }
  };

  /**
   * Updates existing provider configuration, then updates this list with the response.
   * Returns if there is an error.
   * @param {FormData} formData
   * @param {string} pid // provider ID generated and stored in database.
   */
  updateProviderConfig = async (formData, pid) => {
    const transformedData = snakeCaseFormData(formData);
    transformedData.append('name', this.props.enterpriseName);
    transformedData.append('slug', this.props.enterpriseSlug);
    transformedData.append('enterprise_customer_uuid', this.props.enterpriseId);
    try {
      const response = await LmsApiService.updateProviderConfig(transformedData, pid);
      this.setState({ providerConfig: response.data });
      return undefined;
    } catch (error) {
      return this.handleErrors(error);
    }
  };

  /**
   * Permanently deletes a provider configuration, then updates this list with the response.
   * Returns if there is an error.
   * @param {string} pid // provider ID generated and stored in database.
   */
  deleteProviderConfig = async (pid) => {
    try {
      await LmsApiService.deleteProviderConfig(pid, this.props.enterpriseId);
      this.setState({ providerConfig: undefined });
      return undefined;
    } catch (error) {
      return this.handleErrors(error);
    }
  };

  /**
   * Creates new third party provider data entry in db and refreshes list with the result.
   * Returns if there is an error.
   * @param {FormData} formData
   */
  createProviderData = async (formData) => {
    formData.append('fetchedAt', moment().format('YYYY-MM-DDThh:mm:ss'));
    formData.append('enterpriseCustomerUuid', this.props.enterpriseId);
    const transformedData = snakeCaseFormData(formData);
    try {
      const response = await LmsApiService.createProviderData(transformedData);
      this.setState({ providerData: response.data });
      return undefined;
    } catch (error) {
      return this.handleErrors(error);
    }
  };

  /**
   * Deletes a provider data entry in db and refreshes list with the result.
   * Returns if there is an error.
   * @param {string} pdid // provider data id generated & stored in database.
   */
  deleteProviderData = async (pdid) => {
    try {
      await LmsApiService.deleteProviderData(pdid, this.props.enterpriseId);
      this.setState({ providerData: undefined });
      return undefined;
    } catch (error) {
      return this.handleErrors(error);
    }
  };

  handleErrors(error) {
    const errorMsg = error.message || error.response?.status === 500
      ? error.message : JSON.stringify(error.response.data);
    logError(errorMsg);
    return errorMsg;
  }

  render() {
    const {
      providerConfig, error, providerData, loading, deleteEnabled,
    } = this.state;

    if (loading) {
      return <LoadingMessage className="overview" />;
    }
    if (error && error.response?.status !== 404) {
      return (
        <ErrorPage
          status={error.response?.status}
          message={error.message}
        />
      );
    }

    const { id, slug: idpSlug, metadata_source } = providerConfig || { id: '', slug: '', metadata_source: '' };

    const { learnerPortalEnabled, enterpriseSlug } = this.props;
    const { testLink, spMetadataLink } = createSAMLURLs({
      configuration,
      idpSlug,
      enterpriseSlug,
      learnerPortalEnabled,
    });

    return (
      <main role="main">
        <div>
          {providerConfig && (
          <div
            key={id}
            className="mb-3"
          >
            <Collapsible
              styling="card"
              className="shadow"
              title={(
                <div className="row justify-content-around flex-fill">
                  <Icon
                    className={classNames(
                      'col-1',
                      {
                        'fa fa-check text-success-300': providerConfig.enabled,
                        'fa fa-times text-danger-300': !providerConfig.enabled,
                      },
                    )}
                  />
                  <div className="col">
                    <h3 className="h6">Entity ID:</h3>
                    <p>{providerConfig.entity_id}</p>
                  </div>
                  <div className="col">
                    <h3 className="h6">Metadata Source:</h3>
                    <p>{metadata_source}</p>
                  </div>
                  <div className="col">
                    <h3 className="h6">SP Metadata</h3>
                    <p><a target="_blank" rel="noopener noreferrer" href={spMetadataLink}>{spMetadataLink}</a></p>
                  </div>
                  <div className="col">
                    <h3 className="h6">Test link</h3>
                    <p><a target="_blank" rel="noopener noreferrer" href={testLink}>{testLink}</a></p>
                  </div>
                </div>
                  )}
            >
              <SamlProviderConfigForm
                config={camelCaseObject(providerConfig)}
                updateProviderConfig={this.updateProviderConfig}
                createProviderConfig={this.createProviderConfig}
                deleteProviderConfig={this.deleteProviderConfig}
                deleteEnabled={deleteEnabled}
              />
            </Collapsible>
          </div>
          )}
          {providerData && (
          <div
            key={providerData.id}
            className="mb-3"
          >
            <Collapsible
              styling="card"
              className="shadow"
              title={(
                <div className="row justify-content-around flex-fill">
                  <div className="col">
                    <h3 className="h6">Fetched At:</h3>
                    <p>{providerData.fetched_at}</p>
                  </div>
                  <div className="col">
                    <h3 className="h6">Entity ID:</h3>
                    <p>{providerData.entity_id}</p>
                  </div>
                  <div className="col">
                    <h3 className="h6">SSO URL:</h3>
                    <p>{providerData.sso_url}</p>
                  </div>
                </div>
                  )}
            >
              <SamlProviderDataForm
                pData={camelCaseObject(providerData)}
                deleteProviderData={this.deleteProviderData}
                deleteEnabled={deleteEnabled}
              />

            </Collapsible>
          </div>
          )}
          {!providerConfig && (
          <Collapsible
            styling="basic"
            title="Add a SAML Provider Configuration"
            className="col justify-content-center align-items-center"
          >
            <div>
              <SamlProviderConfigForm
                createProviderConfig={this.createProviderConfig}
                deleteEnabled={deleteEnabled}
              />
            </div>
          </Collapsible>
          )}
          {(providerConfig && !providerData) && (
          <Collapsible
            styling="basic"
            title="Add SAML Provider Data"
            className="col justify-content-center align-items-center"
          >
            <div>
              <SamlProviderDataForm
                entityId={providerConfig.entity_id}
                createProviderData={this.createProviderData}
                deleteEnabled={deleteEnabled}
              />
            </div>
          </Collapsible>
          )}
        </div>
      </main>
    );
  }
}

SamlProviderConfigurationCore.defaultProps = {
  enterpriseSlug: null,
  enterpriseName: null,
};

SamlProviderConfigurationCore.propTypes = {
  enterpriseName: PropTypes.string,
  enterpriseSlug: PropTypes.string,
  enterpriseId: PropTypes.string.isRequired,
  learnerPortalEnabled: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  learnerPortalEnabled: state.portalConfiguration.enableLearnerPortal,
});

export default connect(mapStateToProps)(SamlProviderConfigurationCore);
