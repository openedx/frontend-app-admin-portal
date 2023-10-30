6. Adopting ``@tanstack/react-query`` for data fetching and client-side caching
=============================================================================

Status
******

Accepted (October 2023)

Context
*******

The ``frontend-app-admin-portal`` MFE currently relies on custom state variables when integrating with an API (e.g., managing loading states). As a result, there is generally a fair amount of boilerplate involved with each API integration. Additionally, the current approach does not provide any client-side caching out-of-the-box or any other best-in-class features like automatic query retries, which can lead to heavy reliance on approaches such as React Context or Redux in order to pass data returned by asynchronous API calls throughout the application.

The existing approach of heavily relying on React Context providers has resulted in many nested context providers that can make it difficult for contributors to understand what data is available to them from which context provider. Additionally, the reliance on context providers means accepting some performance risk that all components nested under a context provider will re-render whenever any value within the context provider changes, which can lead to performance issues if the context provider is wrapping a large number of components if not mitigated with techniques like ``React.memo``, ``useMemo``, or context selectors.

Decisions
*********

We will instead rely on ``@tanstack/react-query`` for data fetching and client-side caching. This library provides a number of benefits over the existing approach, including:

* Using ``@tanstack/react-query`` will allow us to avoid writing a significant amount of boilerplate code that is currently required to integrate with an API. We can rely on the library to handle loading states, error states, and other common API integration concerns.
* Flexible client-side caching, which will allow us to avoid using custom caching logic provided by ``@edx/frontend-platform``, which is not as full-featured.
* A number of other features out-of-the-box, including automatic query retries on failed network requests, which will allow us to avoid writing custom logic to handle these scenarios.
* Using ``@tanstack/react-query`` will allow us to avoid relying on React Context providers to pass data returned by asynchronous API calls throughout the application. Instead, we can rely on the library to handle this for us via custom hooks. For example, calling ``useQuery`` twice within the rendering lifecycle will not result in duplicate API calls. Instead, the library will first make the initial network call and then store its response in a client-side cache. The second call to ``useQuery`` will then return the cached response instead of making a duplicate network call. The cache invalidation is customizable globally for the application or by query.


We will adopt query key factories to manage the implementation of query keys such that cache invalidation for independent features (e.g., Learner Credit Management) can be managed with adequate granularity. For example:

::

  // Query Key Factory
  export const learnerCreditManagementQueryKeys = {
    all: ['learner-credit-management'],
    budgets: () => [...learnerCreditManagementQueryKeys.all, 'budgets'],
    budget: (budgetId) => [...learnerCreditManagementQueryKeys.all, 'budget', budgetId],
    budgetActivity: (budgetId) => [...learnerCreditManagementQueryKeys.budget(budgetId), 'activity'],
    budgetActivityOverview: (budgetId) => [...learnerCreditManagementQueryKeys.budgetActivity(budgetId), 'overview'],
  };

By having a query key factory as suggested above, contributors may have a structured way to manage query keys for a given feature. This approach enabled granular control over cache invalidation, query prefetching, etc. Using the above example, one could invalidate the query cache for the entire ``['learner-credit-management']`` feature or opt to only invalidate the query cache for specific individual queries or even groups of queries:

::

  // Remove everything related to the learner credit management feature
  queryClient.removeQueries({
    queryKey: learnerCreditManagementQueryKeys.all,
  })

  // Invalidate all queries supporting the budget detail page route
  queryClient.invalidateQueries({
    queryKey: learnerCreditManagementQueryKeys.budget(budgetId),
  })

  // Invalidate the budget detail page route's activity tab's overview query
  queryClient.invalidateQueries({
    queryKey: learnerCreditManagementQueryKeys.budgetActivityOverview(budgetId),
  })

The recommendation for new asynchronous network calls moving forward is to use ``@tanstack/react-query``. Additionally, it's recommended to incrementally migrate existing network calls to use ``@tanstack/react-query``. This will allow us to avoid a large refactoring effort and instead migrate to the library over time as we touch existing network calls.

Consequences
************

The entire application is wrapped within ``QueryClientProvider``, which contains a default configuration to at least extend the ``staleTime`` to be 20 seconds. This change in default behavior is to enable the use of ``@tanstack/react-query`` as a state manager. Instead of queries becoming instantly stale after success (i.e., ``staleTime: 0``) where network calls would be re-fetched on all window refocuses and component mounts, etc., having a ``staleTime`` of 20 seconds will keep the data fresh for 20 seconds before the query becomes stale, preventing unnecessary API calls (e.g., when calling duplicate ``useQuery`` hooks in the same rendering lifecycle).

By adopting ``@tanstack/react-query``, by default, queries made with ``useQuery`` will have some automatic background refetching behavior baked in. It's recommended to consider whether any specific queries should override/extend the default options provided by the library. For example, some specific queries may not want the automatic refetches, etc. that are provided by default.

Alternatives Considered
***********************

* In order to enable the same pattern of relying on ``@tanstack/react-query`` as a state manager to avoid additional context providers, it was considered whether we could make heavier use of the client-side caching provided by ``@edx/frontend-platform``. This was decided against as it is not as full-featured as ``@tanstack/react-query`` when it comes to caching alone. Additionally, it does not provide any other features that are provided by ``@tanstack/react-query``, which will enable more efficient API integrations moving forward.
