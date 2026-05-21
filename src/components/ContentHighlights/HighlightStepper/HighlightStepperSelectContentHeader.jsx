import React from 'react';
import { useContextSelector } from 'use-context-selector';
import { Icon } from '@openedx/paragon';
import { AddCircle } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET } from '../data/constants';
import { ContentHighlightsContext } from '../ContentHighlightsContext';

const HighlightStepperSelectContentTitle = () => {
  const intl = useIntl();
  const highlightTitle = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.highlightTitle);
  const isEditMode = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.isEditMode);
  return (
    <>
      <h3 className="mb-3 d-flex align-items-center">
        <Icon src={AddCircle} className="mr-2 text-brand" />
        {isEditMode
          ? intl.formatMessage({
            id: 'highlights.new.highlights.stepper.stepper.step.header.text.edit.select.content',
            defaultMessage: 'Add courses to your highlight',
            description: 'Header text shown in edit mode while selecting content for highlights',
          })
          : intl.formatMessage({
            id: 'highlights.new.highlights.stepper.stepper.step.header.text.select.content',
            defaultMessage: 'Add content to your highlight',
            description: 'Header text shown while selecting content for new highlights',
          })}
      </h3>
      <p>
        {isEditMode
          ? intl.formatMessage({
            id: 'highlights.new.highlights.stepper.stepper.step.sub.text.edit.select.content',
            defaultMessage: 'Select up to {maxItems} courses for "{highlightTitle}". Courses in Learner\'s Portal appear in the order of most recent selection first.',
            description: 'Subtext shown in edit mode while selecting courses for highlights',
          }, {
            maxItems: MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET,
            highlightTitle,
          })
          : intl.formatMessage({
            id: 'highlights.new.highlights.stepper.stepper.step.sub.text.select.content',
            defaultMessage: 'Select up to {maxItems} items for "{highlightTitle}". Courses in learners\' portal appear in the order of selection.',
            description: 'Subtext shown while selecting content for new highlights',
          }, {
            maxItems: MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET,
            highlightTitle,
          })}
      </p>
      <p>
        <strong>
          {intl.formatMessage({
            id: 'highlights.new.highlights.stepper.stepper.step.pro.tip.text.select.content',
            defaultMessage: 'Pro tip: a highlight can include courses similar to each other for your learners to choose from, or courses that vary in subtopics to help your learners master a larger topic',
            description: 'Pro tip shown while selecting content for highlights',
          })}
        </strong>
      </p>
    </>
  );
};
export default HighlightStepperSelectContentTitle;
