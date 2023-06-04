export type BlackboardConfigCamelCase = {
  lms: string;
  blackboardAccountId: string;
  blackboardBaseUrl: string;
  displayName: string;
  clientId: string;
  clientSecret: string;
  id: string;
  active: boolean;
  uuid: string;
  refreshToken: string;
};

export type BlackboardConfigSnakeCase = {
  lms: string;
  blackboard_base_url: string;
  display_name: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
  refresh_token: string;
};
