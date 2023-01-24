/* eslint-disable react/prop-types */
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import userEvent from '@testing-library/user-event';
import HighlightSetSection from '../HighlightSetSection';
import { initialStateValue, testHighlightSet, ContentHighlightsContext } from '../../../data/tests/ContentHighlightsTestData';

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const HighlightSetSectionWrapper = ({
  enterpriseAppContextValue = {
    value: {
      enterpriseCuration: {
        enterpriseCuration: {
          highlightSets: testHighlightSet,
        },
      },
    },
  },
  value = initialStateValue,
  highlightSetArray = [],
}) => (
  <ContentHighlightsContext enterpriseAppContextValue={enterpriseAppContextValue} value={value}>
    <HighlightSetSection highlightSets={highlightSetArray} />
  </ContentHighlightsContext>
);

describe('<HighlightSetSection />', () => {
  it('renders null if highlight set is empty', () => {
    renderWithRouter(<HighlightSetSectionWrapper />);

    expect(screen.queryByTestId('highlight-set-section')).not.toBeInTheDocument();
  });
  it('renders 4 elements with test highlight set', () => {
    renderWithRouter(<HighlightSetSectionWrapper highlightSetArray={[testHighlightSet]} />);

    expect(screen.getByText('4', { exact: false })).toBeInTheDocument();
  });
  it('sends segment event on click', () => {
    renderWithRouter(<HighlightSetSectionWrapper highlightSetArray={[testHighlightSet]} />);
    const highlightSetCard = screen.getByTestId('highlight-set-card');
    userEvent.click(highlightSetCard);

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });
});
