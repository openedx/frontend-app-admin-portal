/* eslint-disable import/prefer-default-export */
// This file exists to avoid a dependency cycle that would be present if this function were in the hooks folder.
import { useContext } from 'react';
import { SubscriptionContext } from '../SubscriptionData';

/*
  This hook provides subscription data for an individual enterprise subscription UUID recieved
  from the subscriptionUUID param in the route.
*/
export const useSubscriptionFromParams = ({ match }) => {
  // Use UUID to find matching subscription plan in SubscriptionContext, return 404 if not found
  const { params: { subscriptionUUID } } = match;
  const { data: subscriptions, loading } = useContext(SubscriptionContext);
  const enterpriseSubscriptions = Object.values(subscriptions.results).filter(sub => sub.uuid === subscriptionUUID);
  if (!subscriptions.count || enterpriseSubscriptions.length < 1) {
    return [null, loading];
  }
  return [enterpriseSubscriptions[0], loading];
};
