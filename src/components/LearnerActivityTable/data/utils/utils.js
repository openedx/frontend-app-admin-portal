import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

/**
 * Utility to handle tracking of data table events.
 * Only tracks events after the initial page load when user performs manual operations.
 *
 * @param {Object} params - Parameters for the tracking function
 * @param {React.MutableRefObject} params.shouldTrackRef - Ref to determine if events should be tracked
 * @param {string} params.enterpriseId - ID of the enterprise
 * @param {string} params.eventName - Name of the event to track
 * @param {string} params.tableId - ID of the table
 * @param {Object} params.options - Additional options to include with the event
 * @returns {boolean} - Updated value for shouldTrack
 */
const trackDataTableEvent = ({
  shouldTrackRef,
  enterpriseId,
  eventName,
  tableId,
  options,
}) => {
  if (shouldTrackRef.current) {
    // track event only after original API query to avoid sending event on initial page load
    // only track event when user performs manual data operation (e.g., pagination, sort, filter)
    sendEnterpriseTrackEvent(
      enterpriseId,
      eventName,
      {
        tableId,
        ...options,
      },
    );
  } else {
    // set to true to enable tracking events on future API queries
    // eslint-disable-next-line no-param-reassign
    shouldTrackRef.current = true;
  }

  return shouldTrackRef.current;
};

export default trackDataTableEvent;
