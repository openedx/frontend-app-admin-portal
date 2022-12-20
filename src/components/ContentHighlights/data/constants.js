// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';

// Default Card Grid columnSizes
export const HIGHLIGHTS_CARD_GRID_COLUMN_SIZES = {
  xs: 12,
  md: 6,
  lg: 4,
  xl: 3,
};
// Empty Content and Error Messages
export const DEFAULT_ERROR_MESSAGE = {
  EMPTY_HIGHLIGHT_SET: 'There is no highlighted content for this highlight collection.',
  // eslint-disable-next-line quotes
  EMPTY_SELECTEDROWIDS: `You don't have any highlighted content selected. Go back to the previous step to select content.`,
};
// Max highlight sets per enteprise curation
export const MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION = 8;
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

// Test Data for Content Highlights From this point onwards
// Test entepriseId for Content Highlights to display card selections and confirmation
export const testEnterpriseId = 'e783bb19-277f-479e-9c41-8b0ed31b4060';
// Test Content Highlights data
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

export const testCourseData = [
  {
    aggregationKey: 'course:HarvardX+CS50x',
    title: 'CS50s Introduction to Computer Science',
    contentType: 'course',
    partners: [
      {
        name: 'Harvard University',
        logoImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/44022f13-20df-4666-9111-cede3e5dc5b6-2cc39992c67a.png',
      },
    ],
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/da1b2400-322b-459b-97b0-0c557f05d017-3b9fb73b5d5d.small.jpg',
    originalImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/da1b2400-322b-459b-97b0-0c557f05d017-a3d1899c3344.png',
    firstEnrollablePaidSeatPrice: 149,
  },
  {
    aggregationKey: 'course:HarvardX+CS50P',
    title: 'CS50s Introduction to Programming with Python',
    contentType: 'course',
    partners: [
      {
        name: 'Harvard University',
        logoImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/44022f13-20df-4666-9111-cede3e5dc5b6-2cc39992c67a.png',
      },
    ],
    originalImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/2cc794d0-316d-42f7-bbfd-25c34e4cd5df-033e46d516c0.png',
    firstEnrollablePaidSeatPrice: 200,
  },
  {
    aggregationKey: 'course:HarvardX+CS50W',
    title: 'CS50s Web Programming with Python and JavaScript',
    contentType: 'course',
    partners: [
      {
        name: 'Harvard University',
        logoImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/44022f13-20df-4666-9111-cede3e5dc5b6-2cc39992c67a.png',
      },
    ],
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/8f8e5124-1dab-47e6-8fa6-3fbdc0738f0a-762af069070e.small.jpg',
    originalImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/8f8e5124-1dab-47e6-8fa6-3fbdc0738f0a-4978ad93b1c3.png',
    firstEnrollablePaidSeatPrice: 249,
  },
  {
    aggregationKey: 'course:HarvardX+CS50AI',
    title: 'CS50s Introduction to Artificial Intelligence with Python',
    contentType: 'course',
    partners: [
      {
        name: 'Harvard University',
        logoImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/44022f13-20df-4666-9111-cede3e5dc5b6-2cc39992c67a.png',
      },
    ],
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/3a31db71-de8f-45f1-ae65-11981ed9d680-31634d40b3bb.small.png',
    originalImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/3a31db71-de8f-45f1-ae65-11981ed9d680-b801bb328333.png',
    firstEnrollablePaidSeatPrice: 199,
  },
];
testCourseData.forEach((element, index) => {
  if (!element.objectID) {
    // added to mimic the objectID prop passed by `connectStateResults` with Algolia
    testCourseData[index].objectID = index + 1;
  }
});

export const testCourseAggregation = {
  'course:HarvardX+CS50W': true,
  'course:HarvardX+CS50AI': true,
  'course:HarvardX+CS50P': true,
  'course:HarvardX+CS50x': true,
};
