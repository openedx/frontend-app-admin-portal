import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Container, Tabs, Tab } from '@edx/paragon';
import { camelCaseObject } from '@edx/frontend-platform';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import CurrentContentHighlights from './CurrentContentHighlights';
import ContentHighlightHelmet from './ContentHighlightHelmet';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { TAB_TITLES } from './data/constants';
import ContentHighlightCatalogVisibility from './CatalogVisibility/ContentHighlightCatalogVisibility';
import ZeroStateHighlights from './ZeroState';
import EVENT_NAMES from '../../eventTracking';

const ContentHighlightsDashboardBase = ({ children }) => (
  <Container className="my-5">
    <ContentHighlightHelmet title="Highlights" />
    {children}
  </Container>
);

ContentHighlightsDashboardBase.propTypes = {
  children: PropTypes.node.isRequired,
};

const ContentHighlightsDashboard = () => {
  const { enterpriseCuration: { enterpriseCuration } } = useContext(EnterpriseAppContext);
  const highlightSets = enterpriseCuration?.highlightSets;
  const [activeTab, setActiveTab] = useState(TAB_TITLES.highlights);
  const [isHighlightSetCreated, setIsHighlightSetCreated] = useState(false);
  const sendTrackEvent = (tab) => {
    const trackInfo = {
      active_tab: tab,
    };
    sendEnterpriseTrackEvent(
      enterpriseCuration.enterpriseCustomer,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.HIGHLIGHT_DASHBOARD_SELECT_TAB}`,
      trackInfo,
    );
  };
  useEffect(() => {
    if (highlightSets.length > 0) {
      setIsHighlightSetCreated(true);
    }
  }, [highlightSets]);
  return (
    <ContentHighlightsDashboardBase>
      <Tabs
        className="mb-4.5"
        activeKey={activeTab}
        onSelect={(tab) => {
          setActiveTab(tab);
          sendTrackEvent(tab);
        }}
      >
        <Tab
          eventKey={camelCaseObject(TAB_TITLES.highlights)}
          title={TAB_TITLES.highlights}
        >
          {isHighlightSetCreated ? <CurrentContentHighlights /> : <ZeroStateHighlights />}
        </Tab>
        <Tab
          eventKey={camelCaseObject(TAB_TITLES.catalogVisibility)}
          title={TAB_TITLES.catalogVisibility}
        >
          <ContentHighlightCatalogVisibility />
        </Tab>
      </Tabs>
    </ContentHighlightsDashboardBase>
  );
};

export default ContentHighlightsDashboard;
