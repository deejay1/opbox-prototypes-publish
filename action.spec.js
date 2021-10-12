const action = require('./action');
const nock = require('nock');

describe('action', () => {

  test('simple case', async () => {
    // given
    const scope = nock('https://prototypes-manager', { reqheaders: { 'Authorization': 'Bearer apiToken' } })
      .post('/api/management/prototypes')
      .reply(200, {});

    // when
    await action('prototypes-manager', 'sc-1234', {
      all: [
        '__test__/prototypes/1.0.json'
      ],
      added: [
        '__test__/prototypes/1.0.json'
      ],
      modified: [],
      removed: [],
      renamed: [],
      addedModified: [
        '__test__/prototypes/1.0.json'
      ]
    }, '__test__/prototypes', 'apiToken');

    // expect
    expect(scope.pendingMocks()).toStrictEqual([]);
  });

});
