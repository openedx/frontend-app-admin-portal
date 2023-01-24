/* eslint-disable react/prop-types */
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import CurrentContentHighlights from '../CurrentContentHighlights';
// import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { BUTTON_TEXT, HEADER_TEXT } from '../data/constants';
import { initialStateValue as initialEnterpriseAppContextValue } from '../../../data/tests/EnterpriseAppTestData/context';
import {
  ContentHighlightsContext, initialStateValue, testHighlightSet,
} from '../../../data/tests/ContentHighlightsTestData';

const CurrentContentHighlightsWrapper = ({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  value = initialStateValue,
  ...props
}) => (
  <ContentHighlightsContext enterpriseAppContextValue={enterpriseAppContextValue} value={value}>
    <CurrentContentHighlights {...props} />
  </ContentHighlightsContext>
);

describe('<CurrentContentHighlights>', () => {
  it('Displays the header title', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText(HEADER_TEXT.currentContent)).toBeInTheDocument();
  });
  it('Displays the header button', () => {
    renderWithRouter(<CurrentContentHighlightsWrapper />);
    expect(screen.getByText(BUTTON_TEXT.createNewHighlight)).toBeInTheDocument();
  });

  describe('ContentHighlightSetCardContainer', () => {
    it('Displays no highlight set cards', () => {
      renderWithRouter(<CurrentContentHighlightsWrapper />);
      expect(screen.queryByText('Published')).not.toBeInTheDocument();
      expect(screen.queryByText('Drafts')).not.toBeInTheDocument();
    });
    it('Displays draft highlight set cards', () => {
      renderWithRouter(
        <CurrentContentHighlightsWrapper
          enterpriseAppContextValue={
              {
                value: {
                  enterpriseCuration: {
                    enterpriseCuration: {
                      highlightSets: [{
                        ...testHighlightSet,
                        isPublished: false,
                      },
                      ],
                    },
                  },
                },
              }
}
        />,
      );
      expect(screen.getByText('Drafts')).toBeInTheDocument();
      expect(screen.getByText(testHighlightSet.title)).toBeInTheDocument();
    });
    it('Displays published highlight set cards', () => {
      renderWithRouter(
        <CurrentContentHighlightsWrapper
          enterpriseAppContextValue={{
            value: {
              enterpriseCuration: {
                enterpriseCuration: {
                  highlightSets: [{
                    ...testHighlightSet,
                    isPublished: true,
                  }],
                },
              },
            },
          }}
        />,
      );
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText(testHighlightSet.title)).toBeInTheDocument();
    });
  });
});
