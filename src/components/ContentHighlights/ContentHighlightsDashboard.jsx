import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Container, Tabs, Tab } from '@edx/paragon';
import { camelCaseObject } from '@edx/frontend-platform';
import CurrentContentHighlights from './CurrentContentHighlights';
import ContentHighlightHelmet from './ContentHighlightHelmet';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { TAB_TITLES } from './data/constants';
import ContentHighlightCatalogVisibility from './CatalogVisibility/ContentHighlightCatalogVisibility';
import ZeroStateHighlights from './ZeroState';

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
        onSelect={setActiveTab}
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
