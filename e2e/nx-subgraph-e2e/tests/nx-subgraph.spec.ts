import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';
describe('nx-subgraph e2e', () => {
  it('should create nx-subgraph', async () => {
    const plugin = uniq('nx-subgraph');
    ensureNxProject('@daohaus/nx-subgraph', 'dist/packages/nx-subgraph');
    await runNxCommandAsync(
      `generate @daohaus/nx-subgraph:nx-subgraph ${plugin}`
    );

    const result = await runNxCommandAsync(`build ${plugin}`);
    expect(result.stdout).toContain('Executor ran');
  }, 120000);

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const plugin = uniq('nx-subgraph');
      ensureNxProject('@daohaus/nx-subgraph', 'dist/packages/nx-subgraph');
      await runNxCommandAsync(
        `generate @daohaus/nx-subgraph:nx-subgraph ${plugin} --directory subdir`
      );
      expect(() =>
        checkFilesExist(`libs/subdir/${plugin}/src/index.ts`)
      ).not.toThrow();
    }, 120000);
  });

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const plugin = uniq('nx-subgraph');
      ensureNxProject('@daohaus/nx-subgraph', 'dist/packages/nx-subgraph');
      await runNxCommandAsync(
        `generate @daohaus/nx-subgraph:nx-subgraph ${plugin} --tags e2etag,e2ePackage`
      );
      const project = readJson(`libs/${plugin}/project.json`);
      expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
    }, 120000);
  });
});
