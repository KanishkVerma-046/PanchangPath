// Guards `npm run deploy` (via the "predeploy" npm lifecycle hook) against
// publishing anything that isn't actually committed. `astro build` builds
// whatever is on disk, not git HEAD, so a dirty working tree can silently
// ship uncommitted/unreviewed content to production. Hit this twice on this
// project: once it made it unclear which branch was actually live, and once
// it let unapproved draft content publish. Fails closed: any uncommitted
// change (staged, unstaged, or untracked) blocks the deploy.
import { execSync } from 'node:child_process';

function run(cmd) {
  return execSync(cmd, { encoding: 'utf-8' }).trim();
}

let status;
try {
  status = run('git status --porcelain');
} catch (err) {
  console.error('check-clean-tree: could not run `git status` — is this a git repository?');
  console.error(err.message);
  process.exit(1);
}

if (status.length > 0) {
  console.error('');
  console.error('✗ Deploy blocked: working tree is not clean.');
  console.error('');
  console.error('`npm run build` builds whatever is on disk right now, not the last');
  console.error('commit — so uncommitted changes deploy to production even if you');
  console.error('never intended to publish them yet. Commit or stash first:');
  console.error('');
  console.error(status.split('\n').map(l => '    ' + l).join('\n'));
  console.error('');
  console.error('To bypass intentionally (not recommended), run:');
  console.error('  npm run build && npx wrangler pages deploy dist --project-name=panchangpath --branch=main');
  console.error('');
  process.exit(1);
}

const branch = run('git rev-parse --abbrev-ref HEAD');
const commit = run('git rev-parse --short HEAD');
console.log(`✓ Working tree clean — deploying ${branch}@${commit}`);
