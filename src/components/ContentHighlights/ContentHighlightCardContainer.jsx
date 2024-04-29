import React, { useContext } from 'react';
import { Stack } from '@edx/paragon';

import { useIntl } from '@edx/frontend-platform/i18n';
import { useHighlightSetsForCuration } from './data/hooks';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import HighlightSetSection from './HighlightSetSection';

const ContentHighlightCardContainer = () => {
  const { enterpriseCuration: { enterpriseCuration } } = useContext(EnterpriseAppContext);
  const highlightSets = useHighlightSetsForCuration(enterpriseCuration);
  const intl = useIntl();
  return (
    <Stack gap={4}>
      <HighlightSetSection
        title={intl.formatMessage({
          id: 'highlights.highlights.tab.highlight.section.published',
          defaultMessage: 'Published',
          description: 'Section title for published highlights',
        })}
        highlightSets={highlightSets.published}
      />
      <HighlightSetSection
        title={intl.formatMessage({
          id: 'highlights.highlights.tab.highlight.section.draft',
          defaultMessage: 'Drafts',
          description: 'Section title for draft highlights',
        })}
        highlightSets={highlightSets.draft}
      />
    </Stack>
  );
};

export default ContentHighlightCardContainer;
