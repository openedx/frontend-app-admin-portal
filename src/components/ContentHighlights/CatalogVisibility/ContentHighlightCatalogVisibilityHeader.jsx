import { FormattedMessage } from '@edx/frontend-platform/i18n';

const ContentHighlightCatalogVisibilityHeader = () => (
  <div className="mt-4.5">
    <h2 className="mb-3">
      <FormattedMessage
        id="highlights.catalog.visibility.tab.header.message"
        defaultMessage="Catalog Visibility"
        description="Header message shown to admin when catalog visibility tab is selected."
      />
    </h2>
    <p>
      <FormattedMessage
        id="highlights.catalog.visibility.tab.sub.header.message"
        defaultMessage="Choose a visibility for your catalog"
        description="Sub header message shown to admin when catalog visibility tab is selected."
      />
    </p>
    <p>
      <strong>
        <FormattedMessage
          id="highlights.catalog.visibility.tab.pro.tip.message"
          defaultMessage="Pro tip: regardless of your choice, learners will be able to see all highlight collections."
          description="Pro tip message shown to admin when catalog visibility tab is selected."
        />
      </strong>
    </p>
  </div>
);

export default ContentHighlightCatalogVisibilityHeader;
