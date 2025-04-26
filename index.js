import Fastify from 'fastify';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'node:os';
import crypto from 'node:crypto';

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd hh:MM:ss TT Z',
        ignore: 'pid,hostname',
      },
    },
    timestamp: () => `,"time":"${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}"`,
  },
});
const execAsync = promisify(exec);
const platform = os.platform();

const pickSound = (ip) => {
  const hash = crypto.createHash('md5').update(ip).digest();
  const firstByte = hash[0];
  return firstByte % 2 === 0 ? '1.mp3' : '2.mp3';
};

fastify.get('/', async (request, reply) => {
  try {
    request.log.info('Received request from', request.ip);

    const command = platform === 'darwin' ? 'afplay -v 100' : 'aplay';
    const soundFile = pickSound(request.ip);

    await execAsync(`${command} ./` + soundFile);
    request.log.info('Played sound.');
    reply.send({ status: 'ok' });
  } catch (err) {
    request.log.error(err);
    reply.status(500).send({ error: 'Failure' });
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