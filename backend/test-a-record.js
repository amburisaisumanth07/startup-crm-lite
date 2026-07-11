import dns from 'dns';

dns.lookup('ac-zmpnqmu-shard-00-00.ydgvsa1.mongodb.net', (err, address, family) => {
  if (err) {
    console.error('Lookup Failed:', err);
  } else {
    console.log(`Lookup Success: ${address} IPv${family}`);
  }
});
