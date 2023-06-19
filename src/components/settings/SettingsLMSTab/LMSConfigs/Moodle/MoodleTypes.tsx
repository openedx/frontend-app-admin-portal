export type MoodleConfigCamelCase = {
  lms: string;
  displayName: string;
  moodleBaseUrl: string;
  serviceShortName: string;
  token: string;
  username: string;
  password: string;
  id: string;
  active: boolean;
  uuid: string;
};

export type MoodleConfigSnakeCase = {
  lms: string;
  display_name: string;
  moodle_base_url: string;
  service_short_name: string;
  token: string;
  username: string;
  password: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
};
