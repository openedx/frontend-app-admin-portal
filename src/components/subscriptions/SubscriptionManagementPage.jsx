import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Container, Tabs, Tab } from '@edx/paragon';
import {
  Switch,
  Route,
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom';
import moment from 'moment';

import Hero from '../Hero';
import SubscriptionData from './SubscriptionData';
import MultipleSubscriptionsPage from './MultipleSubscriptionsPage';
import SubscriptionDetailPage from './SubscriptionDetailPage';
import SubscriptionSubsidyRequests from './SubscriptionSubsidyRequests';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';

const PAGE_TITLE = 'Subscription Management';

function SubscriptionManagementPage({ enterpriseId }) {
  const { pathname } = useLocation();
  const history = useHistory();
  const params = useParams();
  const [key, setKey] = React.useState('learners');

  const handleTabSelect = (tabKey) => {
    console.log('handleTabSelect', pathname, tabKey);
    setKey(tabKey);
    history.push(`/${pathname}/enrollment-requests`);
  };

  return (
    <SubscriptionData enterpriseId={enterpriseId}>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <main role="main" className="manage-subscription">
        <Container className="py-3" fluid>
          <Switch>
            <Tabs
              id="controlled-tab-example"
              activeKey={key}
              onSelect={handleTabSelect}
            >
              <Tab eventKey="learners" title="Manage Learners" className="pt-4">
                <Route
                  path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}`}
                  render={routeProps => (
                    <MultipleSubscriptionsPage
                      {...routeProps}
                      createActions={(subscription) => {
                        const { params: { enterpriseSlug } } = routeProps.match;
                        const now = moment();
                        const isScheduled = now.isBefore(subscription.startDate);
                        const isExpired = now.isAfter(subscription.expirationDate);
                        const buttonText = `${isExpired ? 'View' : 'Manage'} learners`;
                        const buttonVariant = isExpired ? 'outline-primary' : 'primary';

                        const actions = [];

                        if (!isScheduled) {
                          actions.push({
                            variant: buttonVariant,
                            to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${subscription.uuid}`,
                            buttonText,
                          });
                        }

                        return actions;
                      }}
                    />
                  )}
                  exact
                />
              </Tab>
              <Tab eventKey="requests" title="Manage Requests" className="pt-4">
                <Route
                  path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}/enrollment-requests`}
                  component={SubscriptionSubsidyRequests}
                  exact
                />
              </Tab>
            </Tabs>
            {/* <Route
              path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}/:subscriptionUUID`}
              component={SubscriptionDetailPage}
              exact
            /> */}
          </Switch>
        </Container>
      </main>
    </SubscriptionData>
  );
}

SubscriptionManagementPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SubscriptionManagementPage);
