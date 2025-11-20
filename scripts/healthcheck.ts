const PORT = process.env.PORT || 3000;
const url = `http://localhost:${PORT}/api/health`;
const expected = { status: 'ok', application: 'openmario' }; // Changed 'app' to 'application'

await fetch(url, {
   headers: { Accept: 'application/json' }
})
   .then(async response => {
      if (!response.ok) {
         console.error(`Failed: HTTP ${response.status} (need 200)`);
         process.exit(1);
      }
      return await response.json();
   })
   .then(data => {
      if (JSON.stringify(data) !== JSON.stringify(expected)) {
         console.error('Failed: Wrong JSON');
         console.log('Got:', JSON.stringify(data, null, 2));
         console.log('Expected:', JSON.stringify(expected, null, 2));
         process.exit(1);
      }
      console.log('Passed: MDS-Auth ok');
      process.exit(0);
   })
   .catch(error => {
      console.error(`Failed: ${error.message}`);
      process.exit(1);
   });
