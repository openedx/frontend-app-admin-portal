import React from 'react';
import PropTypes from 'prop-types';
import { Collapsible, Icon, Pagination } from '@openedx/paragon';
import { Check, Close } from '@openedx/paragon/icons';
import { camelCaseObject } from '@edx/frontend-platform';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import EnterpriseCatalogApiService from '../../data/services/EnterpriseCatalogApiService';
import LMSApiService from '../../data/services/LmsApiService';
import ReportingConfigForm from './ReportingConfigForm';
import { snakeCaseFormData } from '../../utils';
import LoadingMessage from '../LoadingMessage';
import ErrorPage from '../ErrorPage';

const STATUS_FULFILLED = 'fulfilled';
const DEFAULT_PAGE_SIZE = 10;

class ReportingConfig extends React.Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    loading: true,
    reportingConfigs: [],
    reportingConfigTypes: [],
    error: undefined,
    availableCatalogs: [],
  };

  // eslint-disable-next-line react/sort-comp
  newConfigFormRef = React.createRef();

  componentDidMount() {
    Promise.allSettled([
      LMSApiService.fetchReportingConfigs(this.props.enterpriseId),
      EnterpriseCatalogApiService.fetchEnterpriseCustomerCatalogs(this.props.enterpriseId),
      LMSApiService.fetchReportingConfigTypes(this.props.enterpriseId),
    ])
      .then((responses) => {
        this.setState({
          currentPage: 1,
          totalRecords: responses[0].status === STATUS_FULFILLED ? responses[0].value.data.count : 1,
          totalPages: responses[0].status === STATUS_FULFILLED ? responses[0].value.data.num_pages : 1,
          reportingConfigs: responses[0].status === STATUS_FULFILLED ? responses[0].value.data.results : undefined,
          availableCatalogs: responses[1].status === STATUS_FULFILLED ? responses[1].value.data.results : undefined,
          reportingConfigTypes: responses[2].status === STATUS_FULFILLED ? responses[2].value.data : undefined,
          loading: false,
        });
      })
      .catch(error => this.setState({
        error,
        loading: false,
      }));
  }

  /**
   * Creates a new reporting configuration, then updates this list with the response.
   * Returns if there is an error.
   * @param {FormData} formData
   */
  createConfig = async (formData) => {
    //  snake_case the data before sending it to the backend
    const transformedData = snakeCaseFormData(formData);
    try {
      await LMSApiService.postNewReportingConfig(transformedData);

      const lastPageHaveSpace = this.state.totalRecords % this.state.totalPages > 0;

      if (lastPageHaveSpace || this.state.reportingConfigs.length < DEFAULT_PAGE_SIZE) {
        this.handlePageSelect(this.state.totalPages);
      } else {
        this.handlePageSelect(this.state.totalPages + 1);
      }
      this.newConfigFormRef.current.close();
      return undefined;
    } catch (error) {
      return error;
    }
  };

  deleteConfig = async (uuid) => {
    try {
      await LMSApiService.deleteReportingConfig(uuid);

      const isLastPage = this.state.currentPage === this.state.totalPages;
      const hasOneRecord = this.state.reportingConfigs.length === 1;
      const isOnlyRecordOnLastPage = hasOneRecord && isLastPage;

      if (isOnlyRecordOnLastPage && this.state.currentPage > 1) {
        this.handlePageSelect(this.state.totalPages - 1);
      } else {
        this.handlePageSelect(this.state.currentPage);
      }

      return undefined;
    } catch (error) {
      return error;
    }
  };

  /**
   * Updates an existing reporting configuration. Returns if there is an
   * error.
   * @param {FormData} formData
   * @param {string} uuid -> The uuid of the configuration we are updating
   */
  updateConfig = async (formData, uuid) => {
    const transformedData = snakeCaseFormData(formData);
    try {
      const response = await LMSApiService.updateReportingConfig(transformedData, uuid);
      const updatedIndex = this.state.reportingConfigs
        .findIndex(config => config.uuid === response.data.uuid);
      const reportingConfigsCopy = [...this.state.reportingConfigs];
      reportingConfigsCopy[updatedIndex] = response.data;
      this.setState({ reportingConfigs: [...reportingConfigsCopy] });
      return undefined;
    } catch (error) {
      return error;
    }
  };

  /**
   * Handles page select event and fetches the data for the selected page
   * @param {number} page - The page number to fetch data for
   */
  handlePageSelect = async (page) => {
    this.setState({
      loading: true,
    });

    try {
      const response = await LMSApiService.fetchReportingConfigs(this.props.enterpriseId, page);
      this.setState({
        totalPages: response.data.num_pages,
        totalRecords: response.data.count,
        currentPage: page,
        reportingConfigs: response.data.results,
        loading: false,
      });
    } catch (error) {
      this.setState({
        loading: false,
        error,
      });
    }
  };

  render() {
    const {
      reportingConfigs,
      loading,
      error,
      availableCatalogs,
      reportingConfigTypes,
      currentPage,
      totalPages,
    } = this.state;
    const { intl } = this.props;
    if (loading) {
      return <LoadingMessage className="overview" />;
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
      <main role="main">
        <div>
          {reportingConfigs && reportingConfigs.map(config => (
            <div
              key={config.uuid}
              className="mb-3"
            >
              <Collapsible
                styling="card"
                className="shadow"
                title={(
                  <div className="row justify-content-around flex-fill">
                    {config.active ? (
                      <Icon
                        className="col-1 text-success-300"
                        src={Check}
                      />
                    ) : (
                      <Icon
                        className="col-1 text-danger-300"
                        src={Close}
                      />
                    )}
                    <div className="col">
                      <h3 className="h6">
                        <FormattedMessage
                          id="admin.portal.reporting.config.title"
                          defaultMessage="Report Type:"
                          description="Title for the reporting configuration"
                        />
                      </h3>
                      <p>{config.data_type}</p>
                    </div>
                    <div className="col">
                      <h3 className="h6">
                        <FormattedMessage
                          id="admin.portal.reporting.config.delivery.method"
                          defaultMessage="Delivery Method:"
                          description="Title for the delivery method of the reporting configuration"
                        />
                      </h3>
                      <p>{config.delivery_method}</p>
                    </div>
                    <div className="col">
                      <h3 className="h6">
                        <FormattedMessage
                          id="admin.portal.reporting.config.frequency"
                          defaultMessage="Frequency:"
                          description="Title for the frequency of the reporting configuration"
                        />
                      </h3>
                      <p>{config.frequency}</p>
                    </div>
                  </div>
                  )}
              >
                <ReportingConfigForm
                  config={camelCaseObject(config)}
                  updateConfig={this.updateConfig}
                  createConfig={this.createConfig}
                  deleteConfig={this.deleteConfig}
                  availableCatalogs={camelCaseObject(availableCatalogs)}
                  reportingConfigTypes={camelCaseObject(reportingConfigTypes)}
                  enterpriseCustomerUuid={this.props.enterpriseId}
                />
              </Collapsible>
            </div>
          ))}

          {reportingConfigs && reportingConfigs.length > 0 && (
            <Pagination
              variant="reduced"
              onPageSelect={this.handlePageSelect}
              pageCount={totalPages}
              currentPage={currentPage}
              paginationLabel="reporting configurations pagination"
            />
          )}

          <Collapsible
            styling="basic"
            title={intl.formatMessage({
              id: 'admin.portal.reporting.config.add',
              defaultMessage: 'Add a reporting configuration',
              description: 'Add a reporting configuration',
            })}
            className="col justify-content-center align-items-center"
            ref={this.newConfigFormRef}
          >
            <div>
              <ReportingConfigForm
                createConfig={this.createConfig}
                enterpriseCustomerUuid={this.props.enterpriseId}
                availableCatalogs={camelCaseObject(availableCatalogs)}
                reportingConfigTypes={camelCaseObject(reportingConfigTypes)}
              />
            </div>
          </Collapsible>
        </div>
      </main>
    );
  }
}

ReportingConfig.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(ReportingConfig);
