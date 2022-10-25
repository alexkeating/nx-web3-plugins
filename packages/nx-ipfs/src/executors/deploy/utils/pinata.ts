import pinataSDK from '@pinata/sdk';
import * as fsPath from 'path';

// // Getting all inputs
// const path = core.getInput('path');
// const pinName = core.getInput('pin-name');
// const pinataApiKey = core.getInput('pinata-api-key');
// const pinataSecretApiKey = core.getInput('pinata-secret-api-key');
// const verbose = core.getInput('verbose');
// const removeOld = core.getInput('remove-old');

// Getting workspace directory
const workspace = process.env.GITHUB_WORKSPACE.toString();

// Function to unpin old hashes
function unpinHash(hashToUnpin, verbose, pinata) {
  pinata
    .unpin(hashToUnpin)
    .then((result) => {
      if (verbose) {
        console.log(result);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to search for all old pins with the same name and unpin them if they are not the latest one
const removeOldPinsSaving = async (hash, verbose, pinName, pinata) => {
  const metadataFilter = {
    name: pinName,
  };
  const filters = {
    status: 'pinned',
    pageLimit: 1000,
    pageOffset: 0,
    metadata: metadataFilter,
  };
  const result = await pinata.pinList(filters);
  if (verbose) {
    console.log(result);
  }
  result.rows.forEach((element) => {
    if (element.ipfs_pin_hash != hash) {
      unpinHash(element.ipfs_pin_hash, verbose, pinata);
    }
  });
};

// Deploying (pining) to IPFS using Pinata from file system
export const deployPinata = async ({
  verbose,
  removeOld,
  pinName,
  buildPath,
  apiKey,
  secretApiKey,
}: {
  verbose: boolean;
  removeOld: boolean;
  pinName: string;
  buildPath: string;
  apiKey: string;
  secretApiKey: string;
}) => {
  // Constructing Pinata options
  const options = {
    pinataMetadata: {
      name: pinName,
    },
    pinataOptions: {
      cidVersion: 0 as 0 | 1,
      wrapWithDirectory: false,
    },
  };

  if (verbose) {
    console.log('workspace: ' + workspace);
  }

  // If path is absolute use it
  let sourcePath = buildPath;

  // Otherwise combine it using workspace and provided path
  if (!fsPath.isAbsolute(buildPath)) {
    sourcePath = fsPath.join(workspace, buildPath);
  }

  if (verbose) {
    console.log('path: ' + buildPath);
    console.log('sourcePath: ' + sourcePath);
  }

  // Connecting to Pinata
  const pinata = pinataSDK(apiKey, secretApiKey);

  const result = await pinata.pinFromFS(sourcePath, options);

  if (verbose) {
    console.log(result);
    console.log('HASH: ' + result.IpfsHash);
  }

  if (removeOld) {
    await removeOldPinsSaving(result.IpfsHash, verbose, pinName, pinata);
  }

  return result.IpfsHash;
};
