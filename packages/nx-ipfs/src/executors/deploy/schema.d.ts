type CloudflareSchema = {
  cloudflareZoneID: string;
  cloudflareToken: string;
  recordName: string;
  recordDomain: string;
};

export interface DeployExecutorSchema {
  verbose: boolean;
  removeOldDeploy?: boolean;
  pinName: string;
  uploadPath: string;
  pinataApiKey: string;
  pinataSecretApiKey: string;
  cloudflare?: CloudflareSchema;
}
