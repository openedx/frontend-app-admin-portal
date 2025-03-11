========================================================
10. Architectural Decision Record: Algolia Search Filtering Migration
========================================================

Status
------

Accepted (March 2025)

Context
-------
We are transitioning from the legacy filtering system, which filters based on `enterprise_customer_uuids` and `enterprise_catalog_uuids`, to a new Algolia search filtering approach. This migration is being performed incrementally to ensure a smooth transition for all users.

Decision
--------
The existing filtering method, which relies on `enterprise_customer_uuids` and `enterprise_catalog_uuids`, will be deprecated immediately and marked as such in documentation and code. Eventually, it will be fully removed once 100% of usages of Algolia search have transitioned to the new filtering system.

Key Changes
-----------
- The legacy filtering functionality based on `enterprise_customer_uuids` and `enterprise_catalog_uuids` will remain available temporarily but is now marked as deprecated.
- Usages of Algolia search are encouraged to transition to the new filtering system as soon as possible.
- Once all usages of Algolia search have migrated, the legacy filtering method will be completely removed.
- The transition will be managed using a Waffle-based feature flag exposed via `enterpriseFeatures` from the LMS `/api/v1/enterprise-learner/` API, allowing gradual enablement of the new Algolia search filtering system.

Rationale
---------
- A gradual migration reduces risk and allows us to address any issues before full deprecation.
- Ensuring a clear transition path improves developer experience and minimizes disruption.
- The new Algolia search filtering system provides better performance, flexibility, and maintainability.

Consequences
------------
**Short-term:**
- Legacy filtering based on `enterprise_customer_uuids` and `enterprise_catalog_uuids` will still be available but should no longer be used for new implementations.

**Long-term:**
- The legacy filtering will be removed entirely, requiring all consumers to use the new Algolia search filtering system with the secured Algolia API key.

Next Steps
-----------
1. Update internal documentation to reflect the changed approach in Algolia filtering within the Enterprise Learner and Admin Portal.
2. Monitor rollout and adoption via Datadog (e.g., errors, performance, etc.).
3. Gradually enable the new Algolia search filtering system using the Waffle-based feature flag via `enterpriseFeatures`.
4. Fully remove the legacy filtering once the migration is complete.
