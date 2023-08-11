export type SAPConfigCamelCase = {
  lms: string;
  displayName: string;
  sapsfBaseUrl: string;
  sapsfCompanyId: string;
  sapsfUserId: string;
  key: string;
  secret: string;
  userType: string;
  id: string;
  active: boolean;
  uuid: string;
};

export type SAPConfigSnakeCase = {
  lms: string;
  display_name: string;
  sapsf_base_url: string;
  sapsf_company_id: string;
  sapsf_user_id: string;
  key: string;
  secret: string;
  user_type: string;
  id: string;
  active: boolean;
  uuid: string;
  enterprise_customer: string;
};
