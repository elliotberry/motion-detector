import Fastify from 'fastify';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'node:os';
const fastify = Fastify();
const execAsync = promisify(exec);


var platform = os.platform();

fastify.get('/', async (request, reply) => {
  try {
    console.log('Received request.');

    let command = platform === 'darwin' ? 'afplay' : 'aplay';
    await execAsync(`${command} ./buzzer.mp3`);
    reply.send({ status: 'ok', message: 'MP3 played.' });
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: 'Failed to play MP3' });
  }
});

const main = async () => {
  try {
    console.log(os.platform());
    await fastify.listen({ port: 3030, host: '0.0.0.0' });
    console.log('Server listening on http://localhost:3000');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();