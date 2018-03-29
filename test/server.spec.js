const chai = require('chai');
chai.use(require('dirty-chai'));
chai.should();
const {expect} = chai;

const server = require('../lib/server');

describe('DID Whisper Server', () => {
  describe('whisperUrl', () => {
    const whisperId = '123';

    it('should handle https port correctly', () => {
      expect(server.whisperUrl(whisperId, 'example.com', 443))
        .to.equal('https://example.com/whisper/123');
    });

    it('should handle port 80 correctly', () => {
      expect(server.whisperUrl(whisperId, 'example.com', 80))
        .to.equal('http://example.com/whisper/123');
    });

    it('should include nonstandard ports in the url', () => {
      expect(server.whisperUrl(whisperId, 'example.com', 5000))
        .to.equal('http://example.com:5000/whisper/123');
    });
  });
});
