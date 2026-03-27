export type UserDto = {
  id: string;
  email: string;
  fullName: string;
};

export type TenantDto = {
  id: string;
  name: string;
  slug?: string;
  timezone?: string;
};

export type AuthSessionDto = {
  user: UserDto;
  tenant: TenantDto;
};

export type SubscriptionDto = {
  id: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: string | null;
  plan?: {
    code: string;
    name: string;
    priceMonthly: number;
    currency: string;
  } | null;
} | null;

export type WhatsAppStatusDto = {
  connected: boolean;
  status: string;
  phoneNumber?: string | null;
  wabaId?: string | null;
};

export type WhatsAppStartDto = {
  appId: string;
  configId: string;
  state: string;
  responseType: "code";
  overrideDefaultResponseType: true;
};

export type WhatsAppCompletePayload = {
  code: string;
  state: string;
  wabaId?: string;
  phoneNumberId?: string;
  businessAccountName?: string;
  displayPhoneNumber?: string;
};

export type WhatsAppCompleteResponse = {
  ok: boolean;
  integration: {
    id: string;
    status: string;
    wabaId?: string | null;
    phoneNumberId?: string | null;
    phoneNumber?: string | null;
  };
};

export type WhatsAppSendTestPayload = {
  to: string;
  text: string;
};

export type WhatsAppSendTestResponse = {
  ok: boolean;
  provider: string;
  providerMessageId?: string;
  logId?: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  tenantName: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};
