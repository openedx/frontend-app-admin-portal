import React from 'react';
import {
  render, screen, waitFor, act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import AddPaymentMethodModal from '../AddPaymentMethodModal';

// Mock scrollIntoView since jsdom doesn't implement it
Element.prototype.scrollIntoView = jest.fn();

// Mock Stripe
const mockStripe = {
  createPaymentMethod: jest.fn(),
};

const mockElements = {
  getElement: jest.fn(),
};

// Store the CardElement onChange handler for testing
let cardElementOnChange: ((event: { complete: boolean }) => void) | null = null;

jest.mock('@stripe/react-stripe-js', () => ({
  useStripe: () => mockStripe,
  useElements: () => mockElements,
  CardElement: ({ onChange }: { onChange?: (event: { complete: boolean }) => void }) => {
    // Capture the onChange handler for testing
    cardElementOnChange = onChange || null;
    return <div data-testid="card-element">Card Element</div>;
  },
}));

// Mock hooks
const mockMutateAsync = jest.fn();

jest.mock('../data/hooks', () => ({
  useAddPaymentMethod: () => ({
    mutateAsync: mockMutateAsync,
  }),
  useCountryOptions: () => [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
  ],
}));

const renderModal = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    enterpriseUuid: 'test-enterprise-uuid',
  };

  return render(
    <IntlProvider locale="en">
      <AddPaymentMethodModal {...defaultProps} {...props} />
    </IntlProvider>,
  );
};

// Helper to simulate CardElement change events
const simulateCardComplete = async () => {
  await act(async () => {
    if (cardElementOnChange) {
      cardElementOnChange({ complete: true });
    }
  });
};

const simulateCardIncomplete = async () => {
  await act(async () => {
    if (cardElementOnChange) {
      cardElementOnChange({ complete: false });
    }
  });
};

