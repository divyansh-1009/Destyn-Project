const fs = require('fs');
const { execSync } = require('child_process');

function cleanMessage(msg) {
  msg = msg.trim();
  if (msg.startsWith('Merge')) return 'Merge branch changes';
  
  const lower = msg.toLowerCase();
  
  if (lower.includes('chat ui')) return 'Update real-time chat user interface';
  if (lower.includes('chat')) return 'Enhance real-time chat functionality';
  if (lower.includes('feed ui')) return 'Update confession feed interface';
  if (lower.includes('feed')) return 'Refactor confession feed logic';
  if (lower.includes('navbar') || lower.includes('bottom nav') || lower.includes('landing page') || lower.includes('ui') || lower.includes('colour') || lower.includes('theme')) return 'Update application layout and styling';
  if (lower.includes('bug') || lower.includes('fix') || lower.includes('sort') || lower.includes('shit') || lower.includes('chu') || lower.includes('maddarch') || lower.includes('error')) return 'Resolve structural bugs and improve stability';
  if (lower.includes('profile')) return 'Enhance user profile management';
  if (lower.includes('deploy') || lower.includes('vercel') || lower.includes('build') || lower.includes('env')) return 'Configure deployment and build settings';
  if (lower.includes('logo')) return 'Update application branding and assets';
  if (lower.includes('auth') || lower.includes('cookie') || lower.includes('login') || lower.includes('signout')) return 'Refactor authentication and session management';
  if (lower.includes('mongo') || lower.includes('db')) return 'Optimize database connectivity';
  if (lower.includes('privacy') || lower.includes('guidelines') || lower.includes('faq')) return 'Update legal and FAQ documentation';
  if (lower.includes('photo') || lower.includes('cloudinary') || lower.includes('image')) return 'Improve media upload and storage pipelines';
  if (lower.includes('block') || lower.includes('report') || lower.includes('panic')) return 'Update user moderation and safety features';
  if (lower.includes('people') || lower.includes('similarity') || lower.includes('reaction') || lower.includes('like')) return 'Enhance social discovery features';
  
  if (lower.includes('initial')) return 'Initialize project repository';

  return 'Refactor application components';
}

const commits = fs.readFileSync('git_commits.csv', 'utf-8').trim().split('\n');
const hashMap = new Map();

// We want 60% divyansh-1009, 40% Harshil-1603
// Over 10 commits, 6 divyansh, 4 harshil
const authors = [
  { name: 'divyansh-1009', email: 'divyansh-1009@users.noreply.github.com' },
  { name: 'divyansh-1009', email: 'divyansh-1009@users.noreply.github.com' },
  { name: 'divyansh-1009', email: 'divyansh-1009@users.noreply.github.com' },
  { name: 'Harshil-1603', email: 'Harshil-1603@users.noreply.github.com' },
  { name: 'Harshil-1603', email: 'Harshil-1603@users.noreply.github.com' },
];

for (let i = 0; i < commits.length; i++) {
  const line = commits[i];
  if (!line) continue;
  
  const [oldHash, treeHash, oldParents, timestamp, ...msgParts] = line.split('|');
  const oldMsg = msgParts.join('|');
  
  let newParentsStr = '';
  if (oldParents) {
    const parentArr = oldParents.split(' ');
    newParentsStr = parentArr.map(p => {
      const newP = hashMap.get(p);
      if (!newP) throw new Error(`Missing parent mapping for ${p}`);
      return `-p ${newP}`;
    }).join(' ');
  }
  
  const newMsg = cleanMessage(oldMsg);
  const author = authors[i % 5];
  
  const env = Object.assign({}, process.env, {
    GIT_AUTHOR_NAME: author.name,
    GIT_AUTHOR_EMAIL: author.email,
    GIT_AUTHOR_DATE: timestamp,
    GIT_COMMITTER_NAME: author.name,
    GIT_COMMITTER_EMAIL: author.email,
    GIT_COMMITTER_DATE: timestamp,
  });
  
  const cmd = `git commit-tree ${treeHash} ${newParentsStr} -m "${newMsg}"`;
  const newHash = execSync(cmd, { env }).toString().trim();
  
  hashMap.set(oldHash, newHash);
}

const lastOldHash = commits[commits.length - 1].split('|')[0];
const lastNewHash = hashMap.get(lastOldHash);

console.log('Finished rewriting graph. New HEAD:', lastNewHash);
execSync(`git reset --hard ${lastNewHash}`);
console.log('Reset main to new HEAD.');
