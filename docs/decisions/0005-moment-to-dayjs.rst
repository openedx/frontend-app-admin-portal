5. Replacing Moment.js library with Day.js
============================================================

Status
******

In progress

Context
*******

Moment.js is a widely used time and date library, but the creators have decided to make it a legacy project that no 
longer fixes bugs or adds new features. Because of this, and because of the large size that the Moment.js package takes up 
(4.23 MB according to npm and the minified size is 6.3KB), we are choosing to replace all instances of Moment.js 
in our enterprise repositories. 

Decisions
*********

In its stead, we are choosing to replace this library with the Day.js project. This is one of the projects that were
explicitly recommended from the Moment.js team as a recommended alternative. Out of the box, it supports basic usage,
and additional plugins have been identified based on a look through our current usages of Moment.js in our codebase. 
The plugins that we will need to add are Duration, UTC, and Timezone, with more possibilities available for future use. 

Day.js also has almost identical functions to Moment, and was definitely created with this in mind. So most files will
just need to replace the package name and nothing else 

``moment(date).format('MMMM D, YYYY') -> dayjs(date).format('MMMM D, YYYY')``

Consequences
************

By choosing Day.js over another, larger library like date-fns, we sacrifice more of the out of the box functionality
that comes from having a bigger library. Also, day.js does not support tree-shaking like the date-fns library does.
However, by only installing needed plugins and starting from a much smaller package size, Day.js will considerably 
decrease the JS bundle size while still maintaining the core functionality.

Alternatives Considered
***********************

date-fns
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Date-fns has a 162.1 kB bundle size compared to 6.4 kB of day.js bundle. Since the majority of the functionality
we are using with these libraries is basic, and the intended goal is to ultimately decrease the bundle size, 
opting for the more lightweight library was the preferred path forward. 