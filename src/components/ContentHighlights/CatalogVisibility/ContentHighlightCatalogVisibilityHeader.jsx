import { HEADER_TEXT } from '../data/constants';

const ContentHighlightCatalogVisibilityHeader = () => (
  <div className="mt-4.5">
    <h2 className="mb-3">
      {HEADER_TEXT.catalogVisibility}
    </h2>
    <p>
      {HEADER_TEXT.SUB_TEXT.catalogVisibility}
    </p>
    <p>
      <strong>
        {HEADER_TEXT.PRO_TIP_TEXT.catalogVisibility}
      </strong>
    </p>
  </div>
);

export default ContentHighlightCatalogVisibilityHeader;
