export type DegreedConfigCamelCase = {
  lms: string;
  displayName: string;
  clientId: string;
  clientSecret: string;
  degreedBaseUrl: string;
  degreedTokenFetchBaseUrl: string;
  id: string;
  active: boolean;
  uuid: string;
};

export type DegreedConfigSnakeCase = {
  lms: string;
  display_name: string;
  client_id: string;
  client_secret: string;
  degreed_base_url: string;
  degreed_token_fetch_base_url: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
  refresh_token: string;
};
