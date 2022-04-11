import { DeployExecutorSchema } from './schema';
import { exec } from '@actions/exec';

// 1. Codegen subgraph for all specified networks
export default async function runExecutor(options: DeployExecutorSchema) {
  console.log('Executor ran for Deploy', options);
  const cmdOptions = `${options.subgraph} --node ${options?.node} --ipfs ${options.ipfs}`;
  const codegenCode = await exec(`graph deploy ${cmdOptions}`);
  if (codegenCode !== 0) {
    return {
      success: false,
      exitCode: codegenCode,
    };
  }
  return {
    success: true,
  };
}
