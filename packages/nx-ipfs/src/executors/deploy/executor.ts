import { DeployExecutorSchema } from './schema';
import { deployPinata } from './utils/pinata';
import { updateDNSLink, getDNSRecord } from './utils/cloudflare';

export default async function runExecutor(options: DeployExecutorSchema) {
  console.log('Executor ran for Build', options);
  const pinataApiKey = process.env[options.pinataApiKey];
  const pinataSecretApiKey = process.env[options.pinataSecretApiKey];
  try {
    const hash = await deployPinata({
      verbose: options.verbose,
      removeOld: options.removeOldDeploy,
      pinName: options.pinName,
      buildPath: options.uploadPath,
      apiKey: pinataApiKey,
      secretApiKey: pinataSecretApiKey,
    });
    console.log(`Frontend deployed to hash ${hash}`);
    if (options.cloudflare) {
      console.log('Switching cloudflare DNS');
      const cloudflareZoneID = process.env[options.cloudflare.cloudflareZoneID];
      const cloudflareToken = process.env[options.cloudflare.cloudflareToken];
      const resp = await getDNSRecord({
        cloudflareZoneID: cloudflareZoneID,
        recordName: options.cloudflare.recordName,
        recordDomain: options.cloudflare.recordDomain,
      });
      const body = await resp.json();
      if (body.result_info.total_count === 0) {
        throw Error(
          `Pages Update: No record found. Follow Cloudflare setup instructions to add an initial IPFS record for ${options.cloudflare.recordName}`
        );
      }
      for (const record of body.result) {
        await updateDNSLink({
          recordId: record.id,
          cloudflareZoneID: cloudflareZoneID,
          cloudflareToken: cloudflareToken,
          recordName: options.cloudflare.recordName,
          recordDomain: options.cloudflare.recordDomain,
          hash,
        });
      }
    }
  } catch (e) {
    console.log(`Failed to deploy properly`);
    throw Error(e);
  }
  console.log('Successfully updated');
  return {
    success: true,
  };
}
