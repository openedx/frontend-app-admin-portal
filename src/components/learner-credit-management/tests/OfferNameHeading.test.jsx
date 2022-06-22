import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';

import OfferNameHeading from '../OfferNameHeading';

describe('<OfferNameHeading />', () => {
  it('with offer name present, display it', () => {
    const offerName = 'Test Enterprise Offer Title';
    render(<OfferNameHeading name={offerName} />);
    expect(screen.getByText(offerName));
  });

  it('without offer name present, fallback to "Overview"', async () => {
    render(<OfferNameHeading />);
    expect(screen.getByText('Overview'));
  });
});
