### Make Paragon changes and test locally

* [ ] Create Paragon ticket on PAR board, and link it to the ticket in your team board.
* [ ] Check Paragon development docs on how to add and test a component locally. This step does not need module.config.js file yet.
* [ ] Share screenshots/UX changes from local Paragon showcase page to UX or Product before committing full changes to ensure Acceptance Criteria met
* [ ] Mobile friendly? Tested on smaller screens for responsiveness
* [ ] a11y friendly. Run one of the a11y tools against the UI (axe, ARC toolkit are some options)
* [ ] Test the Paragon change locally against this MFE application by creating a module.config.js file that looks similar to this  - TODO GUIDE LINK

### Release Paragon new release

* [ ] Share PR for Paragon in #paragon-working-group or #fedx channels
* [ ] Release new version of Paragon using the [Paragon documentation](https://github.com/edx/paragon#semantic-release) as guide

### Pull Paragon into this MFE repository and test locally

* [ ] Update Paragon package dependencies  - TODO GUIDE LINK
* [ ] Re-test your application with the module.config.js in place  - TODO GUIDE LINK
* [ ] If applicable, test against edX custom brand ( not all work needs this ) - TODO GUIDE LINK

### Release changes in MFE
* [ ] As usual, MFE has been released with Paragon changes into staging
* [ ] Verify from staging, and inform UX / product of staging links if necessary
* [ ] Release MFE to production
