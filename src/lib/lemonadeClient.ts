import { GraphQLClient } from "graphql-request";
import { getSdk } from "../generated/lemonade-sdk";

/**
 * Creates a GraphQL client for Lemonade.social
 * Works in both browser and Node environments under Vite.
 */
export function createLemonadeClient(authToken?: string) {
  const ENDPOINT =
    import.meta.env.VITE_LEMONADE_GRAPHQL_ENDPOINT ??
    "https://backend.lemonade.social/";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const client = new GraphQLClient(ENDPOINT, { headers });
  return getSdk(client);
}
