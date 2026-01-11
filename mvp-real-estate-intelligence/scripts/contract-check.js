// Contract check: temporarily sets package type to module and runs Hardhat compile
const { execSync } = require('child_process');
try {
  console.log('Temporarily setting package type to module for Hardhat.');
  execSync('npm pkg set type="module"', { stdio: 'inherit' });
  execSync('npx hardhat compile --show-stack-traces', { stdio: 'inherit' });
  console.log('Contract check passed.');
} catch (err) {
  console.error('Contract check failed.');
  console.error(err);
  process.exit(1);
} finally {
  try {
    // Restore package.json from git to avoid persisting changes
    execSync('git checkout -- package.json', { stdio: 'inherit' });
    console.log('Restored package.json to original state.');
  } catch (e) {
    // ignore
  }
}
