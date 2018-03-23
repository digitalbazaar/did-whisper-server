const app = require('express')();
const redis = require('redis');
const bodyParser = require('body-parser').urlencoded({extended: false});
const shortid = require('shortid');
const url = require('url');

const API_HOST = process.env.HOST || 'localhost';
const API_PORT = process.env.PORT || 5000;

function postWhisper(req, res, next) {
  console.log('Incoming post:', req.body);
  const id = shortid.generate();
  const whisperUrl = url.format({
    protocol: 'http',
    hostname: API_HOST,
    port: API_PORT,
    pathname: `/whisper/${id}`
  });
  console.log('Saving to:', whisperUrl);
  res.status(200).send(whisperUrl);
  next();
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

app.set('host', API_HOST)
app.set('port', API_PORT);

app.post('/whisper', bodyParser, postWhisper);

app.listen(app.get('port'), () => {
  console.log('Server listening on port: ', app.get('port'));
});
