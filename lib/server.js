const app = require('express')();
const redis = require('redis');
const bodyParser = require('body-parser').json();
const shortid = require('shortid');
const url = require('url');
const util = require('util');

const ONE_WEEK = 604800;

const API_HOST = process.env.WHISPER_HOST || 'localhost';
const API_PORT = process.env.WHISPER_PORT || 5000;

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
  res.set('content-type', 'application/json');

  return client.get(id)
    .then(result => {
      if(!result) {
        return res.sendStatus(404);
      }

      res.status(200).send(result.toString());
    })
    .catch(error => {
      console.error(error);
      res.status(400).send({error: error.message});
    });
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
      const createdUrl = whisperUrl(id, API_HOST, API_PORT);

      res.set('Location', createdUrl);
      res.status(201).send(createdUrl);
    })
    .catch(error => {
      console.error(error);
      res.status(400).send({error: error.message});
    });
}

function whisperUrl(id, apiHost, apiPort) {
  const protocol = apiPort === 443 ? 'https' : 'http';
  const port = apiPort === 443 || apiPort === 80
    ? null
    : apiPort;

  return url.format({
    protocol,
    port,
    hostname: apiHost,
    pathname: `/whisper/${id}`
  }).toString();
}

module.exports = {
  whisperUrl
};
