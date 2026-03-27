import { apiClient } from "./client";
import type { SubscriptionDto } from "./types";

export const billingApi = {
  getSubscription: () =>
    apiClient.get<{ subscription: SubscriptionDto }>("/api/billing/subscription"),
};
