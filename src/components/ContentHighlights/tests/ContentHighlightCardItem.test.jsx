import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import userEvent from '@testing-library/user-event';

import ContentHighlightCardItem from '../ContentHighlightCardItem';
import { generateAboutPageUrl } from '../data/utils';
import { BaseContext } from '../../../data/tests/context';
import { testCourseHighlightsData } from '../../../data/tests/ContentHighlightsTestData';
import { TEST_ENTERPRISE_SLUG } from '../../../data/tests/constants';
import 'jest-canvas-mock';

const testHighlightedContent = testCourseHighlightsData[0]?.highlightedContent[0];

const ContentHighlightCardItemContainerWrapper = (props) => (
  <BaseContext>
    <ContentHighlightCardItem {...props} />
  </BaseContext>
);

describe('<ContentHighlightCardItem>', () => {
  it('Does not render a hyperlink if href is not specified', () => {
    renderWithRouter(<ContentHighlightCardItemContainerWrapper
      isLoading={false}
      title={testHighlightedContent.title}
      contentType={testHighlightedContent.contentType.toLowerCase()}
      partners={testHighlightedContent.authoringOrganizations}
    />);
    expect(screen.queryByTestId('hyperlink-title')).not.toBeInTheDocument();
  });
  it('Sets title as hyperlink when href populated', () => {
    const trackClickEvent = jest.fn();
    renderWithRouter(<ContentHighlightCardItemContainerWrapper
      isLoading={false}
      title={testHighlightedContent.title}
      contentType={testHighlightedContent.contentType.toLowerCase()}
      partners={testHighlightedContent.authoringOrganizations}
      hyperlinkAttrs={
        {
          href: generateAboutPageUrl({
            enterpriseSlug: TEST_ENTERPRISE_SLUG,
            contentType: testHighlightedContent.contentType.toLowerCase(),
            contentKey: testHighlightedContent.contentKey,
          }),
          target: '_blank',
          onClick: () => trackClickEvent(),
        }
      }
    />);
    const hyperlink = screen.getByTestId('hyperlink-title');
    expect(hyperlink).toBeInTheDocument();
    expect(hyperlink.href).toContain(`${TEST_ENTERPRISE_SLUG}/${testHighlightedContent.contentType.toLowerCase()}/${testHighlightedContent.contentKey}`);
    userEvent.click(hyperlink);
    expect(trackClickEvent).toHaveBeenCalled();
  });
});
