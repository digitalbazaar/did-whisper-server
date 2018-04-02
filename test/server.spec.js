const chai = require('chai');
chai.use(require('dirty-chai'));
chai.should();
const {expect} = chai;

const server = require('../lib/server');

describe('DID Whisper Server', () => {
  describe('whisperUrl', () => {
    const whisperId = '123';

    it('should work with base url', () => {
      expect(server.whisperUrl(whisperId, server.BASE_URL))
        .to.equal('https://whisper.demo.veres.one/whisper/123');
    });
  });
});
