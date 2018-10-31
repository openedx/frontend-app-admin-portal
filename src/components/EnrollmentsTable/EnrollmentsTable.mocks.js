/* istanbul ignore next */
const mockEnrollmentFetchResponse = {
  count: 330,
  current_page: 1,
  num_pages: 7,
  results: [
    {
      id: 270, user_email: 'Abbey10@bestrun.com', course_title: 'Product Management with Lean, Agile and System Design Thinking', course_price: '200.00', course_start: '2017-10-21T23:47:32.738Z', course_end: '2018-05-13T12:47:27.534Z', passed_timestamp: null, has_passed: false, current_grade: 0.44, last_activity_date: '2018-08-09T10:59:28.628Z',
    }, {
      id: 307, user_email: 'Abdullah_Considine43@bestrun.com', course_title: 'Design Thinking: Empathizing to Understand the Problem', course_price: '200.00', course_start: '2018-03-12T23:25:43.522Z', course_end: '2018-05-06T21:29:02.027Z', passed_timestamp: '2018-05-02T13:43:30.243Z', has_passed: true, current_grade: 0.77, last_activity_date: '2018-08-28T12:47:04.904Z',
    }, {
      id: 265, user_email: 'Abe_Hessel@bestrun.com', course_title: 'Product Management with Lean, Agile and System Design Thinking', course_price: '200.00', course_start: '2018-08-23T20:20:45.783Z', course_end: '2018-10-21T11:05:46.091Z', passed_timestamp: null, has_passed: false, current_grade: 0.11, last_activity_date: '2018-08-19T05:21:57.713Z',
    }, {
      id: 201, user_email: 'Adah_Ortiz78@bestrun.com', course_title: 'Becoming a Successful Leader (Inclusive Leadership Training)', course_price: '50.00', course_start: '2017-12-20T03:18:05.495Z', course_end: '2018-08-21T19:24:07.678Z', passed_timestamp: '2018-01-08T19:47:12.514Z', has_passed: true, current_grade: 0.85, last_activity_date: '2018-08-03T14:49:53.381Z',
    }, {
      id: 43, user_email: 'Adolfo50@bestrun.com', course_title: 'u.lab: Leading Change in Times of Disruption', course_price: '49.00', course_start: '2018-07-24T14:11:14.137Z', course_end: '2019-06-22T04:23:47.264Z', passed_timestamp: '2019-02-25T15:40:57.764Z', has_passed: true, current_grade: 0.83, last_activity_date: '2018-09-13T17:36:05.725Z',
    }, {
      id: 248, user_email: 'Aglae.Koelpin57@bestrun.com', course_title: 'Introduction to the Internet of Things (IoT)', course_price: '99.00', course_start: '2017-09-25T09:18:18.146Z', course_end: '2018-07-12T09:19:37.098Z', passed_timestamp: '2017-10-14T06:57:33.233Z', has_passed: true, current_grade: 0.81, last_activity_date: '2018-09-10T12:02:13.938Z',
    }, {
      id: 251, user_email: 'Aimee_Lakin@bestrun.com', course_title: 'Understanding User Needs', course_price: '99.00', course_start: '2017-09-22T04:45:18.636Z', course_end: '2017-12-25T09:41:27.246Z', passed_timestamp: null, has_passed: false, current_grade: 0.61, last_activity_date: '2018-09-07T04:02:31.506Z',
    }, {
      id: 235, user_email: 'Albina.Walter11@bestrun.com', course_title: 'Teamwork & Collaboration', course_price: '49.00', course_start: '2017-10-05T07:11:51.057Z', course_end: '2018-01-21T21:40:29.739Z', passed_timestamp: '2017-12-27T21:19:16.295Z', has_passed: true, current_grade: 0.93, last_activity_date: '2018-09-02T14:34:14.697Z',
    }, {
      id: 168, user_email: 'Alek12@bestrun.com', course_title: 'Lean Production', course_price: '88.00', course_start: '2017-11-21T18:40:16.532Z', course_end: '2018-07-14T13:03:32.196Z', passed_timestamp: '2018-06-23T07:59:21.800Z', has_passed: true, current_grade: 0.83, last_activity_date: '2018-08-17T10:17:00.333Z',
    }, {
      id: 7, user_email: 'Alessia_Runolfsson10@bestrun.com', course_title: 'Storytelling in the Workplace', course_price: '49.00', course_start: '2017-12-20T15:03:43.935Z', course_end: '2018-10-06T11:31:56.338Z', passed_timestamp: '2018-06-04T19:48:17.656Z', has_passed: true, current_grade: 0.99, last_activity_date: '2018-09-09T10:17:03.923Z',
    }, {
      id: 68, user_email: 'Alexandria_Brakus@bestrun.com', course_title: 'Introduction to Computing in Python', course_price: '270.00', course_start: '2018-06-05T06:19:13.244Z', course_end: '2019-05-14T09:44:13.583Z', passed_timestamp: null, has_passed: false, current_grade: 0.02, last_activity_date: '2018-09-09T00:03:14.768Z',
    }, {
      id: 294, user_email: 'Aliya40@bestrun.com', course_title: 'Design Thinking: Empathizing to Understand the Problem', course_price: '200.00', course_start: '2018-04-06T02:31:34.527Z', course_end: '2019-01-03T12:17:44.768Z', passed_timestamp: '2018-04-15T06:40:50.995Z', has_passed: true, current_grade: 0.99, last_activity_date: '2018-09-12T10:53:25.165Z',
    }, {
      id: 62, user_email: 'Althea17@bestrun.com', course_title: 'Empathy and Emotional Intelligence at Work', course_price: '149.00', course_start: '2017-11-20T02:15:51.289Z', course_end: '2018-11-10T15:39:13.453Z', passed_timestamp: '2017-11-26T05:23:51.983Z', has_passed: true, current_grade: 0.9, last_activity_date: '2018-09-07T02:49:00.717Z',
    }, {
      id: 132, user_email: 'Alyce57@bestrun.com', course_title: 'Product Management with Lean, Agile and System Design Thinking', course_price: '200.00', course_start: '2018-01-12T14:37:17.763Z', course_end: '2018-04-04T03:51:43.899Z', passed_timestamp: '2018-02-08T05:47:27.801Z', has_passed: true, current_grade: 0.81, last_activity_date: '2018-08-17T01:58:27.944Z',
    }, {
      id: 16, user_email: 'Alysha.Veum@bestrun.com', course_title: 'Design Thinking: Empathizing to Understand the Problem', course_price: '200.00', course_start: '2018-05-10T06:59:41.809Z', course_end: '2018-12-20T10:12:31.911Z', passed_timestamp: '2018-06-22T01:06:11.646Z', has_passed: true, current_grade: 0.74, last_activity_date: '2018-08-21T05:48:56.760Z',
    }, {
      id: 212, user_email: 'Amely87@bestrun.com', course_title: 'Reputation Management in a Digital World', course_price: '99.00', course_start: '2017-12-25T20:25:31.359Z', course_end: '2018-12-07T02:21:06.071Z', passed_timestamp: null, has_passed: false, current_grade: 0, last_activity_date: '2018-09-12T07:40:18.016Z',
    }, {
      id: 208, user_email: 'Amos.Barrows56@bestrun.com', course_title: 'Strategic Brand Management', course_price: '199.00', course_start: '2018-07-07T04:31:59.586Z', course_end: '2018-12-11T10:59:40.201Z', passed_timestamp: '2018-07-13T06:32:30.453Z', has_passed: true, current_grade: 0.95, last_activity_date: '2018-09-14T11:34:00.577Z',
    }, {
      id: 171, user_email: 'Anahi.Hilpert@bestrun.com', course_title: 'Data Science: Machine Learning', course_price: '49.00', course_start: '2018-01-05T03:28:26.512Z', course_end: '2018-05-25T01:18:02.661Z', passed_timestamp: '2018-01-31T22:51:33.470Z', has_passed: true, current_grade: 0.8, last_activity_date: '2018-09-11T12:34:55.314Z',
    }, {
      id: 10, user_email: 'Annabel.Mosciski74@bestrun.com', course_title: 'Empathy and Emotional Intelligence at Work', course_price: '149.00', course_start: '2018-02-02T22:49:52.852Z', course_end: '2018-06-27T14:31:28.885Z', passed_timestamp: '2018-06-01T22:03:03.677Z', has_passed: true, current_grade: 0.87, last_activity_date: '2018-08-01T09:49:14.943Z',
    }, {
      id: 124, user_email: 'Annabel22@bestrun.com', course_title: 'Business Analytics for Data-Driven Decision Making', course_price: '200.00', course_start: '2018-07-12T13:13:10.680Z', course_end: '2019-06-12T20:51:55.423Z', passed_timestamp: '2019-02-07T16:17:05.976Z', has_passed: true, current_grade: 0.9, last_activity_date: '2018-09-07T17:01:53.025Z',
    }, {
      id: 292, user_email: 'Annie.Renner@bestrun.com', course_title: 'Platform Strategy for Business', course_price: '200.00', course_start: '2018-03-20T15:14:15.703Z', course_end: '2018-04-09T17:00:56.034Z', passed_timestamp: '2018-03-22T09:46:56.446Z', has_passed: true, current_grade: 0.8, last_activity_date: '2018-08-31T09:17:35.394Z',
    }, {
      id: 285, user_email: 'Annie48@bestrun.com', course_title: 'Platform Strategy for Business', course_price: '200.00', course_start: '2018-01-26T22:40:48.694Z', course_end: '2018-07-28T03:18:06.080Z', passed_timestamp: null, has_passed: false, current_grade: 0.39, last_activity_date: '2018-09-07T19:18:30.021Z',
    }, {
      id: 300, user_email: 'April62@bestrun.com', course_title: 'Visual Presentation', course_price: '49.00', course_start: '2018-06-06T14:56:11.644Z', course_end: '2018-09-22T17:44:52.948Z', passed_timestamp: null, has_passed: false, current_grade: 0.63, last_activity_date: '2018-09-12T21:14:30.021Z',
    }, {
      id: 163, user_email: 'Archibald92@bestrun.com', course_title: 'Strategic Brand Management', course_price: '199.00', course_start: '2017-12-01T00:05:28.598Z', course_end: '2018-03-05T08:48:56.548Z', passed_timestamp: '2018-02-25T16:39:18.439Z', has_passed: true, current_grade: 0.81, last_activity_date: '2018-09-12T20:49:19.122Z',
    }, {
      id: 128, user_email: 'Arianna.Oberbrunner72@bestrun.com', course_title: 'Statistical Thinking for Data Science and Analytics', course_price: '99.00', course_start: '2018-07-22T13:40:46.097Z', course_end: '2018-10-05T07:53:38.943Z', passed_timestamp: null, has_passed: false, current_grade: 0.3, last_activity_date: '2018-08-14T01:50:53.864Z',
    }, {
      id: 69, user_email: 'Arlene.Bernier95@bestrun.com', course_title: 'Visual Presentation', course_price: '49.00', course_start: '2018-04-04T16:49:46.685Z', course_end: '2018-11-29T11:07:04.355Z', passed_timestamp: '2018-06-22T05:29:58.146Z', has_passed: true, current_grade: 0.87, last_activity_date: '2018-08-21T12:02:50.688Z',
    }, {
      id: 80, user_email: 'Arlo_McCullough@bestrun.com', course_title: 'Design Thinking: Empathizing to Understand the Problem', course_price: '200.00', course_start: '2017-12-12T08:24:39.675Z', course_end: '2018-06-30T19:42:53.562Z', passed_timestamp: '2018-05-11T03:53:55.142Z', has_passed: true, current_grade: 0.79, last_activity_date: '2018-09-08T10:07:55.760Z',
    }, {
      id: 90, user_email: 'Arturo14@bestrun.com', course_title: "CS50's Introduction to Computer Science", course_price: '90.00', course_start: '2018-06-05T19:37:17.929Z', course_end: '2018-11-16T11:25:01.849Z', passed_timestamp: '2018-10-12T12:25:20.884Z', has_passed: true, current_grade: 0.92, last_activity_date: '2018-09-10T21:13:54.362Z',
    }, {
      id: 329, user_email: 'Arvid_Osinski@bestrun.com', course_title: 'Teamwork & Collaboration', course_price: '49.00', course_start: '2018-06-30T11:55:15.791Z', course_end: '2018-08-16T21:06:15.238Z', passed_timestamp: null, has_passed: false, current_grade: 0.54, last_activity_date: '2018-09-13T04:22:35.117Z',
    }, {
      id: 280, user_email: 'Asia_Corkery@bestrun.com', course_title: 'Cloud Computing for Enterprises', course_price: '249.00', course_start: '2017-10-21T14:09:53.780Z', course_end: '2017-11-15T21:42:36.684Z', passed_timestamp: null, has_passed: false, current_grade: 0.3, last_activity_date: '2018-08-12T08:41:18.391Z',
    }, {
      id: 318, user_email: 'Athena.Hamill@bestrun.com', course_title: 'Introduction to FinTech', course_price: '99.00', course_start: '2018-08-28T12:38:18.071Z', course_end: '2018-12-14T13:55:49.346Z', passed_timestamp: '2018-11-12T06:49:42.542Z', has_passed: true, current_grade: 0.94, last_activity_date: '2018-09-08T22:50:59.332Z',
    }, {
      id: 226, user_email: 'Athena31@bestrun.com', course_title: 'Best Practices for Project Management Success', course_price: '150.00', course_start: '2018-03-09T03:03:38.981Z', course_end: '2018-06-29T02:16:24.389Z', passed_timestamp: null, has_passed: false, current_grade: 0.48, last_activity_date: '2018-09-11T17:22:00.743Z',
    }, {
      id: 257, user_email: 'Augustine_DAmore@bestrun.com', course_title: 'Storytelling in the Workplace', course_price: '49.00', course_start: '2018-06-14T03:20:25.250Z', course_end: '2018-07-25T12:12:15.567Z', passed_timestamp: '2018-07-24T05:23:12.403Z', has_passed: true, current_grade: 0.95, last_activity_date: '2018-09-14T07:46:46.842Z',
    }, {
      id: 33, user_email: 'Aylin_Bauch78@bestrun.com', course_title: 'Artificial Intelligence (AI)', course_price: '199.00', course_start: '2017-12-03T11:48:53.418Z', course_end: '2018-11-12T15:38:42.085Z', passed_timestamp: null, has_passed: false, current_grade: 0.45, last_activity_date: '2018-09-11T11:36:01.946Z',
    }, {
      id: 156, user_email: 'Bernadine24@bestrun.com', course_title: 'Six Sigma: Define and Measure', course_price: '88.00', course_start: '2017-12-23T14:47:19.039Z', course_end: '2018-09-17T22:15:12.413Z', passed_timestamp: '2018-04-12T03:13:26.059Z', has_passed: true, current_grade: 0.97, last_activity_date: '2018-09-08T17:19:32.539Z',
    }, {
      id: 58, user_email: 'Berneice_Stracke29@bestrun.com', course_title: 'Cloud Computing for Enterprises', course_price: '249.00', course_start: '2018-02-23T12:41:53.132Z', course_end: '2018-03-16T13:22:04.695Z', passed_timestamp: '2018-03-02T08:35:07.146Z', has_passed: true, current_grade: 0.86, last_activity_date: '2018-09-07T13:09:14.353Z',
    }, {
      id: 182, user_email: 'Bernita76@bestrun.com', course_title: 'Storytelling in the Workplace', course_price: '49.00', course_start: '2018-08-16T04:34:40.031Z', course_end: '2018-11-09T11:22:09.940Z', passed_timestamp: null, has_passed: false, current_grade: 0.55, last_activity_date: '2018-09-08T14:25:22.128Z',
    }, {
      id: 310, user_email: 'Beryl70@bestrun.com', course_title: 'Bitcoin and Cryptocurrencies', course_price: '99.00', course_start: '2018-07-19T08:40:04.727Z', course_end: '2019-03-31T18:12:54.864Z', passed_timestamp: '2019-02-14T01:49:24.933Z', has_passed: true, current_grade: 0.89, last_activity_date: '2018-09-14T08:41:19.036Z',
    }, {
      id: 19, user_email: 'Betsy81@bestrun.com', course_title: 'Leadership and Management for PM Practitioners in IT', course_price: '99.00', course_start: '2018-07-12T23:01:51.117Z', course_end: '2018-09-14T16:53:58.616Z', passed_timestamp: null, has_passed: false, current_grade: 0.3, last_activity_date: '2018-09-05T01:43:09.525Z',
    }, {
      id: 150, user_email: 'Bettie.Kub90@bestrun.com', course_title: 'Foundations of Data Science: Computational Thinking with Python', course_price: '99.00', course_start: '2018-04-12T03:10:04.321Z', course_end: '2018-10-25T08:11:55.481Z', passed_timestamp: '2018-10-04T17:04:52.362Z', has_passed: true, current_grade: 0.76, last_activity_date: '2018-09-04T07:40:06.098Z',
    }, {
      id: 239, user_email: 'Bill_Friesen26@bestrun.com', course_title: 'Reputation Management in a Digital World', course_price: '99.00', course_start: '2017-12-06T18:14:22.647Z', course_end: '2018-05-21T23:28:21.493Z', passed_timestamp: '2018-02-27T00:27:31.010Z', has_passed: true, current_grade: 0.86, last_activity_date: '2018-08-28T08:48:27.389Z',
    }, {
      id: 81, user_email: 'Blair81@bestrun.com', course_title: 'Business Writing', course_price: '267.30', course_start: '2018-03-21T05:12:04.555Z', course_end: '2018-10-10T07:17:35.029Z', passed_timestamp: '2018-10-10T01:47:44.899Z', has_passed: true, current_grade: 0.9, last_activity_date: '2018-08-14T14:07:49.431Z',
    }, {
      id: 151, user_email: 'Bradley_Schmeler35@bestrun.com', course_title: 'Leadership and Management for PM Practitioners in IT', course_price: '99.00', course_start: '2017-11-28T02:59:30.044Z', course_end: '2018-08-13T08:36:09.336Z', passed_timestamp: '2017-12-07T16:43:50.321Z', has_passed: true, current_grade: 0.83, last_activity_date: '2018-09-12T11:24:30.544Z',
    }, {
      id: 323, user_email: 'Brandy_Langworth@bestrun.com', course_title: 'Management in Engineering I', course_price: '175.00', course_start: '2018-02-25T01:12:45.088Z', course_end: '2019-02-06T23:26:23.425Z', passed_timestamp: '2018-07-17T12:54:14.079Z', has_passed: true, current_grade: 0.9, last_activity_date: '2018-09-12T09:24:04.114Z',
    }, {
      id: 15, user_email: 'Brennon.Orn98@bestrun.com', course_title: 'Data Science: Wrangling', course_price: '49.00', course_start: '2018-08-30T17:24:08.705Z', course_end: '2018-12-23T12:56:54.992Z', passed_timestamp: '2018-10-13T19:24:06.765Z', has_passed: true, current_grade: 0.72, last_activity_date: '2018-08-19T08:36:13.678Z',
    }, {
      id: 218, user_email: 'Brent.Leffler@bestrun.com', course_title: 'Network Security', course_price: '150.00', course_start: '2017-12-26T09:15:46.965Z', course_end: '2018-12-23T16:23:19.627Z', passed_timestamp: '2018-01-04T14:29:23.146Z', has_passed: true, current_grade: 0.94, last_activity_date: '2018-09-13T20:08:19.373Z',
    }, {
      id: 123, user_email: 'Brent35@bestrun.com', course_title: 'Management in Engineering I', course_price: '175.00', course_start: '2017-10-16T02:14:37.764Z', course_end: '2018-03-17T05:59:58.395Z', passed_timestamp: '2018-01-03T00:17:27.344Z', has_passed: true, current_grade: 0.84, last_activity_date: '2018-08-27T12:59:30.975Z',
    }, {
      id: 4, user_email: 'Brianne_Feest@bestrun.com', course_title: 'Understanding User Needs', course_price: '99.00', course_start: '2018-03-09T19:07:57.898Z', course_end: '2018-06-07T15:02:44.230Z', passed_timestamp: '2018-06-02T15:20:36.556Z', has_passed: true, current_grade: 0.91, last_activity_date: '2018-08-11T06:46:32.974Z',
    }, {
      id: 187, user_email: 'Britney_Barton@bestrun.com', course_title: 'Leadership and Management for PM Practitioners in IT', course_price: '99.00', course_start: '2018-03-07T21:52:33.412Z', course_end: '2018-07-25T17:58:49.988Z', passed_timestamp: null, has_passed: false, current_grade: 0.17, last_activity_date: '2018-09-12T23:11:36.560Z',
    }, {
      id: 308, user_email: 'Brody26@bestrun.com', course_title: 'Leading With Effective Communication (Inclusive Leadership Training)', course_price: '50.00', course_start: '2018-01-28T13:14:00.903Z', course_end: '2018-08-16T12:32:38.249Z', passed_timestamp: '2018-02-22T23:50:49.435Z', has_passed: true, current_grade: 0.71, last_activity_date: '2018-09-05T17:47:45.184Z',
    }],
};

