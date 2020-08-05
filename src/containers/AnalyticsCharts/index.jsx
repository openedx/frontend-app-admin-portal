import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import AnalyticsCharts from '../../components/Admin/AnalyticsCharts';

const mapStateToProps = state => ({
  // TODO: Add mapping
});

export default withRouter(connect(mapStateToProps)(AnalyticsCharts));
