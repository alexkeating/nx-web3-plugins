import { BuildExecutorSchema } from './schema';
import { exec } from '@actions/exec';

// 1. Codegen subgraph for all specified networks
export default async function runExecutor(options: BuildExecutorSchema) {
  console.log('Executor ran for Deploy', options);
  const codegenCode = await exec('yarn run codegen');
  if (codegenCode !== 0) {
    return {
      success: false,
      exitCode: codegenCode,
    };
  }
  const buildCode = await exec('yarn run build');
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
