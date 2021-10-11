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
    const result = await changedFiles(
      github.getOctokit('token'),
      'test-owner',
      'test-repo',
      '6dcb09b5b57875f334f61aebed695e2e4193db5e',
      'bbcd538c8e72b8c175046e27cc8f907076331401'
    );

    // expect
    expect(result).toEqual({
      removed: [],
      addedModified: [
        'prototypes/allegro/container/1.0.json'
      ]
    });
  });

});
