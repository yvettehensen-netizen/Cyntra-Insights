import { SaaSPlatformFacade } from "./SaaSPlatformFacade";

let singleton: SaaSPlatformFacade | null = null;

export function getSaaSPlatform(): SaaSPlatformFacade {
  if (!singleton) singleton = new SaaSPlatformFacade();
  return singleton;
}
