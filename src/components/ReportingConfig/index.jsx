import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Collapsible, Icon, Pagination } from '@openedx/paragon';
import { Check, Close } from '@openedx/paragon/icons';
import { camelCaseObject } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import EnterpriseCatalogApiService from '../../data/services/EnterpriseCatalogApiService';
import LMSApiService from '../../data/services/LmsApiService';
import ReportingConfigForm from './ReportingConfigForm';
import { snakeCaseFormData } from '../../utils';
import LoadingMessage from '../LoadingMessage';
import ErrorPage from '../ErrorPage';

const STATUS_FULFILLED = 'fulfilled';
const DEFAULT_PAGE_SIZE = 10;

const ReportingConfig = ({
  enterpriseId,
}) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(true);
  const [reportingConfigs, setReportingConfigs] = useState([]);
  const [reportingConfigTypes, setReportingConfigTypes] = useState([]);
  const [error, setError] = useState(undefined);
  const [availableCatalogs, setAvailableCatalogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const newConfigFormRef = React.createRef();

  useEffect(() => {
    Promise.allSettled([
      LMSApiService.fetchReportingConfigs(enterpriseId),
      EnterpriseCatalogApiService.fetchEnterpriseCustomerCatalogs(enterpriseId),
      LMSApiService.fetchReportingConfigTypes(enterpriseId),
    ])
      .then((responses) => {
        let totalPagesReceived = responses[0].status === STATUS_FULFILLED ? responses[0].value.data.num_pages : 1;
        if (!totalPagesReceived) {
          totalPagesReceived = 1;
        }

        setTotalPages(totalPagesReceived);
        setCurrentPage(1);
        setTotalRecords(responses[0].status === STATUS_FULFILLED ? responses[0].value.data.count : 0);
        setReportingConfigs(responses[0].status === STATUS_FULFILLED ? responses[0].value.data.results : undefined);
        setAvailableCatalogs(responses[1].status === STATUS_FULFILLED ? responses[1].value.data.results : undefined);
        setReportingConfigTypes(responses[2].status === STATUS_FULFILLED ? responses[2].value.data : undefined);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handles page select event and fetches the data for the selected page
   * @param {number} page - The page number to fetch data for
   */
  const handlePageSelect = async (page) => {
    setLoading(true);

    try {
      const response = await LMSApiService.fetchReportingConfigs(enterpriseId, page);
      setTotalPages(response.data.num_pages || 1);
      setTotalRecords(response.data.count);
      setCurrentPage(page);
      setReportingConfigs(response.data.results);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err);
    }
  };

  /**
   * Creates a new reporting configuration, then updates this list with the response.
   * Returns if there is an error.
   * @param {FormData} formData
   */
  const createConfig = async (formData) => {
    try {
      // Transform data to snake_case format
      const transformedData = snakeCaseFormData(formData);

      // Post the new configuration to the backend
      await LMSApiService.postNewReportingConfig(transformedData);

      // Determine the target page to navigate to
      const shouldAddNewPage = totalRecords % DEFAULT_PAGE_SIZE === 0 && totalRecords !== 0;
      const targetPage = shouldAddNewPage ? totalPages + 1 : totalPages;

      // Navigate to the appropriate page
      handlePageSelect(targetPage);

      // Close the new config form
      newConfigFormRef.current.close();

      return undefined;
    } catch (err) {
      return err;
    }
  };

  const deleteConfig = async (uuid) => {
    try {
      await LMSApiService.deleteReportingConfig(uuid);

      const isLastPage = currentPage === totalPages;
      const hasOneRecord = reportingConfigs.length === 1;
      const isOnlyRecordOnLastPage = hasOneRecord && isLastPage;

      if (isOnlyRecordOnLastPage && currentPage > 1) {
        handlePageSelect(totalPages - 1);
      } else {
        handlePageSelect(currentPage);
      }

      return undefined;
    } catch (err) {
      return err;
    }
  };

  /**
   * Updates an existing reporting configuration. Returns if there is an
   * error.
   * @param {FormData} formData
   * @param {string} uuid -> The uuid of the configuration we are updating
   */
  const updateConfig = async (formData, uuid) => {
    const transformedData = snakeCaseFormData(formData);
    try {
      const response = await LMSApiService.updateReportingConfig(transformedData, uuid);
      const updatedIndex = reportingConfigs
        .findIndex(config => config.uuid === response.data.uuid);
      const reportingConfigsCopy = [...reportingConfigs];
      reportingConfigsCopy[updatedIndex] = response.data;
      setReportingConfigs([...reportingConfigsCopy]);
      return undefined;
    } catch (err) {
      return err;
    }
  };

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
              data-testid="collapsible-trigger-reporting-config"
            >
              <ReportingConfigForm
                config={camelCaseObject(config)}
                updateConfig={updateConfig}
                createConfig={createConfig}
                deleteConfig={deleteConfig}
                availableCatalogs={camelCaseObject(availableCatalogs)}
                reportingConfigTypes={camelCaseObject(reportingConfigTypes)}
                enterpriseCustomerUuid={enterpriseId}
              />
            </Collapsible>
          </div>
        ))}

        {reportingConfigs && reportingConfigs.length > 0 && (
        <Pagination
          variant="reduced"
          onPageSelect={handlePageSelect}
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
          ref={newConfigFormRef}
        >
          <div>
            <ReportingConfigForm
              createConfig={createConfig}
              enterpriseCustomerUuid={enterpriseId}
              availableCatalogs={camelCaseObject(availableCatalogs)}
              reportingConfigTypes={camelCaseObject(reportingConfigTypes)}
            />
          </div>
        </Collapsible>
      </div>
    </main>
  );
};

ReportingConfig.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default ReportingConfig;
