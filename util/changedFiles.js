const core = require('@actions/core');

/**
 * Returns all modified files
 *
 * @param client github client
 * @param owner repo owner
 * @param repo repo name
 * @param base base commit
 * @param head head commit
 * @returns {Promise<{removed: Set<String>, addedModified: Set<String>}>}
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
    addedModified: new Set(),
    removed: new Set()
  };

  for (const file of response.data.files) {
    const filename = file.filename;
    switch (file.status) {
      case 'added':
        result.addedModified.add(filename);
        break;
      case 'modified':
        result.addedModified.add(filename);
        break;
      case 'removed':
        result.removed.add(filename);
        break;
      case'renamed':
        result.addedModified.add(filename);
        break;
      default:
        core.setFailed(`One of your files includes an unsupported file status '${file.status}', expected 'added', 'modified', 'removed', or 'renamed'.`);
    }
  }

  return result;
};


