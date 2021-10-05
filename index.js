const crypto = require('crypto');
const https = require('https');

/**
 * Invokes the Have I Been Pwned API v2 endpoint and returns the results.
 *
 * @param {string} password
 * @param {number} timeout
 * @return {Promise}
 */
module.exports = (password, timeout = 5000) => {
  const isInvalidPasswordInput = !password || typeof password !== 'string';
  const isInvalidTimeoutInput = !timeout || typeof timeout !== 'number' || timeout <= 0 || timeout > Number.MAX_SAFE_INTEGER;
  if (isInvalidPasswordInput || isInvalidTimeoutInput) {
    return Promise.reject(new Error('Invalid input.'));
  }

  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const range = hash.substr(0, 5);
    const remainder = hash.substr(5);
    let result = '';
    https.get(`https://api.pwnedpasswords.com/range/${range}`, {timeout}, (res) => {
      res.on('data', (data) => {
        result += data;
      }).on('end', () => {
        const match = result.split('\r\n').find((hashRemainder) => hashRemainder.startsWith(remainder));
        let pwned = false;
        let occurrences = 0;
        if (match) {
          pwned = true;
          occurrences = parseInt(match.split(':')[1], 10);
        }
        resolve({
          pwned,
          occurrences,
        });
      });

    }).on('timeout', () => {
      reject(new Error(`Timed out after ${timeout}ms.`));
    }).on('error', (e) => {
      reject(e);
    });
  });
};
