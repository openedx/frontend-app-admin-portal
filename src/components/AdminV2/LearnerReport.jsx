import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  FormattedDate, FormattedMessage, useIntl,
} from '@edx/frontend-platform/i18n';
import { Tabs, Tab } from '@openedx/paragon';

import { formatTimestamp } from '../../utils';
import AdminSearchForm from './AdminSearchForm';
import ModuleActivityReport from './tabs/ModuleActivityReport';

const LearnerReport = ({
  tableMetadata,
  actionSlug,
  filtersActive,
  lastUpdatedDate,
  renderUrlResetButton,
  renderFiltersResetButton,
  error,
  loading,
  location,
  hasEmptyData,
  renderDownloadButton,
  displaySearchBar,
  searchParams,
  searchEnrollmentsList,
  getTableData,
  budgets,
  groups,
  enterpriseId,
  csvErrorMessage,
  renderCsvErrorMessage,
}) => {
  const [activeTab, setActiveTab] = useState('learner-progress-report');
  const fullReportRef = useRef(null);
  const [navigateToReport, setNavigateToReport] = useState(location?.hash === '#fullreport');

  const intl = useIntl();

  // Scroll to report section if #fullreport in url
  useEffect(() => {
    const element = fullReportRef.current;
    if (element && navigateToReport) {
      element.scrollIntoView();
      setNavigateToReport(false);
    }
  }, [navigateToReport]);

  return (
    <>
      <div className="row" id="learner-progress-report">
        <div className="col">
          <div className="row">
            <div className="col-12 col-md-3 col-xl-2 mb-2 mb-md-0">
              <h2 className="table-title" ref={fullReportRef}>{tableMetadata.title}</h2>
            </div>
            <div className="col-12 col-md-9 col-xl-10 mb-2 mb-md-0 mt-0 mt-md-1">
              {actionSlug && renderUrlResetButton()}
              {filtersActive && renderFiltersResetButton()}
            </div>
          </div>
          <div className="row">
            <div className="col">
              {tableMetadata.subtitle && <h3>{tableMetadata.subtitle}</h3>}
              {tableMetadata.description && <p>{tableMetadata.description}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="col-12 col-md-6  col-xl-4 pt-1 pb-3">
          {lastUpdatedDate
            && (
              <FormattedMessage
                id="admin.portal.lpr.data.refreshed.date.message"
                defaultMessage="Showing data as of {timestamp}"
                description="Message to show the last updated date of the data on lpr page"
                values={{
                  timestamp: <FormattedDate
                    value={formatTimestamp({ timestamp: lastUpdatedDate })}
                    year="numeric"
                    month="long"
                    day="numeric"
                  />,
                }}
              />
            )}
        </div>
        <Tabs
          variant="tabs"
          activeKey={activeTab}
          onSelect={(tab) => {
            setActiveTab(tab);
          }}
        >
          <Tab
            eventKey="learner-progress-report"
            title={intl.formatMessage({
              id: 'adminPortal.lpr.tab.learnerProgressReport.title',
              defaultMessage: 'Learner Progress Report',
              description: 'Title for the learner progress report tab in admin portal.',
            })}
          >
            <div className="row">
              <div className="col">
                {!error && !loading && !hasEmptyData() && (
                  <>
                    <div className="row pb-3 mt-2">
                      <div className="col-12 col-md-12 col-xl-12">
                        {renderDownloadButton()}
                      </div>
                    </div>
                    {displaySearchBar() && (
                      <AdminSearchForm
                        searchParams={searchParams}
                        searchEnrollmentsList={() => searchEnrollmentsList()}
                        tableData={getTableData() ? getTableData().results : []}
                        budgets={budgets}
                        groups={groups}
                        enterpriseId={enterpriseId}
                      />
                    )}
                  </>
                )}
                {csvErrorMessage && renderCsvErrorMessage(csvErrorMessage)}
                <div className="mt-3 mb-5">
                  {enterpriseId && tableMetadata.component}
                </div>
              </div>
            </div>
          </Tab>
          <Tab
            eventKey="module-activity"
            title={intl.formatMessage({
              id: 'adminPortal.lpr.tab.moduleActivity.title',
              defaultMessage: 'Module Activity (Executive Education)',
              description: 'Title for the module activity tab in admin portal.',
            })}
          >
            <div className="mt-3">
              <ModuleActivityReport enterpriseId={enterpriseId} />
            </div>
          </Tab>
        </Tabs>
      </div>
    </>
  );
};

LearnerReport.defaultProps = {
  fullReportRef: null,
  actionSlug: null,
  filtersActive: false,
  lastUpdatedDate: null,
  error: null,
  loading: false,
  location: {
    search: '',
  },
  budgets: [],
  groups: [],
  enterpriseId: null,
  csvErrorMessage: null,
  searchParams: {
    searchQuery: '',
    searchCourseQuery: '',
    searchDateQuery: '',
    searchBudgetQuery: '',
    searchGroupQuery: '',
  },
  tableMetadata: {
    title: '',
    subtitle: '',
    description: '',
    component: null,
  },
};

LearnerReport.propTypes = {
  fullReportRef: PropTypes.shape({}),
  tableMetadata: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    description: PropTypes.string,
    component: PropTypes.node,
    csvFetchMethod: PropTypes.func,
    csvButtonId: PropTypes.string,
  }),
  actionSlug: PropTypes.string,
  filtersActive: PropTypes.bool,
  lastUpdatedDate: PropTypes.string,
  renderUrlResetButton: PropTypes.func.isRequired,
  renderFiltersResetButton: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Error),
  loading: PropTypes.bool,
  location: PropTypes.shape({
    search: PropTypes.string,
    pathname: PropTypes.string,
    hash: PropTypes.string,
  }),
  hasEmptyData: PropTypes.func.isRequired,
  renderDownloadButton: PropTypes.func.isRequired,
  displaySearchBar: PropTypes.func.isRequired,
  searchParams: PropTypes.shape({
    searchQuery: PropTypes.string,
    searchCourseQuery: PropTypes.string,
    searchDateQuery: PropTypes.string,
    searchBudgetQuery: PropTypes.string,
    searchGroupQuery: PropTypes.string,
  }),
  searchEnrollmentsList: PropTypes.func.isRequired,
  getTableData: PropTypes.func.isRequired,
  budgets: PropTypes.arrayOf(PropTypes.shape({})),
  groups: PropTypes.arrayOf(PropTypes.shape({})),
  enterpriseId: PropTypes.string,
  csvErrorMessage: PropTypes.string,
  renderCsvErrorMessage: PropTypes.func.isRequired,
};

export default LearnerReport;