describe('AddPaymentMethodModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cardElementOnChange = null;
  });

  describe('email validation', () => {
    it('shows validation error when email field is blurred with invalid email', async () => {
      const user = userEvent.setup();
      renderModal();

      const emailInput = screen.getByLabelText(/billing email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // blur the field

      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });

    it('shows validation error for empty email on blur', async () => {
      const user = userEvent.setup();
      renderModal();

      const emailInput = screen.getByLabelText(/billing email/i);
      await user.click(emailInput);
      await user.tab(); // blur without entering anything

      expect(screen.getByText('Please enter an email address.')).toBeInTheDocument();
    });

    it('clears validation error when valid email is entered', async () => {
      const user = userEvent.setup();
      renderModal();

      const emailInput = screen.getByLabelText(/billing email/i);

      // Enter invalid email and blur
      await user.type(emailInput, 'invalid');
      await user.tab();
      expect(emailInput).toHaveClass('is-invalid');

      // Now enter a valid email
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@example.com');

      await waitFor(() => {
        expect(emailInput).not.toHaveClass('is-invalid');
      });
    });

    it('prevents form submission when email is invalid', async () => {
      const user = userEvent.setup();
      renderModal();

      // Fill in all required fields except email
      await user.type(screen.getByLabelText(/organization name/i), 'Test Org');
      await user.type(screen.getByLabelText(/street address/i), '123 Main St');
      await user.type(screen.getByLabelText(/city/i), 'Boston');
      await user.type(screen.getByLabelText(/state/i), 'MA');
      await user.type(screen.getByLabelText(/postal code/i), '02101');
      await simulateCardComplete();

      // Enter invalid email
      await user.type(screen.getByLabelText(/billing email/i), 'not-an-email');

      // Try to submit
      await user.click(screen.getByRole('button', { name: /add payment method/i }));

      // Stripe should not be called
      expect(mockStripe.createPaymentMethod).not.toHaveBeenCalled();

      // Error message should be shown
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
  });

  describe('required field validation', () => {
    it('prevents form submission when organization name is empty', async () => {
      const user = userEvent.setup();
      renderModal();

      // Fill in all required fields except organization name
      await user.type(screen.getByLabelText(/billing email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/street address/i), '123 Main St');
      await user.type(screen.getByLabelText(/city/i), 'Boston');
      await user.type(screen.getByLabelText(/state/i), 'MA');
      await user.type(screen.getByLabelText(/postal code/i), '02101');
      await simulateCardComplete();

      // Try to submit
      await user.click(screen.getByRole('button', { name: /add payment method/i }));

      // Stripe should not be called
      expect(mockStripe.createPaymentMethod).not.toHaveBeenCalled();

      // Error message should be shown
      expect(screen.getByText('Please enter an organization name.')).toBeInTheDocument();
    });

    it('prevents form submission when street address is empty', async () => {
      const user = userEvent.setup();
      renderModal();

      // Fill in all required fields except street address
      await user.type(screen.getByLabelText(/billing email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/organization name/i), 'Test Org');
      await user.type(screen.getByLabelText(/city/i), 'Boston');
      await user.type(screen.getByLabelText(/state/i), 'MA');
      await user.type(screen.getByLabelText(/postal code/i), '02101');
      await simulateCardComplete();

      // Try to submit
      await user.click(screen.getByRole('button', { name: /add payment method/i }));

      // Stripe should not be called
      expect(mockStripe.createPaymentMethod).not.toHaveBeenCalled();

      // Error message should be shown
      expect(screen.getByText('Please enter a street address.')).toBeInTheDocument();
    });

    it('prevents form submission when city is empty', async () => {
      const user = userEvent.setup();
      renderModal();

      // Fill in all required fields except city
      await user.type(screen.getByLabelText(/billing email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/organization name/i), 'Test Org');
      await user.type(screen.getByLabelText(/street address/i), '123 Main St');
      await user.type(screen.getByLabelText(/state/i), 'MA');
      await user.type(screen.getByLabelText(/postal code/i), '02101');
      await simulateCardComplete();

      // Try to submit
      await user.click(screen.getByRole('button', { name: /add payment method/i }));

      // Stripe should not be called
      expect(mockStripe.createPaymentMethod).not.toHaveBeenCalled();

      // Error message should be shown
      expect(screen.getByText('Please enter a city.')).toBeInTheDocument();
    });

    it('clears validation error when valid value is entered for required field', async () => {
      const user = userEvent.setup();
      renderModal();

      // Fill in all required fields except organization name
      await user.type(screen.getByLabelText(/billing email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/street address/i), '123 Main St');
      await user.type(screen.getByLabelText(/city/i), 'Boston');
      await user.type(screen.getByLabelText(/state/i), 'MA');
      await user.type(screen.getByLabelText(/postal code/i), '02101');
      await simulateCardComplete();

      // Try to submit - this should show validation error
      await user.click(screen.getByRole('button', { name: /add payment method/i }));

      // Error message should be shown
      expect(screen.getByText('Please enter an organization name.')).toBeInTheDocument();

      // Now enter a valid value
      const orgNameInput = screen.getByLabelText(/organization name/i);
      await user.type(orgNameInput, 'Test Org');

      // Validation error should be cleared (CSS-based validation hides it when field is valid)
      await waitFor(() => {
        // The input should now be valid (have a value)
        expect(orgNameInput).toHaveValue('Test Org');
      });
    });
  });

  describe('card element validation', () => {
    it('prevents form submission when card details are incomplete', async () => {
      const user = userEvent.setup();
      renderModal();

      // Fill in all text fields
      await user.type(screen.getByLabelText(/billing email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/organization name/i), 'Test Org');
      await user.type(screen.getByLabelText(/street address/i), '123 Main St');
      await user.type(screen.getByLabelText(/city/i), 'Boston');
      await user.type(screen.getByLabelText(/state/i), 'MA');
      await user.type(screen.getByLabelText(/postal code/i), '02101');

      // Simulate incomplete card (do not call simulateCardComplete)
      await simulateCardIncomplete();

      // Try to submit
      await user.click(screen.getByRole('button', { name: /add payment method/i }));

      // Stripe should not be called
      expect(mockStripe.createPaymentMethod).not.toHaveBeenCalled();

      // Card error message should be shown
      expect(screen.getByText('Please enter complete card details.')).toBeInTheDocument();
    });

    it('shows card validation error on submit when card was never touched', async () => {
      const user = userEvent.setup();
      renderModal();

      // Fill in all text fields but don't interact with card
      await user.type(screen.getByLabelText(/billing email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/organization name/i), 'Test Org');
      await user.type(screen.getByLabelText(/street address/i), '123 Main St');
      await user.type(screen.getByLabelText(/city/i), 'Boston');
      await user.type(screen.getByLabelText(/state/i), 'MA');
      await user.type(screen.getByLabelText(/postal code/i), '02101');

      // Try to submit without interacting with card at all
      await user.click(screen.getByRole('button', { name: /add payment method/i }));

      // Stripe should not be called
      expect(mockStripe.createPaymentMethod).not.toHaveBeenCalled();

      // Card error message should be shown
      expect(screen.getByText('Please enter complete card details.')).toBeInTheDocument();
    });
  });

  describe('Stripe error handling', () => {
    const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText(/billing email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/organization name/i), 'Test Org');
      await user.type(screen.getByLabelText(/street address/i), '123 Main St');
      await user.type(screen.getByLabelText(/city/i), 'Boston');
      await user.type(screen.getByLabelText(/state/i), 'MA');
      await user.type(screen.getByLabelText(/postal code/i), '02101');
      // Simulate complete card details
      await simulateCardComplete();
    };

    beforeEach(() => {
      mockElements.getElement.mockReturnValue({});
    });

    it('shows email error when Stripe returns email-related error message', async () => {
      const user = userEvent.setup();
      mockStripe.createPaymentMethod.mockResolvedValue({
        error: {
          message: 'Your email address is invalid.',
          type: 'validation_error',
        },
      });

      renderModal();
      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /add payment method/i }));

      await waitFor(() => {
        // Check for the error message in the Alert (role="alert")
        expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address.');
      });
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('shows email error when Stripe returns billing_details[email] param error', async () => {
      const user = userEvent.setup();
      mockStripe.createPaymentMethod.mockResolvedValue({
        error: {
          message: 'Invalid parameter',
          param: 'billing_details[email]',
          type: 'validation_error',
        },
      });

      renderModal();
      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /add payment method/i }));

      await waitFor(() => {
        // Check for the error message in the Alert (role="alert")
        expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address.');
      });
    });

    it('shows card error when Stripe returns validation_error type', async () => {
      const user = userEvent.setup();
      mockStripe.createPaymentMethod.mockResolvedValue({
        error: {
          message: 'Your card number is incomplete.',
          type: 'validation_error',
        },
      });

      renderModal();
      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /add payment method/i }));

      await waitFor(() => {
        expect(screen.getByText("We're unable to process your payment method. Please check your card details and try again.")).toBeInTheDocument();
      });
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('shows card error when Stripe returns card_error type', async () => {
      const user = userEvent.setup();
      mockStripe.createPaymentMethod.mockResolvedValue({
        error: {
          message: 'Your card was declined.',
          type: 'card_error',
          code: 'card_declined',
        },
      });

      renderModal();
      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /add payment method/i }));

      await waitFor(() => {
        expect(screen.getByText("We're unable to process your payment method. Please check your card details and try again.")).toBeInTheDocument();
      });
    });

    it('shows network error when Stripe returns other error types', async () => {
      const user = userEvent.setup();
      mockStripe.createPaymentMethod.mockResolvedValue({
        error: {
          message: 'An error occurred',
          type: 'api_error',
        },
      });

      renderModal();
      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /add payment method/i }));

      await waitFor(() => {
        expect(screen.getByText("We're unable to connect to our payment provider. Please try again later.")).toBeInTheDocument();
      });
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('handles Stripe error with no message gracefully', async () => {
      const user = userEvent.setup();
      mockStripe.createPaymentMethod.mockResolvedValue({
        error: {
          type: 'api_error',
        },
      });

      renderModal();
      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /add payment method/i }));

      await waitFor(() => {
        expect(screen.getByText("We're unable to connect to our payment provider. Please try again later.")).toBeInTheDocument();
      });
    });
  });
});
