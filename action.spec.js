const action = require('./action');
const nock = require('nock');
const glob = require('glob-promise');

describe('action', () => {

  test('simple case', async () => {
    // given
    const scope = nock('https://prototypes-manager', { reqheaders: { 'Authorization': 'Bearer apiToken' } })
      .post('/api/management/prototypes')
      .reply(200, {});

    // when
    await action('prototypes-manager', 'sc-1234', {
      removed: [],
      addedModified: [
        '__test__/prototypes/1.0.json'
      ]
    }, '__test__/prototypes', 'apiToken', 'https://github.com/allegro-actions/test');

    // expect
    expect(scope.pendingMocks()).toStrictEqual([]);
  });

  test('simple case2', async () => {
    // given
    const scope = nock('https://prototypes-manager', { reqheaders: { 'Authorization': 'Bearer apiToken' } })
      .post('/api/management/prototypes')
      .reply(200, {})
      .post('/api/management/prototypes')
      .reply(200, {})
      .post('/api/management/prototypes/DATASOURCE/test-file2/deprecated')
      .reply(200, {});

    // when
    await action('prototypes-manager', 'sc-1234', {
      removed: [],
      addedModified: await glob('__test__/prototypes/**/*', { dot: true, nodir: true })
    }, '__test__/prototypes', 'apiToken', 'https://github.com/allegro-actions/test');

    // expect
    expect(scope.pendingMocks()).toStrictEqual([]);
  });
});
