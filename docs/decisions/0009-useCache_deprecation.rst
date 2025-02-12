9. Deprecation of `useCache` option
===================================

Status
******

Accepted

Context
*******

Frontend platform offers a variety of helpers to facilitate API calls to our backend services. Part of their suite of
helper functions are `getAuthenticatedHttpClient` which allows a `useCache` option. The inclusion of the `useCache` option
treats the original `getAuthenticatedHttpClient` as a `cachedAuthenticatedHttpClient`(`src <https://github.com/openedx/frontend-platform/blob/15ef507e41127b4fd4ace5d31f7e527381678572/src/auth/AxiosJwtAuthService.js#L111-L117>`_).
This has the effect of modifying the headers of the API request to our backend service. Within the the
`Access-Control-Request-Headers` preflight request or OPTIONS call, the inclusion of `useCache` resulted in the
`Cache-Control` header also being sent resulting in an unresolved API response and breaking usability for certain
components that depended on the upstream data.

Decision
********

Deprecate the usage of `useCache` within `getAuthenticatedHttpClient` to avoid inadvertently modifying the expected
request headers to our backend services. For instances where client side caching of API calls is necessary, use
`React Query <https://tanstack.com/query/v4/docs/framework/react/overview>`_ when constructing the API call. There are
several examples that currently reside in our enterprise MFEs that
`effectively leverage <https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/master/src/components/app/data/hooks/useBFF.js>`_ React Query, and the
usage of `query keys <https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/master/src/components/app/data/queries/queryKeyFactory.js>`_ and
`helpers <https://github.com/openedx/frontend-app-learner-portal-enterprise/tree/master/src/components/app/data/queries>`_.


Consequences
************

This will in the intermediary remove any client side caching facilitated by the `useCache` option. But should intentionally
be updated with a React Query implementation to maintain the benefits of client side caching. In the meantime, the backend
services cache will suffice

Alternatives Considered
***********************
The underlying package, `frontend-platform`, which depended on the breaking package upgrade, `Axios`, was downgraded as part of resolving
issues related to the `useCache` field. It was determined that the `useCache` field was primarily used in enterprise, so
it made the most sense to remove the `useCache` field in favor of introducing tools like `React Query` for client side
caching.
