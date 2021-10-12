const nock = require('nock');
const github = require('@actions/github');

const changedFiles = require('./changedFiles');

describe('changedFiles.js', () => {

  test('simple case', async () => {
    // given
    nock('https://api.github.com')
      .get('/repos/test-owner/test-repo/compare/6dcb09b5b57875f334f61aebed695e2e4193db5e...bbcd538c8e72b8c175046e27cc8f907076331401')
      .reply(200, {
        status: 'ahead',
        files: [
          {
            sha: 'bbcd538c8e72b8c175046e27cc8f907076331401',
            filename: 'prototypes/allegro/container/1.0.json',
            status: 'added'
          }
        ]
      });

    // when
    const result = await changedFiles(github.getOctokit('token'), {
      ...github.context,
      repo: {
        repo: 'test-repo',
        owner: 'test-owner'
      },
      eventName: 'pull_request',
      payload: {
        pull_request: {
          base: {
            sha: '6dcb09b5b57875f334f61aebed695e2e4193db5e'
          },
          head: {
            sha: 'bbcd538c8e72b8c175046e27cc8f907076331401'
          }
        }
      }
    });

    // expect
    expect(result).toEqual({
      all: [
        'prototypes/allegro/container/1.0.json'
      ],
      added: [
        'prototypes/allegro/container/1.0.json'
      ],
      modified: [],
      removed: [],
      renamed: [],
      addedModified: [
        'prototypes/allegro/container/1.0.json'
      ]
    });
  });

});
