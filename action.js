const core = require('@actions/core');
const fs = require('fs');
const fetch = require('node-fetch');

module.exports = async function publishPrototypes(host, scId, files, path, apiToken, repositoryUrl) {

  const changedPrototypes = files.addedModified.filter(it => it.startsWith(path)).filter(it => it.endsWith('.json')).filter(it => !it.includes('latest.json'));
  const deprecatedPrototypes = files.addedModified.filter(it => it.startsWith(path)).filter(it => it.endsWith('.deprecated'));
  const undeprecatedPrototypes = files.removed.filter(it => it.startsWith(path)).filter(it => it.endsWith('.deprecated'));

  for (const prototypeFile of changedPrototypes) {
    core.info(`updating ${prototypeFile}`);
    const prototype = String(fs.readFileSync(prototypeFile, 'utf8'));
    const response = await fetch(
      `https://${host}/api/management/prototypes`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiToken}`,
          accept: 'application/vnd.opbox-page-manager.v2+json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({ serviceCatalogId: scId, repositoryUrl, prototype: JSON.parse(prototype) })
      }
    );
    console.log(response.status, await response.json());
  }

  const deprecations = [...deprecatedPrototypes.map(it => ({
    file: it,
    deprecated: true
  })), ...undeprecatedPrototypes.map(it => ({ file: it, deprecated: false }))];

  for (const deprecationFile of deprecations) {
    const { file, deprecated } = deprecationFile;
    console.log(`deprecating prototype: ${file}`);
    const path = file.replace('.deprecated', '');
    const anyFileFound = fs.readdirSync(path).filter(it => it.endsWith('.json'))[0];
    const prototype = JSON.parse(String(fs.readFileSync(path + anyFileFound, 'utf8')));
    const response = await fetch(`https://${host}/api/management/prototypes/${prototype.kind}/${prototype.id}/deprecated`, {
      method: deprecated ? 'POST' : 'DELETE',
      headers: {
        accept: 'application/vnd.opbox-page-manager.v2+json',
        authorization: `Bearer ${apiToken}`
      }
    });
    console.log(response.status, await response.json());
  }
};
