8. Intentional separation between local application state and API data state using ``@tanstack/react-query``
============================================================================================================

Status
******

Accepted  (January 2024)

Context
*******

The ``frontend-app-admin-portal`` currently implements ``@tanstack/react-query`` predominantly within the ``learner-credit-management`` feature. ``@tanstack/react-query`` is a tool used to manage server state in react applications.

See `0006-tanstack-react-query ADR <https://github.com/openedx/frontend-app-admin-portal/blob/master/docs/decisions/0006-tanstack-react-query.rst>`_ for more information

As part of its implementation, a pattern has emerged of API data from the react-query cache is being populated within context providers. This has resulted in the unintended consequence of page refreshes when the top-level component context data is updated with the latest data from the ``react-query`` cache.

The re-fetch behavior of ``react-query`` results in page components that aren't dependent on the updated context data to reload.

The re-fetch behavior was occurring in the background of a component while the user is interacting with the page or if they had returned focus back onto the browser while interacting with other tabs or applications.

An example where populating context data from ``react-query`` cache data resulted in unintentional behavior is the ``EnterpriseSubsidiesContext`` containing API data from the query key 'learner-credit-management.budgets', ``isFetchingBudgets`` attribute which has since been fixed.

While the user was interacting with a ``FullscreenModal`` component and had not completed their intended activity within the modal before the global ``staleTime`` had expired, the re-fetch behavior would trigger resulting in a full page re-load, thus closing the modal without saving the users state information (form data etc.).

Decisions
*********

We will take a more intentional approach when implementing API data fetching using the ``react-query`` in the following ways:

* Avoid adding API data fetched using ``react-query`` to a context layer
    * If a context layer does require API data to exist in the context layer, do not use ``react-query`` to retrieve the data
* When using ``react-query`` make the call as close to the component that uses the returned response data
    * This may require mapping a component from the parent component which completes the API call
* Invalidate queries when user interaction results in an API data change to avoid stale data

Consequences
************

test

Alternatives Considered
***********************

The alternative
