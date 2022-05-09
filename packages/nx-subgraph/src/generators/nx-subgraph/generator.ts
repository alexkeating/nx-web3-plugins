import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import { getExecOutput } from '@actions/exec';
import * as path from 'path';
import { NxSubgraphGeneratorSchema } from './schema';

// TODO: Reimplement graph init
// Reason is that it does a couple
// things that aren't great with nx
// like install dependencies and
// setup a separate packate.json
//

interface NormalizedSchema extends NxSubgraphGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: NxSubgraphGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

// graph init \
//   --product subgraph-studio
//   --from-contract <CONTRACT_ADDRESS> \
//   [--network <ETHEREUM_NETWORK>] \
//   [--abi <FILE>] \
//   <SUBGRAPH_SLUG> [<DIRECTORY>]
export default async function (tree: Tree, options: NxSubgraphGeneratorSchema) {
  console.log(options);
  console.log(options.contract.toString(16));
  const product = options.product || 'subgraph-studio';
  const normalizedOptions = normalizeOptions(tree, options);
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `graph codegen ${normalizedOptions.projectRoot}/subgraph.yaml`,
        },
      },
      deployLocal: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `graph deploy ${normalizeOptions.name} --node http://127.0.0.1:8020 --ipfs http://localhost:5001`,
          cwd: normalizedOptions.projectRoot,
        },
      },
      createLocal: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `graph create ${normalizedOptions.name} --node http://127.0.0.1:8020`,
          cwd: normalizedOptions.projectRoot,
        },
      },
      init: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `graph init`,
          cwd: 'apps/baal-subgraph',
        },
      },
    },
    tags: normalizedOptions.parsedTags,
  });
  // addFiles(tree, normalizedOptions);
  //
  // What to generate?
  // Start with the contract abi or contract and network?
  // Generate initial handlers in the mapping.ts
  // https://github.com/graphprotocol/graph-cli/issues/837 networks.json
  //
  // const output = await getExecOutput(
  //   `graph init \
  // 		--protocol ethereum \
  // 	  --product ${product} \
  // 		--network ${normalizedOptions.network}
  // 		--node  ${normalizedOptions.product}
  // 		--from-contract 0x${normalizedOptions.contract.toString(16)} \
  // 		${normalizedOptions.name} ${normalizedOptions.projectDirectory}
  // 	`
  // );
  // if (output.exitCode !== 0) {
  //   return {
  //     success: false,
  //     error: output.stderr,
  //   };
  // }
  await formatFiles(tree);
}
