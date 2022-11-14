import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Container } from '@edx/paragon';
import ZeroStateHighlights from './ZeroState';
import CurrentContentHighlights from './CurrentContentHighlights';
import ContentHighlightHelmet from './ContentHighlightHelmet';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';

const ContentHighlightsDashboardBase = ({ children }) => (
  <Container fluid className="my-5">
    <ContentHighlightHelmet title="Highlights" />
    {children}
  </Container>
);

ContentHighlightsDashboardBase.propTypes = {
  children: PropTypes.node.isRequired,
};

const ContentHighlightsDashboard = () => {
  const { enterpriseCuration } = useContext(EnterpriseAppContext);
  const highlightSets = enterpriseCuration.enterpriseCuration?.highlightSets;
  const hasContentHighlights = highlightSets?.length > 0;

  if (!hasContentHighlights) {
    return (
      <ContentHighlightsDashboardBase>
        <ZeroStateHighlights />
      </ContentHighlightsDashboardBase>
    );
  }

  return (
    <ContentHighlightsDashboardBase>
      <CurrentContentHighlights />
    </ContentHighlightsDashboardBase>
  );
};

export default ContentHighlightsDashboard;
