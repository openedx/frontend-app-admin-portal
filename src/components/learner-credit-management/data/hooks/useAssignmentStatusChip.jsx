import { useToggle } from '@openedx/paragon';

/**
 *
 * @param chipInteractionEventName {String} - The event name that will be read in Segment of a chip opening and closing
 * @param chipHelpCenterEventName {String} - The event name that will be read in Segment for a help center link
 * interaction
 * @param trackEvent {Function} - The track event functioning that will be sending a track event
 * @returns {{
 * closeChipModal: closeChipModal,
 * openChipModal: openChipModal,
 * helpCenterTrackEvent: helpCenterTrackEvent,
 * isChipModalOpen: *
 * }}
 */
export default function useAssignmentStatusChip({ chipInteractionEventName, chipHelpCenterEventName, trackEvent }) {
  const [isChipModalOpen, open, close] = useToggle(false);
  const openChipModal = () => {
    open();
    // Note: could hardcode true given this function *always* opens
    trackEvent(chipInteractionEventName, { isOpen: true });
  };
  const closeChipModal = () => {
    close();
    // Note: could hardcode false given this function *always* closes
    trackEvent(chipInteractionEventName, { isOpen: false });
  };

  const helpCenterTrackEvent = () => {
    trackEvent(chipHelpCenterEventName);
  };

  return {
    isChipModalOpen,
    openChipModal,
    closeChipModal,
    helpCenterTrackEvent,
  };
}
