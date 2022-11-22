import { screen, render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Button } from '@edx/paragon';
import React, {
  useMemo, useReducer, useState, useEffect,
} from 'react';
import Proptypes from 'prop-types';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import ContentHighlightStepper from '../ContentHighlightStepper';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import { STEPPER_STEP_TEXT } from '../../data/constants';
import { setStepperHighlightTitle } from '../../data/actions';
import {
  contentHighlightsReducer,
  initialContentHighlightsState,
} from '../../data/reducer';

const ContentHighlightStepperWrapper = ({ stepperTitle }) => {
  const [
    contentHighlightsState,
    dispatch,
  ] = useReducer(contentHighlightsReducer, initialContentHighlightsState);
  const value = useMemo(() => ({
    ...contentHighlightsState,
    dispatch,
  }), [contentHighlightsState]);
  const [isOpen, setIsOpen] = useState(contentHighlightsState.stepperModal.isOpen);
  useEffect(() => {
    dispatch(setStepperHighlightTitle(stepperTitle));
  }, [stepperTitle, dispatch]);
  return (
    <IntlProvider locale="en">
      <ContentHighlightsContext.Provider value={value}>
        <Button onClick={() => setIsOpen(true)}>Click Me</Button>
        <ContentHighlightStepper isModalOpen={isOpen} />
      </ContentHighlightsContext.Provider>
    </IntlProvider>
  );
};

ContentHighlightStepperWrapper.propTypes = {
  stepperTitle: Proptypes.string,
};

ContentHighlightStepperWrapper.defaultProps = {
  stepperTitle: '',
};

describe('<ContentHighlightStepper>', () => {
  it('Displays the stepper', () => {
    render(<ContentHighlightStepperWrapper />);

    const stepper = screen.getByText('Click Me');
    fireEvent.click(stepper);
    expect(screen.getByText(STEPPER_STEP_TEXT.createTitle)).toBeInTheDocument();
  });
  it('Displays the stepper and test all back and next buttons', () => {
    render(<ContentHighlightStepperWrapper stepperTitle="test-title" />);
    // open stepper --> title
    const stepper = screen.getByText('Click Me');
    fireEvent.click(stepper);
    // title --> select courses
    const nextButton1 = screen.getByText('Next');
    const input = screen.getByTestId('stepper-title-input');
    fireEvent.change(input, { target: { value: 'test-title' } });
    fireEvent.click(nextButton1);
    // select courses --> confirm courses
    const nextButton2 = screen.getByText('Next');
    fireEvent.click(nextButton2);
    // confirm courses --> confirm highlight
    const nextButton3 = screen.getByText('Next');
    fireEvent.click(nextButton3);

    // // confirm highlight --> confirm courses
    const backButton1 = screen.getByText('Back');
    fireEvent.click(backButton1);
    expect(screen.getByText(STEPPER_STEP_TEXT.confirmContent)).toBeInTheDocument();
    // confirm courses --> select courses
    const backButton2 = screen.getByText('Back');
    fireEvent.click(backButton2);
    expect(screen.getByText(STEPPER_STEP_TEXT.selectCourses)).toBeInTheDocument();
    // select courses --> title
    const backButton3 = screen.getByText('Back');
    fireEvent.click(backButton3);
    expect(screen.getByText(STEPPER_STEP_TEXT.createTitle)).toBeInTheDocument();
    // title --> closed stepper
    const backButton4 = screen.getByText('Cancel');
    fireEvent.click(backButton4);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
  it('Displays the stepper and exits on the X button', () => {
    render(<ContentHighlightStepperWrapper />);

    const stepper = screen.getByText('Click Me');
    fireEvent.click(stepper);
    expect(screen.getByText(STEPPER_STEP_TEXT.createTitle)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
  it('Displays the stepper and closes the stepper on confirm', () => {
    render(<ContentHighlightStepperWrapper stepperTitle="test-title" />);

    const stepper = screen.getByText('Click Me');
    fireEvent.click(stepper);
    expect(screen.getByText(STEPPER_STEP_TEXT.createTitle)).toBeInTheDocument();

    const input = screen.getByTestId('stepper-title-input');
    fireEvent.change(input, { target: { value: 'test-title' } });
    const nextButton1 = screen.getByText('Next');
    fireEvent.click(nextButton1);
    const nextButton2 = screen.getByText('Next');
    fireEvent.click(nextButton2);
    const nextButton3 = screen.getByText('Next');
    fireEvent.click(nextButton3);
    expect(screen.getByText(STEPPER_STEP_TEXT.confirmHighlight)).toBeInTheDocument();

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
  it('Displays the stepper, closes, then displays stepper again', () => {
    render(<ContentHighlightStepperWrapper />);

    const stepper1 = screen.getByText('Click Me');
    fireEvent.click(stepper1);
    expect(screen.getByText(STEPPER_STEP_TEXT.createTitle)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(screen.getByText('Click Me')).toBeInTheDocument();

    const stepper2 = screen.getByText('Click Me');
    fireEvent.click(stepper2);
    expect(screen.getByText(STEPPER_STEP_TEXT.createTitle)).toBeInTheDocument();
  });
});
