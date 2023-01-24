/* eslint-disable react/prop-types */
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { BUTTON_TEXT, STEPPER_STEP_TEXT, HEADER_TEXT } from '../data/constants';
import ContentHighlightsDashboard from '../ContentHighlightsDashboard';
import {
  initialStateValue,
  ContentHighlightsContext,
  testCourseHighlightsData,
} from '../../../data/tests/ContentHighlightsTestData';
import { initialStateValue as enterpriseContextInitialStateValue } from '../../../data/tests/EnterpriseAppTestData/context';

// Process property name into default api response
const exampleHighlightSet = testCourseHighlightsData[0];
exampleHighlightSet.highlightedContentUuids = exampleHighlightSet.highlightedContent;
delete exampleHighlightSet.highlightedContent;

const ContentHighlightsDashboardWrapper = ({
  value = initialStateValue,
  enterpriseAppContextValue = enterpriseContextInitialStateValue,
  props,
}) => (
  <ContentHighlightsContext enterpriseAppContextValue={enterpriseAppContextValue} value={value}>
    <ContentHighlightsDashboard {...props} />
  </ContentHighlightsContext>
);

describe('<ContentHighlightsDashboard>', () => {
  it('Displays ZeroState on empty highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    expect(screen.getByText('You haven\'t created any highlights yet.')).toBeTruthy();
  });

  it('Displays New highlight Modal on button click with no highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    const newHighlight = screen.getByText(BUTTON_TEXT.zeroStateCreateNewHighlight);
    userEvent.click(newHighlight);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
  });

  it('Displays current highlights when data is populated', () => {
    renderWithRouter(
      <ContentHighlightsDashboardWrapper
        enterpriseAppContextValue={{
          value: {
            enterpriseCuration: {
              enterpriseCuration: {
                highlightSets: [exampleHighlightSet],
              },
            },
          },
        }}
      />,
    );
    expect(screen.getByText(HEADER_TEXT.currentContent)).toBeInTheDocument();
  });

  it('Displays New highlight modal on button click with highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    const newHighlight = screen.getByText('New highlight');
    userEvent.click(newHighlight);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
  });
});
