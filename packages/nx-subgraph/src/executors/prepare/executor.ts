import { PrepareExecutorSchema } from './schema';
import { prepareFile } from './prepare';
import { ExecutorContext } from '@nrwl/devkit';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { safeLoad } from 'js-yaml';

// 1. Codegen subgraph for all specified networks
export default async function runExecutor(
  options: PrepareExecutorSchema,
  context: ExecutorContext
) {
  console.log('Executor ran for prepare', options);
  const configContents = readFileSync(
    resolve(`${context.cwd}/manifests`, 'config.yaml'),
    'utf-8'
  );
  const data = safeLoad(configContents);
  prepareFile(data, options.networks, context.cwd);
  return {
    success: true,
  };
}
