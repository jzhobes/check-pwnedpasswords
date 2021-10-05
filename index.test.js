const crypto = require('crypto');
const nock = require('nock');
const checkPwnedPasswords = require('./index');

describe('check-pwnedpasswords', () => {
  it('only accepts non-empty string password input values', async () => {
    for (const password of ['', {}, new Map(), new Set(), new Date(), Infinity, NaN, undefined, null, new RegExp()]) {
      await expect(checkPwnedPasswords(password)).rejects.toThrow('Invalid input.');
    }
  });

  it('only accepts valid number timeout input values', async () => {
    for (const timeout of [-1, 0, '', {}, new Map(), new Set(), new Date(), Infinity, NaN, null, new RegExp()]) {
      await expect(checkPwnedPasswords('foobar', timeout)).rejects.toThrow('Invalid input.');
    }
  });

  it('accepts an optional timeout argument', async () => {
    await expect(checkPwnedPasswords('foobar', 1)).rejects.toThrow('Timed out after 1ms.');
  });

  it('returns matched breach data', async () => {
    const {pwned, occurrences} = await checkPwnedPasswords('foobar');
    expect(pwned).toBe(true);
    expect(occurrences).toBeGreaterThan(0);
  });

  it('returns empty breach data if password has not been breached', async () => {
    await expect(checkPwnedPasswords(crypto.randomBytes(20).toString('hex'))).resolves.toStrictEqual({
      pwned: false,
      occurrences: 0,
    });
  });

  it('throws error message if pwnedpasswords.com is down', async () => {
    nock('https://api.pwnedpasswords.com')
      .get(/\/range.+/)
      .replyWithError(new Error('Mocked error scenario.'));
    await expect(checkPwnedPasswords('foobar')).rejects.toThrow(expect.anything());
  });
});
