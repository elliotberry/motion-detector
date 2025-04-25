import Fastify from 'fastify';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'node:os';
import crypto from 'node:crypto';

const fastify = Fastify();
const execAsync = promisify(exec);
const platform = os.platform();

const pickSound = (ip) => {
  const hash = crypto.createHash('md5').update(ip).digest();
  const firstByte = hash[0];
  return firstByte % 2 === 0 ? '1.mp3' : '2.mp3';
};

fastify.get('/', async (request, reply) => {
  try {
    console.log('Received request from', request.ip);

    const command = platform === 'darwin' ? 'afplay -v 100' : 'aplay';
    const soundFile = pickSound(request.ip);

    await execAsync(`${command} ./` + soundFile);
    reply.send({ status: 'ok', message: `Played ${soundFile}` });
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: 'Failed to play MP3' });
  }
});

const main = async () => {
  try {
    console.log('Starting server on', platform);
    await fastify.listen({ port: 3030, host: '0.0.0.0' });
    console.log(`Listening on ${fastify.server.address().address}:${fastify.server.address().port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();