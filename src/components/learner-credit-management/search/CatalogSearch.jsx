import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch-dom';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { SearchHeader } from '@edx/frontend-enterprise-catalog-search';

import { configuration } from '../../../config';
import CatalogSearchResults from './CatalogSearchResults';
import {
  ENABLE_TESTING, SEARCH_RESULT_PAGE_SIZE, useBudgetId, useEnterpriseGroup, useSubsidyAccessPolicy,
} from '../data';

const CatalogSearch = () => {
  const searchClient = algoliasearch(configuration.ALGOLIA.APP_ID, configuration.ALGOLIA.SEARCH_API_KEY);
  const { subsidyAccessPolicyId } = useBudgetId();
  const {
    data: subsidyAccessPolicy,
  } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const searchFilters = `enterprise_catalog_uuids:${ENABLE_TESTING(subsidyAccessPolicy.catalogUuid)} AND content_type:course`;

  const { data: { appliesToAllContexts } } = useEnterpriseGroup(subsidyAccessPolicy);
  const showSubtitle = subsidyAccessPolicy?.groupAssociations?.length > 0 && !appliesToAllContexts;

  return (
    <section>
      {(
        subsidyAccessPolicy.displayName ? (
          <FormattedMessage
            id="catalogs.enterpriseCatalogs.header.subsidyAccessPolicyName"
            defaultMessage="{subsidyAccessPolicyName} catalog"
            description="Search dialogue message with subsidy access policy name."
            tagName="h3"
            values={{ subsidyAccessPolicyName: subsidyAccessPolicy.displayName }}
          />
        ) : (
          <FormattedMessage
            id="catalogs.enterpriseCatalogs.header"
            defaultMessage="Overview"
            description="Search dialogue."
            tagName="h3"
          />
        )
      )}
      {showSubtitle && (
        <p>Members of this budget will be able to browse and enroll the content in this catalog.</p>
      )}
      <InstantSearch indexName={configuration.ALGOLIA.INDEX_NAME} searchClient={searchClient}>
        <div className="enterprise-catalogs-header">
          <Configure
            filters={searchFilters}
            facetingAfterDistinct
            hitsPerPage={SEARCH_RESULT_PAGE_SIZE}
          />
          <SearchHeader
            hideTitle
            variant="default"
            disableSuggestionRedirect
          />
        </div>
        <CatalogSearchResults />
      </InstantSearch>
    </section>
  );
};

export default CatalogSearch;
