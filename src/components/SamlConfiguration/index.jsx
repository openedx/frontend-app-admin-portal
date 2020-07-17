import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Collapsible, Icon } from '@edx/paragon';
import SamlProviderConfigForm from './SamlProviderConfigForm';
import SamlProviderDataForm from './SamlProviderDataForm';
import { camelCaseObject, snakeCaseFormData } from '../../utils';
import LmsApiService from '../../data/services/LmsApiService';
import LoadingMessage from '../LoadingMessage';
import ErrorPage from '../ErrorPage';

class SamlConfiguration extends React.Component {
  state = {
    providerConfig: undefined,
    providerData: undefined,
    error: undefined,
    loading: true,
  };

  componentDidMount() {
    LmsApiService.getProviderConfig(this.props.enterpriseId)
      .then((response) => {
        this.setState({
          providerConfig: response.data.results[0],
          loading: false,
        });
      })
      .catch(error => this.setState({
        error,
      }));
    LmsApiService.getProviderData(this.props.enterpriseId)
      .then((response) => {
        this.setState({
          providerData: response.data.results[0],
          loading: false,
        });
      })
      .catch(error => this.setState({
        error,
        loading: false,
      }));
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
    try {
      const response = await LmsApiService.postNewProviderConfig(
        transformedData,
        this.props.enterpriseId,
      );
      this.setState({ providerConfig: response.data });
      return undefined;
    } catch (error) {
      return error;
    }
  }

  /**
   * Updates existing provider configuration, then updates this list with the response.
   * Returns if there is an error.
   * @param {FormData} formData
   * @param {string} pid // provider ID generated and stored in database.
   */
  updateProviderConfig = async (formData, pid) => {
    const transformedData = snakeCaseFormData(formData);
    transformedData.append('enterprise_customer_uuid', this.props.enterpriseId);
    try {
      const response = await LmsApiService.postNewProviderConfig(transformedData, pid);
      this.setState({ providerConfig: response.data });
      return undefined;
    } catch (error) {
      return error;
    }
  }

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
      return error;
    }
  }

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
      return error;
    }
  }

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
      return error;
    }
  }

  render() {
    const {
      providerConfig, error, providerData, loading,
    } = this.state;
    if (loading) {
      return <LoadingMessage className="overview" />;
    }
    if (error && error.response.status !== 404) {
      return (
        <ErrorPage
          status={error.response && error.response.status}
          message={error.message}
        />
      );
    }
    return (
      <main role="main">
        <div>
          <React.Fragment>
            {providerConfig &&
              <div
                key={providerConfig.id}
                className="mb-3"
              >
                <Collapsible
                  styling="card"
                  className="shadow"
                  title={
                    <div className="row justify-content-around flex-fill">
                      <Icon
                        className={`col-1 ${providerConfig.enabled ? ' fa fa-check text-success-300' : ' fa fa-times text-danger-300'}`}
                      />
                      <div className="col">
                        <h3 className="h6">Entity ID:</h3>
                        <p>{providerConfig.entity_id}</p>
                      </div>
                      <div className="col">
                        <h3 className="h6">Metadata Source:</h3>
                        <p>{providerConfig.metadata_source}</p>
                      </div>
                    </div>
                      }
                >
                  <SamlProviderConfigForm
                    config={camelCaseObject(providerConfig)}
                    updateProviderConfig={this.updateProviderConfig}
                    createProviderConfig={this.createProviderConfig}
                    deleteProviderConfig={this.deleteProviderConfig}
                  />
                </Collapsible>
              </div>
            }
            {providerData &&
              <div
                key={providerData.id}
                className="mb-3"
              >
                <Collapsible
                  styling="card"
                  className="shadow"
                  title={
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
                        <h3 className="h6">SSO Url:</h3>
                        <p>{providerData.sso_url}</p>
                      </div>
                    </div>
                  }
                >
                  <SamlProviderDataForm
                    pData={camelCaseObject(providerData)}
                    deleteProviderData={this.deleteProviderData}
                  />

                </Collapsible>
              </div>
            }
            {!providerConfig &&
              <Collapsible
                styling="basic"
                title="Add a SAML Provider Configuration"
                className="col justify-content-center align-items-center"
              >
                <div>
                  <SamlProviderConfigForm
                    createProviderConfig={this.createProviderConfig}
                  />
                </div>
              </Collapsible>
            }
            {(providerConfig && !providerData) &&
              <Collapsible
                styling="basic"
                title="Add SAML Provider Data"
                className="col justify-content-center align-items-center"
              >
                <div>
                  <SamlProviderDataForm
                    entityId={providerConfig.entity_id}
                    createProviderData={this.createProviderData}
                  />
                </div>
              </Collapsible>
            }
          </React.Fragment>
        </div>
      </main>
    );
  }
}

SamlConfiguration.defaultProps = {
  enterpriseSlug: null,
  enterpriseName: null,
};

SamlConfiguration.propTypes = {
  enterpriseName: PropTypes.string,
  enterpriseSlug: PropTypes.string,
  enterpriseId: PropTypes.string.isRequired,
};

export default SamlConfiguration;
