import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useFeatureFlag(key: string): boolean {
  const flag = useQuery(api.featureFlags.getFeatureFlag, { key });
  return flag ?? false;
} 