import { DeployExecutorSchema } from './schema';
import executor from './executor';

const options: DeployExecutorSchema = {
  uploadDir: 'example',
  registryDataKey: 'skylink.txt',
  portalUrl: 'https://fileportal.org',
  registrySeedVarName: 'RegistrySeed',
};

describe('Deploy Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
