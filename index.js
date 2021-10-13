const core = require('@actions/core');
const changedFiles = require('./util/changedFiles');
const action = require('./action');
const github = require('@actions/github');
const glob = require('glob-promise');
const path = require('path');

const token = core.getInput('token', { required: true });
const apiToken = core.getInput('apiToken', { required: true });
const host = core.getInput('host', { required: true });
const scId = core.getInput('sc-id', { required: true });
const pathX = core.getInput('path', { required: true });

const context = github.context;

let files = {};
let base;
let head;

(async () => {
  switch (context.eventName) {
    case 'pull_request':
      base = context.payload.pull_request.base.sha;
      head = context.payload.pull_request.head.sha;
      files = await changedFiles(github.getOctokit(token), context.repo.owner, context.repo.repo, base, head);
      break;
    case 'push':
      base = context.payload.before;
      head = context.payload.after;
      files = await changedFiles(github.getOctokit(token), context.repo.owner, context.repo.repo, base, head);
      break;
    case 'workflow_dispatch':
      // how to handle depracted files when sending whole state?
      files = {
        removed: [],
        addedModified: await glob(path.resolve(pathX, '/**/*'), { dot: true, nodir: true })
      };
      break;
    default:
      core.setFailed(`This action only supports pull requests and pushes, ${context.eventName} events are not supported.`);
      process.exit(1);
  }
  if ((!base || !head) && context.eventName !== 'workflow_dispatch') {
    core.setFailed(`The base and head commits are missing from the payload for this ${context.eventName} event.`);
    process.exit(1);
  }
  core.info(`Base commit: ${base}`);
  core.info(`Head commit: ${head}`);
  core.info(`Files detected: ${files}`);
  const repositoryUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}`;
  await action(host, scId, files, pathX, apiToken, repositoryUrl);
})();
