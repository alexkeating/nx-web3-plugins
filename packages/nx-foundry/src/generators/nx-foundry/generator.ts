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
import { NxFoundryGeneratorSchema } from './schema';

interface NormalizedSchema extends NxFoundryGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
  className: string;
}

function normalizeOptions(tree: Tree, options: NxFoundryGeneratorSchema) {
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
    ...names(options.name),
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
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

export default async function (tree: Tree, options: NxFoundryGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `forge build --root ${normalizedOptions.projectRoot}`,
        },
      },
      install: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `forge install --root ${normalizedOptions.projectRoot} {args.package} --no-git`,
        },
      },
      deployLocal: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `forge create --rpc-url http://127.0.0.1:8545/ -i src/${normalizedOptions.className}.sol:Contract`,

          cwd: `./${normalizedOptions.projectRoot}`,
        },
      },

      test: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `forge test --root ${normalizedOptions.projectRoot}`,
        },
      },
      trace: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `forge test -vvvv --root ${normalizedOptions.projectRoot}`,
        },
      },
      clean: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: `forge clean --root ${normalizedOptions.projectRoot}`,
        },
      },
    },
    tags: normalizedOptions.parsedTags,
  });
  addFiles(tree, normalizedOptions);
  await getExecOutput(
    `forge install --root ${normalizedOptions.projectRoot} Rari-capital/solmate --no-git`
  );
  await getExecOutput(
    `forge install --root ${normalizedOptions.projectRoot} dapphub/ds-test --no-git`
  );

  await formatFiles(tree);
}
