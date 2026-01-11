const fetch = require('node-fetch');
(async function() {
  try {
    const res = await fetch(process.env.SMOKE_URL || 'http://localhost:8080/');
    const txt = await res.text();
    console.log('Smoke response length:', txt.length);
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err.message);
    process.exit(1);
  }
})();
