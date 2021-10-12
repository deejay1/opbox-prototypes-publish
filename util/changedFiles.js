const core = require('@actions/core');

/**
 * Returns all modified files
 *
 * @param client github client
 * @param context github context
 * @returns {Promise<{all: String[], removed: String[], added: String[], addedModified: String[], modified: String[], renamed: String[]}>}
 */
module.exports = async function (client, context) {

  let base;
  let head;

  switch (context.eventName) {
    case 'pull_request':
      base = context.payload.pull_request.base.sha;
      head = context.payload.pull_request.head.sha;
      break;
    case 'push':
      base = context.payload.before;
      head = context.payload.after;
      break;
    default:
      core.setFailed(`This action only supports pull requests and pushes, ${context.eventName} events are not supported.`);
      process.exit(1);
  }

  core.info(`Base commit: ${base}`);
  core.info(`Head commit: ${head}`);

  if (!base || !head) {
    core.setFailed(`The base and head commits are missing from the payload for this ${context.eventName} event.`);
    process.exit(1);
  }

  const response = await client.rest.repos.compareCommits({
    base,
    head,
    owner: context.repo.owner,
    repo: context.repo.repo
  });

  if (response.status !== 200) {
    core.setFailed(`The GitHub API for comparing the base and head commits for this ${context.eventName} event returned ${response.status}, expected 200.`);
    process.exit(1);
  }

  if (response.data.status !== 'ahead') {
    core.setFailed(`The head commit for this ${context.eventName} event is not ahead of the base commit.`);
    process.exit(1);
  }

  const result = {
    all: [],
    added: [],
    modified: [],
    removed: [],
    renamed: [],
    addedModified: []
  };

  for (const file of response.data.files) {
    const filename = file.filename;
    result.all.push(filename);
    switch (file.status) {
      case 'added':
        result.added.push(filename);
        result.addedModified.push(filename);
        break;
      case 'modified':
        result.modified.push(filename);
        result.addedModified.push(filename);
        break;
      case 'removed':
        result.removed.push(filename);
        break;
      case'renamed':
        result.renamed.push(filename);
        break;
      default:
        core.setFailed(`One of your files includes an unsupported file status '${file.status}', expected 'added', 'modified', 'removed', or 'renamed'.`);
    }
  }

  return result;
};


