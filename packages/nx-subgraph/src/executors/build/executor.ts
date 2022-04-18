import { BuildExecutorSchema } from './schema';
import { exec } from '@actions/exec';
import { ExecutorContext } from '@nrwl/devkit';

// 1. Codegen subgraph for all specified networks
export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  console.log('Executor ran for Deploy', options);
  const codegenCode = await exec(`graph codegen ${context.cwd}/subgraph.yaml`);
  if (codegenCode !== 0) {
    return {
      success: false,
      exitCode: codegenCode,
    };
  }
  const buildCode = await exec(`graph build ${context.cwd}/subgraph.yaml`);
  if (buildCode !== 0) {
    return {
      success: false,
      exitCode: buildCode,
    };
  }
  return {
    success: true,
  };
}
