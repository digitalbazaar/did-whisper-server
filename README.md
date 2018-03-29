# DID Whisper Storage Server _(did-whisper-server)_

> A demo encrypted pastebin server, for use with the [`did-whisper`](https://github.com/digitalbazaar/did-whisper) client

## Table of Contents

- [Security](#security)
- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## Security

Please note that this is a demo / proof-of-concept only, and makes no security
guarantees.

Also, sent messages are anonymous (the recipient has no way of knowing who sent
the message).

## Install

Requires Node.js 8.6+, and [Redis](https://redis.io/) to serve as backend for
whisper storage.

```
git clone https://github.com/digitalbazaar/did-whisper-server.git
cd did-whisper-server
git checkout implementation
npm install
```

## Usage

**Note:** Make sure a Redis server is running.

To launch the server:

```bash
npm start
```

You can specify a hostname and port for the Redis server, as well as the hostname
and port by which this service will be accessed from the outside.

For example, if you're running Redis locally on port 3000, you can do:

```bash
REDIS_HOST=localhost REDIS_PORT=3000 npm start
```

Similarly, if your service will be running on `https://did.example.com`:

```bash
WHISPER_PORT=443 WHISPER_HOST="did.example.com" npm start
```

## Contribute

See [the contribute file](https://github.com/digitalbazaar/bedrock/blob/master/CONTRIBUTING.md)!

PRs accepted.

Small note: If editing the Readme, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

TBD
