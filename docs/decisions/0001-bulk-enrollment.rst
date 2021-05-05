Multiple Enterprise Support
---------------------------

Status
======

Draft

Context
=======

Bulk Enrollment is one of the Admin portal features offered via a screen called Subscription management.

This feature exists in order for an admin to enroll multiple learners into multiple courses, as allowed by the subscription agreement for the enterprise.

The enterprise team added to edx-enterprise an endpoint, which can enroll multiple learners into multiple courses just fine, but there were a few issues:

#. An admin could upload any csv file with any emails in them or type in any email address(es) for bulk enrollment. Some of these emails may not have a valid license attached to them.
There was no affordance to filter these out.
#. If a few of the enrollments failed, the prior design was to interrupt the running batch of enrollments, and return a response, which gave the admin a suboptimal and confusing user experience.
The system would be in a state where some of the enrollments have processed, and some of the remaining ones which could have been processed, are also dropped.


There are several ways to enroll learners in the code base:




In other words, the prior design allowed for too many operator/manual errors and no affordance to minimize erronous enrollments or know which enrollments in the batch succeeded, which not.

Decisions
=========

The resolution of the mentioned issues was done via a few key architectural decisions:

### The edx-enterprise bulk enrollment endpoint does not use prior enrollment apis

There are several enrollment apis / abilities throughout the codebase. The bulk enrollment endpoint could just loop over all emails and courses, and call these facilities.


We decided to use the `enroll_user` in `enterprise/utils.py` directly instead. Reasons:

* the bulk enrollment still needs to handle pending and active enrollments
* the existing methods in enterprise/utils


### The edx-enterprise endpoint is now non-transactional and more useful/intuitive to use

In other words, the endpoint api/v1/enroll_learners_in_courses/ was updated such that if some of the enrollments failed, it did not impact the rest of the batch.
The endpoint now attempts to enroll as many asp ossible, and returns a response such as follows to track what passed or failed:

```
{'successes': [], 'pending': [], 'failures': [] 'invalid_email_addresses': []}, <status_code>
```

### An endpoint introduced into the license manager for bulk enrollment:

The MFE, instead of calling edx-enterprise directly, now calls a license-manager endpoint.
This endpoint has the responsibility to validate licenses, and reject (filter out) emails for which
there are no valid (meaning active or pending) licenses for the enterprise customer of interest.
Finally, the endpoint forwards the requset to the prior mentioned edx-enterprise endpoint and routes the response back to the caller.

Any license-based-rejected learner emails are collected into a list and sent back as response for reporting.

### The MFE now helps admin avoid invalid enrollments via learner email and course filtering:

A screen has been added to ask the admin to choose a subscription to begin with before attempting bulk enrollment, which limits the courses to only subscription based courses.

Also, the set of learners the admin can now choose is restricted via a screen which shows only active/pending learners.

Consequences
============

#. an admin can no longer enroll invalid email addresses (meaning without enterprise-attached licenses)
#. an admin can no longer attempt to enroll in courses from multiple subscriptions, reducing the chances of confusion/failure in enrollments
#. the license manager check ensures that even in the event of front end 'hacking' to send in invalid emails, only validated license-based emails are processed

These combined have the net effect of a smoother, more secure and reliable bulk enrollment experience.
