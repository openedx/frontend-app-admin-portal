// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';

// TrackEventNamingScheme for ContentHighlights
export const TRACK_EVENT_BASE = 'edx.ui.enterprise.admin_portal';
export const TRACK_EVENT_NAMES = {
  NEW_HIGHLIHT: `${TRACK_EVENT_BASE}.create_new_highlight`,
  STEPPER_STEP_CREATE_TITLE: `${TRACK_EVENT_BASE}.stepper_create_title`,
  STEPPER_STEP_SELECT_CONTENT: `${TRACK_EVENT_BASE}.stepper_select_content`,
};
// Base data info for ContentHighlights
export const CONTENT_HIGHLIGHTS_BASE_DATA = (e, enterpriseId, title, uuid, created, modified) => ({
  event: {
    event_type: e.nativeEvent.type,
    event_type_interaction: e.target.type,
    event_type_interaction_label: e.target.textContent,
  },
  enterprise_id: enterpriseId,
  enterprise_name: title,
  enterprise_curation_uuid: uuid,
  enterprise_curation_created: created,
  enterprise_curation_modified: modified,
});
// Max number of content items per highlight set
export const MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET = 12;
// Max length of highlight title in stepper
export const HIGHLIGHT_TITLE_MAX_LENGTH = 60;
// Stepper Step Text that match testing components
export const STEPPER_STEP_TEXT = {
  createTitle: 'Create a title for your highlight',
  selectContent: 'Add content to your highlight',
  confirmContent: 'Confirm your content selections',
};
// Header text extracted into constant to maintain passing test on changes
export const HEADER_TEXT = {
  currentContent: 'Highlights',
};
// Button text extracted from constant to maintain passing test on changes
export const BUTTON_TEXT = {
  createNewHighlight: 'New',
  zeroStateCreateNewHighlight: 'New highlight',
};

// Default footer values based on API response for ContentHighlightCardItem
export const FOOTER_TEXT_BY_CONTENT_TYPE = {
  course: 'Course',
  program: 'Program',
  learnerpathway: 'Pathway',
};

// Test Data for Content Highlights
export const TEST_COURSE_HIGHLIGHTS_DATA = [
  {
    uuid: faker.datatype.uuid(),
    title: 'Dire Core',
    is_published: true,
    enterprise_curation: '321123',
    highlighted_content:
    [
      {
        uuid: faker.datatype.uuid(),
        content_type: 'Course',
        content_key: 'edX+DemoX',
        title: 'Math',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            name: 'General Studies 1',
            logo_image_url: 'https://placekitten.com/200/100',
          },
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'Super General Studies',
          },
        ],
      },
      {
        title: 'Science',
        content_type: 'Learnerpathway',
        uuid: faker.datatype.uuid(),
        content_key: 'edX+DemoX',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'General Studies 2',
          },
        ],
      },
      {
        title: 'English',
        content_type: 'Program',
        uuid: faker.datatype.uuid(),
        content_key: 'edX+DemoX',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'General Studies 3',
          },
        ],
      },
    ],
  },
  {
    title: 'Dire Math',
    uuid: faker.datatype.uuid(),
    is_published: true,
    enterprise_curation: '321123',
    highlighted_content:
    [
      {
        title: 'Math Xtreme',
        content_type: 'Course',
        uuid: faker.datatype.uuid(),
        content_key: 'edX+DemoX',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'Matheletes',
          },
        ],
      },
      {
        title: 'Science for Math Majors',
        content_type: 'Course',
        uuid: faker.datatype.uuid(),
        content_key: 'edX+DemoX',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'Matheletes',
          },
        ],
      },
      {
        title: 'English Divergence',
        content_type: 'Course',
        uuid: faker.datatype.uuid(),
        content_key: 'edX+DemoX',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'Matheletes',
          },
        ],
      },
    ],
  },
  {
    title: 'Dire Science',
    uuid: faker.datatype.uuid(),
    is_published: false,
    enterprise_curation: '321123',
    highlighted_content:
    [
      {
        title: 'Math for Science Majors',
        content_type: 'Course',
        uuid: faker.datatype.uuid(),
        content_key: 'edX+DemoX',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'The Beakers',
          },
        ],
      },
      {
        title: 'Science Xtreme',
        content_type: 'Course',
        uuid: faker.datatype.uuid(),
        content_key: 'edX+DemoX',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'The Beakers',
          },
        ],
      },
      {
        title: 'English Obfuscation',
        content_type: 'Course',
        uuid: faker.datatype.uuid(),
        content_key: 'edX+DemoX',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'The Beakers',
          },
        ],
      },
    ],
  },
  {
    title: 'Dire English',
    uuid: faker.datatype.uuid(),
    is_published: true,
    enterprise_curation: '321123',
    highlighted_content:
    [
      {
        title: 'To Math or not Math',
        content_type: 'Course',
        uuid: faker.datatype.uuid(),
        content_key: 'edX+DemoX',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'Extensive Etymology',
          },
        ],
      },
      {
        title: 'Science for English Majors',
        content_type: 'Course',
        uuid: faker.datatype.uuid(),
        content_key: 'edX+DemoX',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'Extensive Etymology',
          },
        ],
      },
      {
        title: 'Moore English: Lawlessness Refined',
        content_type: 'Course',
        uuid: faker.datatype.uuid(),
        content_key: 'edX+DemoX',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'Extensive Etymology',
          },
        ],
      },
    ],
  },
  {
    title: 'Dire Engineering',
    uuid: faker.datatype.uuid(),
    is_published: true,
    enterprise_curation: '321123',
    highlighted_content:
    [
      {
        title: 'Math for Engineering Majors',
        content_type: 'Course',
        uuid: faker.datatype.uuid(),
        content_key: 'edX+DemoX',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'Building Bridges',
          },
        ],
      },
      {
        title: 'Science for Engineering Majors',
        content_type: 'Course',
        uuid: faker.datatype.uuid(),
        content_key: 'edX+DemoX',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'Building Bridges',
          },
        ],
      },
      {
        title: 'English Instantiation',
        content_type: 'Course',
        uuid: faker.datatype.uuid(),
        content_key: 'edX+DemoX',
        card_image_url: 'https://picsum.photos/360/200',
        authoring_organizations:
        [
          {
            uuid: faker.datatype.uuid(),
            logo_image_url: 'https://placekitten.com/200/100',
            name: 'Building Bridges',
          },
        ],
      },
    ],
  },
];
