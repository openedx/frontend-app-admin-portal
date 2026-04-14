import React, { FC, useState } from 'react';
import { connect } from 'react-redux';
import {
  Collapsible, Icon, ActionRow, Button,
} from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { KeyboardArrowUp, KeyboardArrowDown } from '@openedx/paragon/icons';
import DismissConfirmationModal from '../ProductTours/AdminOnboardingTours/DismissConfirmationModal';

const messages = defineMessages({
  dismissButton: {
    id: 'admin.portal.productTours.collapsible.dismiss',
    defaultMessage: 'Dismiss',
    description: 'Dismiss button in the Quick Start Guide collapsible.',
  },
  closeButton: {
    id: 'admin.portal.productTours.collapsible.close',
    defaultMessage: 'Close',
    description: 'Close button in the Quick Start Guide collapsible.',
  },
});

interface Props {
  onDismiss?: () => void;
  title: string;
  children: React.ReactNode;
}

const FloatingCollapsible: FC<Props> = ({
  onDismiss = () => {}, title, children,
}) => {
  const intl = useIntl();
  const [collapseOpen, setCollapseOpen] = useState(true);
  const [isDismissConfirmation, setIsDismissConfirmation] = useState(false);

  const handleDismiss = () => {
    setIsDismissConfirmation(true);
  };

  const handleDismissConfirm = () => {
    setCollapseOpen(false);
    onDismiss();
    setIsDismissConfirmation(false);
  };

  return (
    <>
      {isDismissConfirmation && (
        <DismissConfirmationModal
          openConfirmationModal={setIsDismissConfirmation}
          onConfirm={handleDismissConfirm}
        />
      )}
      <div className="floating-collapsible bottom-right-fixed">
        <Collapsible.Advanced
          styling="card"
          open={collapseOpen}
          onToggle={(value: boolean) => setCollapseOpen(value)}
        >
          <Collapsible.Trigger
            className={`floating-collapsible__trigger p-3 h4 mb-0 ${collapseOpen ? 'rounded-top' : 'rounded'}`}
          >
            <div className="d-flex justify-content-between">
              <div>{title}</div>
              <Collapsible.Visible whenClosed>
                <Icon src={KeyboardArrowUp} />
              </Collapsible.Visible>
              <Collapsible.Visible whenOpen>
                <Icon src={KeyboardArrowDown} />
              </Collapsible.Visible>
            </div>
          </Collapsible.Trigger>
          <Collapsible.Body className="floating-collapsible__body bg-light-300 text-gray-700 rounded-bottom p-3">
            {children}
            <ActionRow>
              <Button variant="tertiary" onClick={handleDismiss}>
                {intl.formatMessage(messages.dismissButton)}
              </Button>
              <Button variant="primary" onClick={() => setCollapseOpen(false)}>
                {intl.formatMessage(messages.closeButton)}
              </Button>
            </ActionRow>
          </Collapsible.Body>
        </Collapsible.Advanced>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseBranding: state.portalConfiguration.enterpriseBranding,
});

export default connect(mapStateToProps)(FloatingCollapsible);
