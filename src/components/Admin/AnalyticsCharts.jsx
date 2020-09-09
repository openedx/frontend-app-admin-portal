import React from 'react';

import TableauReport from 'tableau-react-embed';


class AnalyticsCharts extends React.Component {
  render() {
    const filters = {
      Segment: ['Consumer'], // Filter could be enterprise uuid
    };
    return (
      <React.Fragment>
        <div
          className="col-xs-12 col-md-6 col-xl-3 mb-3"
          key="inProgress"
        >
          <TableauReport
            url="http://moconnell1453.sandbox.edx.org:8000/views/Superstore/Forecast"
            token="3-ixWDeRRIaf-L-6r8z33Q==:D5hFrFvRkz750Z7DuAIcfs6u"
            filters={filters}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default AnalyticsCharts;
