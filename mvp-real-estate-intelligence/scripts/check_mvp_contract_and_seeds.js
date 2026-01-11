import fs from 'fs';
import path from 'path';

const required = [
  path.join(__dirname, '..', 'seeds', 'st-lucie.yaml'),
  path.join(__dirname, '..', 'contracts', 'MVPDealRoom.sol')
];

let ok = true;
for (const p of required) {
  if (!fs.existsSync(p)) {
    console.error('Missing required file:', p);
    ok = false;
  } else {
    console.log('Found:', p);
  }
}
if (!ok) process.exit(1);
console.log('Seed and contract check passed.');
