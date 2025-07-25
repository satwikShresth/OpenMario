import type { CreateClientConfig } from "./client/client.gen";

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: "/api",
  auth: () => localStorage.getItem("access_token") || "",
});
