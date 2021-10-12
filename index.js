const core = require('@actions/core');
const changedFiles = require('./util/changedFiles');
const action = require('./action');
const github = require('@actions/github');

const token = core.getInput('token', { required: true });
const apiToken = core.getInput('apiToken', { required: true });
const host = core.getInput('host', { required: true });
const scId = core.getInput('sc-id', { required: true });
const path = core.getInput('path', { required: true });

(async () => {
  const files = await changedFiles(github.getOctokit(token), github.context);
  await action(host, scId, files, path, apiToken);
})();
