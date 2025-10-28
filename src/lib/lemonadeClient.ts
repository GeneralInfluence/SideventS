import { GraphQLClient } from "graphql-request";
import { getSdk } from "@/generated/lemonade-sdk";

const ENDPOINT =
  process.env.LEMONADE_GRAPHQL_ENDPOINT ?? "https://backend.lemonade.social/";

export function createLemonadeClient(authToken?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const client = new GraphQLClient(ENDPOINT, { headers });
  return getSdk(client);
}
