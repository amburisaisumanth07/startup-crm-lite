import dns from 'dns';
import { promisify } from 'util';

const resolveSrv = promisify(dns.resolveSrv);

dns.setServers(['8.8.8.8', '8.8.4.4']);

async function test() {
  console.log('Testing Node.js DNS resolution for MongoDB Atlas SRV record...');
  try {
    const servers = await dns.promises.getServers();
    console.log('Local DNS Servers Node is using:', servers);
    
    const records = await resolveSrv('_mongodb._tcp.startup-crm.ydgvsa1.mongodb.net');
    console.log('Success! SRV Records found:', records);
  } catch (error) {
    console.error('DNS Resolution Failed!');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
  }
}

test();
