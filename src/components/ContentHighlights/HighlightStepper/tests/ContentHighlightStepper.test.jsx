import { screen, render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Button } from '@edx/paragon';
import React from 'react';
import ContentHighlightStepper from '../ContentHighlightStepper';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import useStepperModalState from '../../data/hooks';
/**
 * Non-Zero index reference to text representing step passed into this function
 *
 * @param {Integer} step
 * @returns
 */
const stepperTextStep = (step) => {
  const stepText = [
    'Create a title for the highlight collection',
    'Select Courses to Add',
    'Confirm your Content',
    'Confirm your Highlight',
  ];
  if (step < 1 || step > 4) {
    throw new Error('stepperTextStep Error: Step must be between 1 and 4');
  }
  return stepText[step - 1];
};

const ContentHighlightStepperWrapper = () => {
  const { stepperModalState, setIsModalOpen, isModalOpen } = useStepperModalState();
  const defaultValue = {
    stepperModalState,
    setIsModalOpen,
    isModalOpen,
  };
  return (
    <ContentHighlightsContext.Provider value={defaultValue}>
      <Button onClick={() => setIsModalOpen(true)}>Click Me</Button>
      <ContentHighlightStepper isOpen={isModalOpen} />
    </ContentHighlightsContext.Provider>
  );
};

describe('<ContentHighlightStepper>', () => {
  it('Displays the stepper', () => {
    render(<ContentHighlightStepperWrapper />);

    const stepper = screen.getByText('Click Me');
    fireEvent.click(stepper);
    expect(screen.getByText(stepperTextStep(1))).toBeInTheDocument();
  });
  it('Displays the stepper and test all back and next buttons', () => {
    render(<ContentHighlightStepperWrapper />);

    const stepper = screen.getByText('Click Me');
    fireEvent.click(stepper);
    const nextButton1 = screen.getByText('Next');
    fireEvent.click(nextButton1);
    const nextButton2 = screen.getByText('Next');
    fireEvent.click(nextButton2);
    const nextButton3 = screen.getByText('Next');
    fireEvent.click(nextButton3);

    const backButton1 = screen.getByText('Back');
    fireEvent.click(backButton1);
    expect(screen.getByText(stepperTextStep(3))).toBeInTheDocument();
    const backButton2 = screen.getByText('Back');
    fireEvent.click(backButton2);
    expect(screen.getByText(stepperTextStep(2))).toBeInTheDocument();
    const backButton3 = screen.getByText('Back');
    fireEvent.click(backButton3);
    expect(screen.getByText(stepperTextStep(1))).toBeInTheDocument();
    const backButton4 = screen.getByText('Back');
    fireEvent.click(backButton4);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
  it('Displays the stepper and exits on the X button', () => {
    render(<ContentHighlightStepperWrapper />);

    const stepper = screen.getByText('Click Me');
    fireEvent.click(stepper);
    expect(screen.getByText(stepperTextStep(1))).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
  it('Displays the stepper and closes the stepper on confirm', () => {
    render(<ContentHighlightStepperWrapper />);

    const stepper = screen.getByText('Click Me');
    fireEvent.click(stepper);
    expect(screen.getByText(stepperTextStep(1))).toBeInTheDocument();

    const nextButton1 = screen.getByText('Next');
    fireEvent.click(nextButton1);
    const nextButton2 = screen.getByText('Next');
    fireEvent.click(nextButton2);
    const nextButton3 = screen.getByText('Next');
    fireEvent.click(nextButton3);
    expect(screen.getByText(stepperTextStep(4))).toBeInTheDocument();

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
  it('Displays the stepper, closes, then displays stepper again', () => {
    render(<ContentHighlightStepperWrapper />);

    const stepper1 = screen.getByText('Click Me');
    fireEvent.click(stepper1);
    expect(screen.getByText(stepperTextStep(1))).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(screen.getByText('Click Me')).toBeInTheDocument();

    const stepper2 = screen.getByText('Click Me');
    fireEvent.click(stepper2);
    expect(screen.getByText(stepperTextStep(1))).toBeInTheDocument();
  });
});
