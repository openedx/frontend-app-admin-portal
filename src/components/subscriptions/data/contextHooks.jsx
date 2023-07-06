/* eslint-disable import/prefer-default-export */
// This file exists to avoid a dependency cycle that would be present if this function were in the hooks folder.
import { useContext } from 'react';
import { SubscriptionContext } from '../SubscriptionData';

/*
  This hook provides subscription data for an individual enterprise subscription UUID recieved
  from the subscriptionUUID param in the route.
*/
export const useSubscriptionFromParams = ({ subscriptionUUID }) => {
  // Use UUID to find matching subscription plan in SubscriptionContext, return 404 if not found
  const { data: subscriptions, loading } = useContext(SubscriptionContext);
  const foundSubscriptionByUUID = Object.values(subscriptions.results).find(sub => sub.uuid === subscriptionUUID);
  if (!foundSubscriptionByUUID) {
    return [null, loading];
  }
  return [foundSubscriptionByUUID, loading];
};
