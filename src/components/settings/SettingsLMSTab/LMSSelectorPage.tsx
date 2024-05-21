import React from 'react';
import { Container, Image, SelectableBox } from '@openedx/paragon';

import { channelMapping } from '../../../utils';
import { LMS_KEYS } from '../data/constants';
import { FormFieldValidation, useFormContext } from '../../forms/FormContext';
import { setFormFieldAction } from '../../forms/data/actions';

export const validations: FormFieldValidation[] = [
  {
    formFieldId: 'lms',
    validator: (fields) => !LMS_KEYS.includes(fields.lms),
  },
];

export function LMSSelectorPage(setLms: (string) => void) {
  const LMSSelectorPageImpl = () => {
    const { dispatch, formFields } = useFormContext();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // setting this value allows the LMSFormWorkflowConfig page to rerender with the state
    // change, which sets the LMS's associated steps
      setLms(e.target.value);
      if (dispatch) {
        dispatch(setFormFieldAction({ fieldId: 'lms', value: e.target.value }));
      }
    };
    return (
      <Container size="lg">
        <span className="pb-4">
          <h3 id="lms-selection-heading" className="pb-3">
            Let&apos;s get started
          </h3>
          <p id="lms-selection-description">Select the LMS or LXP you want to integrate with edX For Business.</p>
          <SelectableBox.Set
            type="radio"
            value={formFields?.lms}
            onChange={handleChange}
            name="colors"
            columns={3}
            ariaLabelledby="lms-selection-description"
          >
            {LMS_KEYS.map(lms => (
              <SelectableBox value={lms} type="radio" aria-label={`select ${channelMapping[lms].displayName}`}>
                <div className="select-lms-card">
                  <Image className="lms-icon" src={channelMapping[lms].icon} />
                  <h3 className="pl-3">{channelMapping[lms].displayName}</h3>
                </div>
              </SelectableBox>
            ))}
          </SelectableBox.Set>
        </span>
      </Container>
    );
  };
  return LMSSelectorPageImpl;
}
