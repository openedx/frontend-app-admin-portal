import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { TEST_ENTERPRISE_SLUG } from '../../../data/tests/constants';
import { ContentHighlightsContext, testHighlightSet } from '../../../data/tests/ContentHighlightsTestData';
import ContentHighlightRoutes from '../ContentHighlightRoutes';

describe('ContentHighlightRoutes', () => {
  it('renders zero state', () => {
    const { container } = renderWithRouter(
      <ContentHighlightsContext>
        <ContentHighlightRoutes />
      </ContentHighlightsContext>,
      { route: `/${TEST_ENTERPRISE_SLUG}/admin/content-highlights` },
    );
    expect(container).toMatchSnapshot();
  });
  it('renders highlight set', () => {
    const { container } = renderWithRouter(
      <ContentHighlightsContext enterpriseAppContextValues={{
        value: {
          enterpriseCuration: {
            enterpriseCuration: {
              highlightSets: [testHighlightSet],
            },
          },
        },
      }}
      >
        <ContentHighlightRoutes />
      </ContentHighlightsContext>,
      { route: `/${TEST_ENTERPRISE_SLUG}/admin/content-highlights/${testHighlightSet.uuid}` },
    );
    expect(container).toMatchSnapshot();
  });
});
