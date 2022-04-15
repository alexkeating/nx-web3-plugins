import { CreateExecutorSchema } from './schema';
import executor from './executor';

const options: CreateExecutorSchema = { name: 'here', node: 'there' };

describe('Build Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
