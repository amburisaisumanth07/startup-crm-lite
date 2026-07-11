import tls from 'tls';

const options = {
  host: 'ac-zmpnqmu-shard-00-00.ydgvsa1.mongodb.net',
  port: 27017,
  servername: 'ac-zmpnqmu-shard-00-00.ydgvsa1.mongodb.net',
  rejectUnauthorized: false
};

console.log('Testing TLS handshake to MongoDB Atlas...');
const socket = tls.connect(options, () => {
  console.log('TLS Handshake Successful!');
  console.log('Cipher:', socket.getCipher());
  socket.destroy();
});

socket.on('error', (err) => {
  console.error('TLS Handshake Failed:', err.message);
});

socket.setTimeout(5000, () => {
  console.error('TLS Handshake TIMED OUT!');
  socket.destroy();
});
