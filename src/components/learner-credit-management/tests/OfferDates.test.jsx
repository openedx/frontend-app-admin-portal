import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';
import moment from 'moment';

import OfferDates from '../OfferDates';
import { DATE_FORMAT } from '../data/constants';

describe('<OfferDates />', () => {
  it('with no dates provided, nothing is rendered', () => {
    render(<OfferDates />);
    expect(screen.queryByTestId('formatted-dates')).toBeFalsy();
  });

  describe('with start date only', () => {
    it('date is past', () => {
      const startDate = moment('2022-01-31');
      const props = {
        start: startDate.toISOString(),
      };
      render(<OfferDates {...props} />);
      expect(screen.queryByTestId('formatted-dates')).toBeTruthy();
      expect(screen.getByText(`Started ${startDate.format(DATE_FORMAT)}`, { exact: false }));
    });
    it('date is current/future', () => {
      const startDate = moment().add(5, 'd');
      const props = {
        start: startDate.toISOString(),
      };
      render(<OfferDates {...props} />);
      expect(screen.queryByTestId('formatted-dates')).toBeTruthy();
      expect(screen.getByText(`Starts ${startDate.format(DATE_FORMAT)}`, { exact: false }));
    });
  });

  describe('with end date only', () => {
    it('date is past', () => {
      const endDate = moment('2022-01-31');
      const props = {
        end: endDate.toISOString(),
      };
      render(<OfferDates {...props} />);
      expect(screen.queryByTestId('formatted-dates')).toBeTruthy();
      expect(screen.getByText(`Ended ${endDate.format(DATE_FORMAT)}`, { exact: false }));
    });
    it('date is current/future', () => {
      const endDate = moment().add(5, 'd');
      const props = {
        end: endDate.toISOString(),
      };
      render(<OfferDates {...props} />);
      expect(screen.queryByTestId('formatted-dates')).toBeTruthy();
      expect(screen.getByText(`Ends ${endDate.format(DATE_FORMAT)}`, { exact: false }));
    });
  });

  describe('with both start and end dates', () => {
    it('displays both dates', () => {
      const startDate = moment('2022-01-31');
      const endDate = startDate.add(1, 'y');
      const props = {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      };
      render(<OfferDates {...props} />);
      expect(screen.queryByTestId('formatted-dates')).toBeTruthy();
      const formattedString = `${startDate.format(DATE_FORMAT)} - ${endDate.format(DATE_FORMAT)}`;
      expect(screen.getByText(formattedString, { exact: false }));
    });
  });
});
