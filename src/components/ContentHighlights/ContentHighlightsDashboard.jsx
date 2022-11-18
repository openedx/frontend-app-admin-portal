import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { Container, Toast } from '@edx/paragon';

import ZeroStateHighlights from './ZeroState';
import CurrentContentHighlights from './CurrentContentHighlights';
import ContentHighlightHelmet from './ContentHighlightHelmet';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';

function ContentHighlightsDashboardBase({ children }) {
  const history = useHistory();
  const { location } = history;
  const { state: locationState } = location;

  const [hasDeletedHighlightSetToast, setHasDeletedHighlightSetToast] = useState(false);

  // TODO: the below `useEffect` needs test coverage. deferred until there is a reducer
  // for the `ContentHighlights` module, where `DeleteHighlightSet` can dispatch an action
  // to trigger the `Toast`, rather than relying on history's location state.
  /* istanbul ignore next */
  useEffect(() => {
    if (!locationState?.deletedHighlightSet) {
      return;
    }
    setHasDeletedHighlightSetToast(true);
    const newState = { ...locationState };
    delete newState.deletedHighlightSet;
    history.replace({ ...location, state: newState });
  }, [history, location, locationState]);

  return (
    <Container fluid className="my-5">
      <ContentHighlightHelmet title="Highlights" />
      {children}
      <Toast
        onClose={() => setHasDeletedHighlightSetToast(false)}
        show={hasDeletedHighlightSetToast}
      >
        Highlight collection deleted.
      </Toast>
    </Container>
  );
}

ContentHighlightsDashboardBase.propTypes = {
  children: PropTypes.node.isRequired,
};

function ContentHighlightsDashboard() {
  const { enterpriseCuration: { enterpriseCuration } } = useContext(EnterpriseAppContext);
  const highlightSets = enterpriseCuration?.highlightSets;
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
}

export default ContentHighlightsDashboard;
