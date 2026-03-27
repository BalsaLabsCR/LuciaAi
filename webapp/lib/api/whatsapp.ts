import { apiClient } from "./client";
import type {
  WhatsAppCompletePayload,
  WhatsAppCompleteResponse,
  WhatsAppSendTestPayload,
  WhatsAppSendTestResponse,
  WhatsAppStartDto,
  WhatsAppStatusDto,
} from "./types";

export const whatsappApi = {
  getStatus: () =>
    apiClient.get<WhatsAppStatusDto>("/api/integrations/whatsapp/status"),
  start: () =>
    apiClient.post<WhatsAppStartDto>("/api/integrations/whatsapp/start"),
  complete: (payload: WhatsAppCompletePayload) =>
    apiClient.post<WhatsAppCompleteResponse>("/api/integrations/whatsapp/complete", payload),
  sendTestMessage: (payload: WhatsAppSendTestPayload) =>
    apiClient.post<WhatsAppSendTestResponse>("/api/integrations/whatsapp/send-message", {
      to: payload.to,
      type: "text",
      text: payload.text,
    }),
};
