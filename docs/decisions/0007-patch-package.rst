7. Utilizing ``patch-package`` for temporary fixes in third-party dependencies
==============================================================================

Status
******

Accepted (November 2023)

Context
*******

The ``frontend-app-admin-portal`` repository is currently blocked on upgrading to the latest version of ``@edx/paragon`` until the React, React Router, ``@edx/frontend-platform``, etc. packages are upgraded first. Given this, we cannot rely on upstream fixes to ``@edx/paragon`` for bugs or security issues.

There is at least one opportunity identified where there is a bug within Paragon's ``DataTable`` component, where the "Select all X" label's count is inaccurate when one or more rows are selected, with or without filters applied, using the ``DataTable.ControlledSelect*`` sub-components. A separate bug issue was filed upstream to the Paragon repository, but given ``frontend-app-admin-portal`` is blocked on a Paragon upgrade, we can turn to ``patch-package`` to temporarily fix the issue locally within this repository itself.

``patch-package``
-----------------

``patch-package`` is an NPM package that allows one to modify third-party dependencies' code within ``node_modules``, and persist the patch so it's applied for other developers and within CI (i.e., anytime ``npm install`` is executed).

By creating a temporary, committed patch file for ``@edx/paragon``, we can resolve the aforementioned "Select all X" label's inaccurate count without needing an upstream fix or upgrading to the latest version of ``@edx/paragon``.

Decisions
*********

We will use ``patch-package`` to temporarily create a patch of Paragon's ``DataTable`` component to shows the correct number in the "Select all X" label count until we can upgrade to the latest version of Paragon containing a fix for this issue.

We will keep the ``patch-package`` devDependency installed and running in the ``postinstall`` NPM script. However, we should only reach for ``patch-package`` when necessary, and should not use it as a crutch for not upgrading to the latest version of a dependency or making a contribution to the upstream third-party dependency (e.g., ``@edx/paragon``).

Consequences
************

* The generated patch file is versioned to the currently installed version of the patched dependency. If the installed version of the patched dependency changes, the patch file's version may need to be updated as well by ensuring the local package changes still function as expected and then generating the patch file (i.e., ``npx patch-package @edx/paragon``).
* Because code changes made in a generated patch are applied after ``npm install``, the changes in the patch should apply to unit and integration tests within this repository (i.e., the patch changes should be testable).


Alternatives Considered
***********************

* Implement a fix upstream in ``@edx/paragon`` and then upgrade to the latest versions of React, React Router, ``@edx/frontend-platform``, etc. in order to unblock the upgrade to the latest Paragon version. This was rejected because it would take focus off of the critical path of feature release with an impending deadline.
* Replicate a large portion of the Paragon code (i.e., ``SelectionStatusComponent``) into ``frontend-app-admin-portal`` to temporarily remove the "Select all X" label from the ``DataTable``. This was rejected because the "Select all X" functionality is intended to be there to make it easier to work with bulk actions on the table. Without "Select all X" functionality, users would need to manually paginate and select through each individual page which is not a good user experience.
* Do nothing. This was rejected as the state of the world without a fix leaves a known bug fix that causes usability issues and user confusion.