const mockEnrollmentFetchSmallerResponse = {
  count: 6,
  current_page: 1,
  num_pages: 1,
  results: [
    {
      id: 270, user_email: 'Abbey10@bestrun.com', course_title: 'Product Management with Lean, Agile and System Design Thinking', course_price: '200.00', course_start: '2017-10-21T23:47:32.738Z', course_end: '2018-05-13T12:47:27.534Z', passed_timestamp: null, has_passed: false, current_grade: 0.44, last_activity_date: '2018-08-09T10:59:28.628Z',
    }, {
      id: 307, user_email: 'Abdullah_Considine43@bestrun.com', course_title: 'Design Thinking: Empathizing to Understand the Problem', course_price: '200.00', course_start: '2018-03-12T23:25:43.522Z', course_end: '2018-05-06T21:29:02.027Z', passed_timestamp: '2018-05-02T13:43:30.243Z', has_passed: true, current_grade: 0.77, last_activity_date: '2018-08-28T12:47:04.904Z',
    }, {
      id: 265, user_email: 'Abe_Hessel@bestrun.com', course_title: 'Product Management with Lean, Agile and System Design Thinking', course_price: '200.00', course_start: '2018-08-23T20:20:45.783Z', course_end: '2018-10-21T11:05:46.091Z', passed_timestamp: null, has_passed: false, current_grade: 0.11, last_activity_date: '2018-08-19T05:21:57.713Z',
    }, {
      id: 201, user_email: 'Adah_Ortiz78@bestrun.com', course_title: 'Becoming a Successful Leader (Inclusive Leadership Training)', course_price: '50.00', course_start: '2017-12-20T03:18:05.495Z', course_end: '2018-08-21T19:24:07.678Z', passed_timestamp: '2018-01-08T19:47:12.514Z', has_passed: true, current_grade: 0.85, last_activity_date: '2018-08-03T14:49:53.381Z',
    }, {
      id: 43, user_email: 'Adolfo50@bestrun.com', course_title: 'u.lab: Leading Change in Times of Disruption', course_price: '49.00', course_start: '2018-07-24T14:11:14.137Z', course_end: '2019-06-22T04:23:47.264Z', passed_timestamp: '2019-02-25T15:40:57.764Z', has_passed: true, current_grade: 0.83, last_activity_date: '2018-09-13T17:36:05.725Z',
    }, {
      id: 248, user_email: 'Aglae.Koelpin57@bestrun.com', course_title: 'Introduction to the Internet of Things (IoT)', course_price: '99.00', course_start: '2017-09-25T09:18:18.146Z', course_end: '2018-07-12T09:19:37.098Z', passed_timestamp: '2017-10-14T06:57:33.233Z', has_passed: true, current_grade: 0.81, last_activity_date: '2018-09-10T12:02:13.938Z',
    }, {
      id: 999, user_email: 'nullguy@bestrun.com', course_title: 'Introduction to the Internet of Things (IoT)', course_price: null, course_start: null, course_end: null, passed_timestamp: null, has_passed: true, current_grade: null, last_activity_date: null,
    }],
};

/* eslint-disable import/prefer-default-export, object-curly-newline */
export {
  mockEnrollmentFetchResponse,
  mockEnrollmentFetchSmallerResponse,
};
