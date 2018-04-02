const app = require('express')();
const redis = require('redis');
const bodyParser = require('body-parser').json();
const shortid = require('shortid');
const url = require('url');
const util = require('util');

const ONE_WEEK = 604800;

const API_HOST = process.env.WHISPER_HOST || 'localhost';
const API_PORT = process.env.WHISPER_PORT || 5000;
const BASE_URL = process.env.BASE_URL || 'https://whisper.demo.veres.one';

// create a new redis client and connect to our local redis instance
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const client = redis.createClient(REDIS_PORT, REDIS_HOST);
client.get = util.promisify(client.get);
client.set = util.promisify(client.set);

client.on('error', err => {
  console.log("Error " + err);
});
client.on('error', error => console.error(`redis error: ${error}`));
client.on('end', () => console.log('Redis: connection closed'));
client.on('warning', msg => console.log(`Redis warning: ${msg}`));

app.set('host', API_HOST);
app.set('port', API_PORT);

app.get('/whisper/:id', (req, res) => getWhisper(req, res, client));
app.post('/whisper', bodyParser, (req, res) => postWhisper(req, res, client));

app.listen(app.get('port'), () => {
  console.log('Server listening on port: ', app.get('port'));
});

function getWhisper(req, res, client) {
  const id = req.params.id;

  return client.get(id) // load from Redis
    .then(whisper => {
      if(!whisper) {
        return res.sendStatus(404);
      }

      dispatchWhisper(req, res, whisper);
    })
    .catch(error => sendError(res, error));
}

function dispatchWhisper(req, res, whisper) {
  res.set('content-type', 'application/json');
  // Send back plain JSON
  res.status(200).send(whisper.toString());
  return;
}

function sendError(res, error) {
  console.error(error);
  res.set('content-type', 'application/json');
  res.status(400).send({error: error.message});
}

function postWhisper(req, res, client) {
  const whisper = req.body;
  console.log('Incoming post:', whisper);

  const id = shortid.generate();

  console.log('Saving to:', id);

  // TODO: validate input
  const value = JSON.stringify(whisper);
  return client.set(id, value, 'EX', whisper.expiration || ONE_WEEK)
    .then(() => {
      const createdUrl = whisperUrl(id, BASE_URL);

      res.set('Location', createdUrl);
      res.status(201).send(createdUrl);
    })
    .catch(error => sendError(res, error));
}

function whisperUrl(id, baseUrl) {
  const whisperUrl = url.parse(baseUrl);
  whisperUrl.pathname = `/whisper/${id}`;

  return url.format(whisperUrl);
}

module.exports = {
  whisperUrl,
  BASE_URL
};
