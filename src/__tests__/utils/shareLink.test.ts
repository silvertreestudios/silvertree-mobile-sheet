import { encodeShareData, decodeShareData } from '../../utils/shareLink';
import { AppConfig } from '../../types';

const sampleConfig: AppConfig = {
  relayUrl: 'https://foundryvtt-rest-api-relay.fly.dev',
  apiKey: 'test-api-key-1234',
  clientId: 'world-abc-123',
  actorUuid: 'Actor.xYz789',
};

describe('shareLink', () => {
  describe('encodeShareData / decodeShareData', () => {
    it('round-trips a config through encode then decode', () => {
      const encoded = encodeShareData(sampleConfig);
      const decoded = decodeShareData(encoded);
      expect(decoded).toEqual(sampleConfig);
    });

    it('produces a URL-safe string (no +, /, or =)', () => {
      const encoded = encodeShareData(sampleConfig);
      expect(encoded).not.toMatch(/[+/=]/);
    });

    it('returns null for invalid base64', () => {
      expect(decodeShareData('not-valid!!!')).toBeNull();
    });

    it('returns null for valid base64 but missing fields', () => {
      // base64url of '{}'
      const encoded = Buffer.from('{}', 'utf8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      expect(decodeShareData(encoded)).toBeNull();
    });

    it('handles special characters in values', () => {
      const config: AppConfig = {
        relayUrl: 'https://example.com/path?q=1&b=2',
        apiKey: 'key+with/special=chars',
        clientId: 'id with spaces',
        actorUuid: 'Actor.ñoño',
      };
      const encoded = encodeShareData(config);
      const decoded = decodeShareData(encoded);
      expect(decoded).toEqual(config);
    });
  });
});
