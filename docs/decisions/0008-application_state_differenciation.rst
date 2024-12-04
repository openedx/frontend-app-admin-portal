8. Intentional separation between local application state and API data state using ``@tanstack/react-query``
============================================================================================================

Status
******

Accepted  (January 2024)

Context
*******

The ``frontend-app-admin-portal`` currently implements ``@tanstack/react-query`` predominantly within the ``learner-credit-management`` feature. ``@tanstack/react-query`` is a tool used to manage server state in react applications.

See `0006-tanstack-react-query ADR <https://github.com/openedx/frontend-app-admin-portal/blob/master/docs/decisions/0006-tanstack-react-query.rst>`_ for more information

As part of its implementation, a pattern has emerged of API data from the ``react-query`` output from ``useQuery`` is being populated within context providers. This has resulted in the unintended consequence of component re-renders when the top-level component context data is updated with the latest data from the ``useQuery`` output.

The re-fetch behavior of ``react-query`` results in components that aren't dependent on the updated context data to re-render.

The re-fetch behavior was occurring in the background of a component while the user is interacting with the page or if they had returned focus back onto the browser while interacting with other tabs or applications.

An example where populating context data from ``react-query`` output data data resulted in unintentional behavior is the ``EnterpriseSubsidiesContext`` containing API data from the query key 'learner-credit-management.budgets', ``isFetchingBudgets`` attribute which has since been fixed.

While the user was interacting with a ``FullscreenModal`` component and had not completed their intended activity within the modal before the global ``staleTime`` had expired, the re-fetch behavior would trigger resulting in a re-render of all components at the same component tree lvel and below, thus closing the modal without saving the users state information (form data etc.).

Decisions
*********

We will take a more intentional approach when implementing API data fetching using the ``react-query`` in the following ways:

#. Avoid adding API data fetched using ``react-query`` to a context layer along with related lifecycle state data related to ``useQuery``. See the `useQuery documentation <https://tanstack.com/query/v4/docs/react/reference/useQuery>`_ for more information
    * If a context layer does require API data to exist in the context layer, it is not recommended to use ``react-query`` to retrieve the data
#. When using ``useQuery`` implement its usage within the component that uses the returned response data
    * Because the output data is already cached, there is no need to add to the context makes it redundant
#. Leverage the `query key factory <https://github.com/openedx/frontend-app-admin-portal/blob/c67c5e4d8a0328fe75cb9d46791a8b733fad8257/src/components/learner-credit-management/data/constants.js#L67-L77>`_ pattern to simplify boilerplate code when making the `useQuery` calls and `invalidateQueries`
#. Implement a hook when calling the ``useQuery`` method to avoid duplicate code and easy maintainability. See this `hook <https://github.com/openedx/frontend-app-admin-portal/blob/c67c5e4d8a0328fe75cb9d46791a8b733fad8257/src/components/EnterpriseSubsidiesContext/data/hooks.js#L108-L120>`_ as boilerplate as an example, there are `others to reference in the repo <https://github.com/search?q=repo%3Aopenedx%2Ffrontend-app-admin-portal+%2FuseQuery%5C%28%2F&type=code>`_ as additional guides
#. Invalidate queries or update the the query state when user interaction results in an API data change to avoid stale data
    * If the query is not invalidated, the re-fetching of the data is entirely dependent on the length of time set for the ``staleTime``
    * We can also leverage optimistic updates to set the query state within a ``useMutation`` hook. See `here <https://tanstack.com/query/v4/docs/react/guides/optimistic-updates>`_ for more information

Consequences
************

Based on the call you're making, it may be challenging to coalesce all the required metadata required to make a ```useQuery``.

When writing tests for a hook that leverages useQuery, certain boilerplate code is required. The important fact to highlight is the necessity of wrapping your test component in a ``QueryClientProvider`` component to adequately test the component.
Below is an example of how writing tests with a useQuery directly in the component in the form of a hook, where the ``props`` of the component come from the ``portalConfiguration``.

Note that the ``queryClient`` is a test utility function that populates the ``QueryClientProvider`` client prop. See its implementation `here <https://github.com/openedx/frontend-app-admin-portal/blob/c67c5e4d8a0328fe75cb9d46791a8b733fad8257/src/components/test/testUtils.jsx#L47-L56>`_

.. code-block:: javascript

    import { QueryClientProvider } from '@tanstack/react-query';
    import { queryClient } from '../../test/testUtils';
    import { Provider } from 'react-redux';
    import configureMockStore from 'redux-mock-store';
    import thunk from 'redux-thunk';

    // Configure the portal configuration used in the Provider
    const mockStore = configureMockStore([thunk]);
    const getMockStore = store => mockStore(store);
    const initialStore = {
      portalConfiguration: {
        enterpriseId: 'test-id',
        enterpriseFeatures: {},
        enablePortalLearnerCreditManagementScreen: true,
      },
    };

    // Create your component wrapper
    const TestComponentWrapper = () => (
      <QueryClientProvider client={queryClient()}>
        <Provider store={store}>
            <TestComponent />
        </Provider>
      </QueryClientProvider>
    );


Alternatives Considered
***********************

Other alternatives to were to selectively disable the re-fetch behavior on API calls, or increase the global ``staleTime`` to a longer interval to avoid the re-render disrupting the user experience.
Another solution would be to use context selectors to reduce the effect of components unintentionally re-rendering by specifically re-rendering only the related context we were referencing.
