====================================================================
11. Architectural Decision Record: Migrating to TypeScript over time
====================================================================

Status
------

Accepted (March 2025)

Context
-------
TypeScript is a strongly-typed superset of JavaScript, designed to address some of the shortcomings of JavaScript. By leveraging the strong typing features of the language, the contracts and data models of the codebase can be more thoroughly documented, and strong enforcement of those type contracts can help in detecting defects before release.

TypeScript can be readily added to an existing JavaScript codebase in a piecemeal fashion, both by adding TypeScript files (.ts) that will live alongside JavaScript files (.js), and by converting existing JavaScript files to TypeScript, but not adding type contracts immediately.

While TypeScript support has been accepted across the edX ecosystem (https://docs.openedx.org/projects/openedx-proposals/en/latest/best-practices/oep-0067/decisions/frontend/0008-typescript.html) and added to the ``frontend-app-admin-portal`` MFE, there haven't been any systematic efforts to migrate to using it, or guidance given to those who would like to leverage it as part of their regular feature work.

Decision
--------
Instead of doing an all-at-once migration of existing JavaScript code to TypeScript, we will instead prioritize implementing new code in TypeScript in a targeted fashion. 
			
While one can argue that TypeScript code is always an improvement over equivalent JavaScript code, due to providing more documentation and type safety, there are two important caveats.

1. Similar to any refactoring effort, there are always costs and risks involved in a migration from JavaScript to TypeScript.
2. TypeScript's type annotations provide more of a win in certain contexts than in others.  
			
With those caveats in mind, we will categorize different front-end coding contexts into High, Medium, and Low priorities as follows:
			
**High Priority**
    *API methods*
        One of the biggest black boxes in a front-end JavaScript codebase are the payloads we expect from querying external API's.  Using TypeScript, we can easily enumerate the schema for any API we need to call, without needing to reference an external codebase or documentation.
    *React Hooks/Context*
        Many of the React hooks in the codebase are wrappers around API methods, taking in multiple parameters to return complex objects.  TypeScript annotations are of great help when navigating hooks like these.
    *Utility Libraries*
            Having the type contracts of library methods helps in their reusability, particularly if they involve the manipulation of complex objects.
**Medium Priority**
    *React Components*
        PropTypes are a well-established practice in the codebase that deliver many of the benefits of TypeScript typing for React components.  However, TypeScript has a terser syntax, and better out of the box IDE tooling around detecting contract violations than PropTypes.  Regardless, it is useful to get type checking around the component's use of other TypeScript hooks/libraries.
**Low Priority**
    *Unit Tests*
        The benefits of TypeScript in unit tests, where contracts are less important, and issues tend to show themselves in immediate test failures, can be overshadowed by the costs of migrating.
        
Given the uneven benefits between these different contexts, the following are generally good rules of thumb for deciding whether to Build/Refactor in TypeScript, or leave as plain JavaScript
    *Implementing new files of High/Medium priority*
        Prefer to build in TypeScript, and specify all type contracts.
    *Revising old JavaScript files of High priority*
        Prefer to change file type to TypeScript, but only need to lay out type contracts in areas where code functionality is being changed at the time.
    *Revising old JavaScript files of Medium priority*
        Change file type to TypeScript if helpful (example: React component consuming a new hook), lay out type contracts only if contract signatures are changing.
    *Adding new JavaScript files of Low priority*
        Building in TypeScript optional.
    *Revising old JavaScript files of Low priority*
        Generally not worth the effort



Consequences
------------
This is not a mandate for blanket adoption, but a set of guiding principles, and as a consequence will only have effect if they are consciously adopted into individual and team best practices.  


Alternatives Considered
-----------------------
A forced migration to TypeScript was technically an option, but not seriously considered due to the very high up-front cost, and continuing high costs of any blanket mandate to write everything in TypeScript even where the benefits are marginal.