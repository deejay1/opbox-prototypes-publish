const core = require('@actions/core');

/**
 * Returns all modified files
 *
 * @param client github client
 * @param owner repo owner
 * @param repo repo name
 * @param base base commit
 * @param head head commit
 * @returns {Promise<{addedModified: String[], removed: String[]}>}
 */
module.exports = async function (client, owner, repo, base, head) {

  const response = await client.rest.repos.compareCommits({
    base,
    head,
    owner,
    repo
  });

  if (response.status !== 200) {
    core.setFailed(`The GitHub API for comparing the base and head commits returned ${response.status}, expected 200.`);
    process.exit(1);
  }

  if (response.data.status !== 'ahead') {
    core.setFailed('The head commit is not ahead of the base commit.');
    process.exit(1);
  }

  const result = {
    addedModified: [],
    removed: []
  };

  for (const file of response.data.files) {
    const filename = file.filename;
    switch (file.status) {
      case 'added':
        result.addedModified.push(filename);
        break;
      case 'modified':
        result.addedModified.push(filename);
        break;
      case 'removed':
        result.removed.push(filename);
        break;
      case'renamed':
        break;
      default:
        core.setFailed(`One of your files includes an unsupported file status '${file.status}', expected 'added', 'modified', 'removed', or 'renamed'.`);
    }
  }

  return result;
};


