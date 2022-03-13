export interface DeployExecutorSchema {
  uploadDir: string;
  tryFiles?: string;
  notFoundPage?: string;
  registrySeedVarName?: string;
  registryDataKey: string;
  portalUrl?: string;
  skynetJwtVarName?: string;
}
