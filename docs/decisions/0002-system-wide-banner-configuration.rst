============================================================
2. Configurable system-wide notices banner
============================================================

******
Status
******

Accepted

*******
Context
*******

This application relies on several backend services for their API endpoints. Occassionally, scheduled planned maintenance must be performed such that certain service dependencies will fail. This may impact the user experience by limiting the functionality of certain features or producing erronous errors.

To account for this, we want to provide a way to notify users that planned maintenance is underway or about to begin.

********
Decision
********

To account for this, the Paragon component `SystemWideBanner` will be used to convey a message to the user that maintenance is underway, thereby informing them that things may not work properly or as they expect. This component is a largely warning alert placed at the top of the page (above the header). Whether or not it is shown will be driven by some configuration variables: ``IS_MAINTENANCE_ALERT_ENABLED``, ``MAINTENANCE_ALERT_MESSAGE``, ``MAINTENANCE_ALERT_START_TIMESTAMP``.  

In order to enable the alert, ``IS_MAINTENANCE_ALERT_ENABLED`` and ``MAINTENANCE_ALERT_MESSAGE`` must be set. Optionally, to configure when the alert will appear, you may set a timestamp for ``MAINTENANCE_ALERT_START_TIMESTAMP``. The alert will not appear before this timestamp, but it will stay up indefinitely until ``IS_MAINTENANCE_ALERT_ENABLED`` is removed and the application is re-deployed. We are intentionally not supporting an explicit end date; the assumption is that to turn off an alert is to remove the ``IS_MAINTENANCE_ALERT_ENABLED`` setting.

The format of the ``MAINTENANCE_ALERT_START_TIMESTAMP`` setting is as follows: "2021-12-10T21:20:00Z"

************
Consequences
************

We do not have a particular need for an explicit end date with the alert at this time, mainly due to that we don't know how long the maintenance will last for at the time of this writing. Instead, we will simply monitor the system and turn ``IS_MAINTENANCE_ALERT_ENABLED`` off at the appropriate time and re-deploy the application.
