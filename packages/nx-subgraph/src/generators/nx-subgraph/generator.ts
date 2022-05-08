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
  const product = options.product || 'subgraph-studio';
  const normalizedOptions = normalizeOptions(tree, options);
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@daohaus/nx-subgraph:build',
      },
    },
    tags: normalizedOptions.parsedTags,
  });
  // addFiles(tree, normalizedOptions);
  const output = await getExecOutput(
    `graph init \
		  --product ${product} \
			--from-contract ${normalizedOptions.contract} \
			--network ${normalizedOptions.network} \
			--abi ${normalizedOptions.abi} \
			${normalizedOptions.name} ${normalizedOptions.directory}
		`
  );
  if (output.exitCode !== 0) {
    return {
      success: false,
      error: output.stderr,
    };
  }
  await formatFiles(tree);
}
