import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { configuration } from '../../config';
import { createStripeAppearance } from './data/stripeAppearance';

/**
 * StripeProvider wrapper component that initializes Stripe with the publishable key
 * and wraps children in the Elements provider with Paragon theming.
 */
const StripeProvider = ({ children }) => {
  // Initialize Stripe instance with publishable key from config
  const stripePromise = useMemo(
    () => {
      const publishableKey = configuration.STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        throw new Error('STRIPE_PUBLISHABLE_KEY is not configured');
      }
      return loadStripe(publishableKey);
    },
    [],
  );

  // Create Stripe appearance using Paragon CSS variables
  const appearance = useMemo(() => createStripeAppearance(), []);

  const options = {
    appearance,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

StripeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StripeProvider;
