import React, { useContext } from 'react';
import { Stack } from '@openedx/paragon';

import { useHighlightSetsForCuration } from './data/hooks';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import HighlightSetSection from './HighlightSetSection';

const ContentHighlightCardContainer = () => {
  const { enterpriseCuration: { enterpriseCuration } } = useContext(EnterpriseAppContext);
  const highlightSets = useHighlightSetsForCuration(enterpriseCuration);
  return (
    <Stack gap={4}>
      <HighlightSetSection
        title="Published"
        highlightSets={highlightSets.published}
      />
      <HighlightSetSection
        title="Drafts"
        highlightSets={highlightSets.draft}
      />
    </Stack>
  );
};

export default ContentHighlightCardContainer;
