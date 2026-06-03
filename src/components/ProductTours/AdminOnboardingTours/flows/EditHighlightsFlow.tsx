import React from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button, Hyperlink } from '@openedx/paragon';
import { ADMIN_TOUR_EVENT_NAMES, EDIT_HIGHLIGHTS_LEARN_MORE_URL, EDIT_HIGHLIGHTS_TARGETS } from '../constants';
import messages from '../messages';
import { TourStep } from '../../types';
import { configuration } from '../../../../config';

interface CreateTourFlowsProps {
  handleAdvanceTour: (advanceEventName: string) => void;
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
  handleBackTour: (backEventName: string) => void;
  handleDismissTour: (dismissEventName: string) => void;
}

const EditHighlightsFlow = ({
  handleAdvanceTour,
  handleEndTour,
  handleBackTour,
  handleDismissTour,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();
  const onAdvance = () => handleAdvanceTour(
    ADMIN_TOUR_EVENT_NAMES.EDIT_HIGHLIGHTS_ADVANCE_EVENT_NAME,
  );
  const onBack = () => handleBackTour(
    ADMIN_TOUR_EVENT_NAMES.EDIT_HIGHLIGHTS_BACK_EVENT_NAME,
  );
  const onEnd = () => handleEndTour(
    ADMIN_TOUR_EVENT_NAMES.EDIT_HIGHLIGHTS_COMPLETED_EVENT_NAME,
    configuration.ADMIN_ONBOARDING_UUIDS.FLOW_SHOWCASE_COURSES_UUID,
  );
  const onDismiss = () => handleDismissTour(
    ADMIN_TOUR_EVENT_NAMES.EDIT_HIGHLIGHTS_DISMISS_EVENT_NAME,
  );

  // Step one renders a custom "Dismiss" button (per the ticket design) alongside
  // the framework-provided "Next" action, since Paragon's ProductTour only renders
  // a close icon by default. The button is absolutely positioned (see _ProductTours.scss)
  // so it sits in the footer row, left-aligned opposite the "Next" button.
  const stepOneBody = (
    <>
      <span>{intl.formatMessage(messages.editHighlightsStepOneBody)}</span>
      <Button
        className="edit-highlights-dismiss-button"
        variant="tertiary"
        onClick={onDismiss}
      >
        {intl.formatMessage(messages.editHighlightsDismissButton)}
      </Button>
    </>
  );

  const stepThreeBody = (
    <FormattedMessage
      {...messages.editHighlightsStepThreeBody}
      values={{
        a: (chunks) => (
          <Hyperlink
            destination={EDIT_HIGHLIGHTS_LEARN_MORE_URL}
            target="_blank"
          >
            {chunks}
          </Hyperlink>
        ),
      }}
    />
  );

  return [
    {
      target: `#${EDIT_HIGHLIGHTS_TARGETS.HIGHLIGHTS_SIDEBAR}`,
      placement: 'right',
      title: intl.formatMessage(messages.editHighlightsPopupOneTitle),
      body: stepOneBody,
      onAdvance,
    },
    {
      target: `#${EDIT_HIGHLIGHTS_TARGETS.HIGHLIGHTS_TAB}`,
      placement: 'top',
      body: intl.formatMessage(messages.editHighlightsStepTwoBody),
      onAdvance,
      onBack,
    },
    {
      target: `#${EDIT_HIGHLIGHTS_TARGETS.HIGHLIGHTS_NEW_BUTTON}`,
      placement: 'left',
      body: stepThreeBody,
      onAdvance,
      onBack,
    },
    {
      target: `#${EDIT_HIGHLIGHTS_TARGETS.HIGHLIGHTS_CATALOG_VISIBILITY_TAB}`,
      placement: 'top',
      body: intl.formatMessage(messages.editHighlightsStepFourBody),
      onAdvance,
      onBack,
    },
    {
      target: `#${EDIT_HIGHLIGHTS_TARGETS.HIGHLIGHT_SET_CARD}`,
      placement: 'right',
      body: intl.formatMessage(messages.editHighlightsStepFiveBody),
      onBack,
      onEnd,
    },
  ];
};

export default EditHighlightsFlow;
