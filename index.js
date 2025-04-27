import Fastify from 'fastify';
import {exec} from 'child_process';
import {promisify} from 'util';
import os from 'node:os';
import crypto from 'node:crypto';
import pino from 'pino';

const execAsync = promisify(exec);
const platform = os.platform();

const fileTransport = pino.transport({
  target: 'pino/file',
  level: 'info',
  options: {destination: `./app.log`},
});

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd hh:MM:ss',
        ignore: 'pid,hostname',
      },
    },

    fileTransport,
    timestamp: () => `,"time":"${new Date().toLocaleString('en-US', {timeZone: 'America/New_York'})}"`,
  },
});

const pickSound = ip => {
  const hash = crypto.createHash('md5').update(ip).digest();
  const firstByte = hash[0];
  return firstByte % 2 === 0 ? '1.mp3' : '2.mp3';
};

fastify.get('/', async (request, reply) => {
  try {
    request.log.info('Received request from', request.ip);

    const command = platform === 'darwin' ? 'afplay -v 100' : 'mpg123';
    const soundFile = pickSound(request.ip);

    await execAsync(`${command} ./` + soundFile);
    request.log.info('Played sound.');
    reply.send({status: 'ok'});
  } catch (err) {
    request.log.error(err);
    reply.status(500).send({error: 'Failure'});
  }
});

const main = async () => {
  try {
    await fastify.listen({port: 3030, host: '0.0.0.0'}); 
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();
