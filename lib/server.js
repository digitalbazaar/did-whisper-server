const app = require('express')();
const redis = require('redis');
const bodyParser = require('body-parser').json();
const shortid = require('shortid');
const url = require('url');

const API_HOST = process.env.HOST || 'localhost';
const API_PORT = process.env.PORT || 5000;

function getWhisper(req, res, client) {
  const id = req.params.id;

  client.get(id, (err, result) => {
    if(err) {console.error(err);}

    res.set('content-type', 'application/json');

    res.status(200).send(result.toString());
  });
}

function postWhisper(req, res, client) {
  const whisper = req.body;
  console.log('Incoming post:', whisper);

  const id = shortid.generate();

  console.log('Saving to:', id);

  // TODO: validate input
  client.set(id, JSON.stringify(whisper), 'EX', whisper.expiration);

  res.status(201).send(whisperUrl(id));
}

function whisperUrl(id) {
  return url.format({
    protocol: 'http',
    hostname: API_HOST,
    port: API_PORT,
    pathname: `/whisper/${id}`
  }).toString();
}

// create a new redis client and connect to our local redis instance
const redisPort = process.env.REDIS_PORT || 6379;
const redisHost = process.env.REDIS_HOST || 'localhost';
const client = redis.createClient(redisPort, redisHost);

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
