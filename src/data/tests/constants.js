import algoliasearch from 'algoliasearch/lite';
import { configuration } from '../../config';

export const TEST_ENTERPRISE_ID = 'test-enterprise-id';
export const TEST_ENTERPRISE_NAME = 'Test Enterprise';
export const TEST_ENTERPRISE_SLUG = 'test-enterprise-slug';

// Algolia searchClient for
export const searchClient = algoliasearch(
  configuration.ALGOLIA_APP_ID,
  configuration.ALGOLIA_SEARCH_KEY,
);
