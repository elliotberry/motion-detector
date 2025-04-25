import Fastify from 'fastify';
import { exec } from 'child_process';
import { promisify } from 'util';

const fastify = Fastify();
const execAsync = promisify(exec);

fastify.get('/', async (request, reply) => {
  try {
    console.log('Received request to play MP3');
    // Change `afplay` to whatever works on your OS:
    // - macOS: afplay
    // - Linux: mpg123 or aplay
    // - Windows: powershell command or external player
    await execAsync(`afplay ./buzzer.mp3`);
    reply.send({ status: 'ok', message: 'MP3 played.' });
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: 'Failed to play MP3' });
  }
});

const main = async () => {
  try {
    await fastify.listen({ port: 3030, host: '0.0.0.0' });
    console.log('Server listening on http://localhost:3000');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();