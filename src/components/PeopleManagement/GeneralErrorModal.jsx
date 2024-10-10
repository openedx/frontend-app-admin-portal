import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, ModalDialog,
} from '@openedx/paragon';

const GeneralErrorModal = ({ isOpen, close }) => (
  <ModalDialog
    title="Something went wrong"
    isOpen={isOpen}
    onClose={close}
    hasCloseButton
    isFullscreenOnMobile
  >
    <ModalDialog.Header>
      <ModalDialog.Title>
        <FormattedMessage
          id="adminPortal.peopleManagement.errorModal.title"
          defaultMessage="Something went wrong"
          description="Title for error modal."
        />
      </ModalDialog.Title>
    </ModalDialog.Header>

    <ModalDialog.Body>
      <FormattedMessage
        id="adminPortal.peopleManagement.errorModal.body"
        defaultMessage="We're sorry. Something went wrong behind the scenes. Please try again, or reach out to customer support for help."
        description="Message for error modal."
      />
    </ModalDialog.Body>

    <ModalDialog.Footer>
      <ActionRow>
        <Button onClick={close} variant="primary">Exit</Button>
      </ActionRow>
    </ModalDialog.Footer>
  </ModalDialog>
);

GeneralErrorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

export default GeneralErrorModal;
