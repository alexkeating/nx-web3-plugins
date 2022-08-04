import { DeployExecutorSchema } from './schema';
import { SkynetClient, genKeyPairFromSeed } from '@skynetlabs/skynet-nodejs';

function prepareClientOptions(
  skynetJwt: string | undefined,
  skynetApi: string | undefined
) {
  const options = {} as { customCookie: string; skynetApiKey: string };

  if (skynetJwt) {
    // transform skynet-jwt into a cookie accepted format
    options.customCookie = `skynet-jwt=${skynetJwt}`;
    return options;
  }
  if (skynetApi) {
    options.skynetApiKey = skynetApi;
    return options;
  }

  return options;
}

function prepareUploadOptions(
  tryFiles: string | undefined,
  notFoundPage: string | undefined
) {
  const options = {} as { tryFiles?: string[]; errorPages?: { 404: string } };

  if (tryFiles) {
    // transform try-files input which is space separated list
    // of file paths into an array of those paths
    options.tryFiles = tryFiles.split(/\s+/);
  }

  if (notFoundPage) {
    // transform not-found-page input which is a single file path into
    // an object with a 404 key and its value being the specified path
    options.errorPages = { 404: notFoundPage };
  }

  return options;
}

export default async function runExecutor(options: DeployExecutorSchema) {
  const skynetJwt = process.env[options.skynetJwtVarName];
  const skynetApiKey = process.env[options.skynetApiKeyVarName];
  const registrySeed = process.env[options.registrySeedVarName];
  try {
    const skynetClient = new SkynetClient(
      options?.portalUrl,
      prepareClientOptions(skynetJwt, skynetApiKey)
    );
    const skylink = await skynetClient.uploadDirectory(
      options.uploadDir,
      prepareUploadOptions(options?.tryFiles, options?.notFoundPage)
    );

    // generate base32 skylink url from base64 skylink
    const skylinkUrl = await skynetClient.getSkylinkUrl(skylink, {
      subdomain: true,
    });

    console.log(`Skylink: ${skylink}`);

    console.log(`Deployed to: ${skylinkUrl}`);

    // if registry is properly configured, update the skylink in the entry
    if (registrySeed && options.registryDataKey) {
      try {
        const seed = registrySeed;
        const dataKey = options.registryDataKey;
        const { publicKey, privateKey } = genKeyPairFromSeed(seed);

        const [entryUrl, resolverSkylink, dataLink] = await Promise.all([
          skynetClient.registry.getEntryUrl(publicKey, dataKey),
          skynetClient.registry.getEntryLink(publicKey, dataKey),
          skynetClient.db.setDataLink(privateKey, dataKey, skylink),
        ]);
        const resolverUrl = await skynetClient.getSkylinkUrl(resolverSkylink, {
          subdomain: true,
        });
        console.log(`Registry entry updated: ${entryUrl}`);
        console.log(`Resolver Skylink Url: ${resolverUrl}`);
        console.log(`Resolver Skylink: ${resolverSkylink}`);
        console.log(`Resolver data link: ${dataLink}`);
      } catch (error) {
        console.log(`Failed to update registry entry: ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`Failed to deploy: ${error.message}`);
  }

  return {
    success: true,
  };
}
