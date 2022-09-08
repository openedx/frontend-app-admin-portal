3. Learner Credit Management
============================

Status
******

Accepted - July 2022

Context
*******

* We decided to enable the consumption of Enterprise Offers in the Enterprise Learner Portal (TODO: link to LP ADR)
* Enterprise admins need the ability to check the remaining balance and/or total balance redeemed
  on their Enterprise offer, so they can plan their learning program accordingly.

Decisions
*********

* Initially will only support "first-come, first-serve, org-wide budget" flavor of Offers.
* Additionally, the Learner Credit Management page is only available for Enterprise Customers
  who have exactly one offer and no other type of subsidy (i.e. Subcription Plans or Coupon Codes).
* We'll create a Learner Credit Management page in the admin portal.
* Metadata about the enterprise's Offer will be visible there - specifically the Offer title, start date, and end date.
  Such metadata is sourced from the ecommerce ``ConditionalOffer`` record.
* The page will contain useful enrollment-level and aggregate utilization data to help the admin
  understand how much of the Offer has been utilized and how much balance remains.
  See `ADR 4. Learner Credit Usage Data Sourced from Analytics API`_. 
* In the case of Offers with no ``max_discount`` set (and thus no meaningful notion of remaining balance), the Learner
  Credit Management page displays only the amount of "total redeemed" usage.
* This page will contain calls-to-action through which enterprise admins can get support or replenish
  their offer balance when it is running low.

Consequences
************

* All of the notable consequences are captured in `ADR 4. Learner Credit Usage Data Sourced from Analytics API`_.

Alternatives Considered
***********************

* None - this is committed `legacy` work.

.. _`ADR 4. Learner Credit Usage Data Sourced from Analytics API`: https://github.com/openedx/frontend-app-admin-portal/blob/master/docs/decisions/0004-learner-credit-data-from-analytics-service.rst
