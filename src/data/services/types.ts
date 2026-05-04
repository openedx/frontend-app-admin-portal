export type PaginatedApiResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type BackendAuthoringOrganizationResponse = {
  uuid: string;
  name: string;
  logo_image_url: string | null;
};

export type BackendHighlightedContentItemResponse = {
  uuid: string;
  content_type: string;
  content_key: string;
  title: string;
  card_image_url: string | null;
  aggregation_key?: string | null;
  course_run_statuses?: string[] | null;
  authoring_organizations: BackendAuthoringOrganizationResponse[];
};

export type BackendHighlightSetResponse = {
  uuid: string;
  title: string;
  is_published: boolean;
  enterprise_curation: string;
  highlighted_content: BackendHighlightedContentItemResponse[];
};

export type HighlightedContentAuthoringOrganization = {
  uuid: string;
  name: string;
  logoImageUrl: string | null;
};

export type HighlightedContentItem = {
  uuid: string;
  contentType: string;
  contentKey: string;
  title: string;
  cardImageUrl: string | null;
  aggregationKey?: string | null;
  courseRunStatuses?: string[] | null;
  authoringOrganizations: HighlightedContentAuthoringOrganization[];
  isFavorite?: boolean;
};

export type HighlightSet = {
  uuid: string;
  title: string;
  isPublished: boolean;
  enterpriseCuration: string;
  highlightedContent: HighlightedContentItem[];
};
