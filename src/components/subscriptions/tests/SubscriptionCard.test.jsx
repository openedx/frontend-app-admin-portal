import {
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import React from 'react';
import { renderWithRouter } from '../../test/testUtils';

import SubscriptionCard from '../SubscriptionCard';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';

const defaultProps = {
  uuid: 'ided',
  title: 'Select something',
  enterpriseSlug: 'sluggy',
  startDate: '2021-04-13',
  expirationDate: '2024-04-13',
  licenses: {
    allocated: 10,
    total: 20,
  },
};

describe('SubscriptionCard', () => {
  it('displays a title', () => {
    renderWithRouter(<SubscriptionCard {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
  });
  describe('button link', () => {
    it('sets the correct default link', () => {
      const buttonText = 'click me!';
      const { history } = renderWithRouter(
        <SubscriptionCard {...defaultProps} buttonText={buttonText} />,
      );
      const button = screen.getByText(buttonText);
      userEvent.click(button);
      expect(history.location.pathname).toEqual(`/${defaultProps.enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${defaultProps.uuid}`);
    });
    it('sets the correct link from props, custom redirect', () => {
      const buttonText = 'click me!';
      const redirectPage = 'customredirect';
      const { history } = renderWithRouter(
        <SubscriptionCard {...defaultProps} buttonText={buttonText} redirectPage={redirectPage} />,
      );
      const button = screen.getByText(buttonText);
      userEvent.click(button);
      expect(history.location.pathname).toEqual(`/${defaultProps.enterpriseSlug}/admin/${redirectPage}/${defaultProps.uuid}`);
    });
  });
  describe('button text', () => {
    it('displays text received as a prop', () => {
      const buttonText = 'click me!';
      renderWithRouter(<SubscriptionCard {...defaultProps} buttonText={buttonText} />);
      expect(screen.getByText(buttonText)).toBeInTheDocument();
    });
    it('displays the correct text if license is not expired', () => {
      renderWithRouter(<SubscriptionCard {...defaultProps} />);
      expect(screen.getByText('Manage learners')).toBeInTheDocument();
    });
    it('displays the correct text for an expired license', () => {
      renderWithRouter(<SubscriptionCard {...defaultProps} expirationDate="2021-04-14" />);
      expect(screen.getByText('View learners')).toBeInTheDocument();
    });
  });
});
