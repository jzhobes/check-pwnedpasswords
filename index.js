const crypto = require('crypto');

/**
 * Invokes the Have I Been Pwned API v2 endpoint and returns the results.
 *
 * @param {string} password
 * @param {number} timeout
 * @return {Promise}
 */
module.exports = async (password, timeout = 5000) => {
  const isInvalidPasswordInput = !password || typeof password !== 'string';
  const isInvalidTimeoutInput = !timeout || typeof timeout !== 'number' || timeout <= 0 || timeout > 2147483647;
  if (isInvalidPasswordInput || isInvalidTimeoutInput) {
    throw new Error('Invalid input.');
  }

  const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const range = hash.slice(0, 5);
  const remainder = hash.slice(5);
  const apiUrl = `https://api.pwnedpasswords.com/range/${range}`;
  let fetchTimeout;
  try {
    const controller = new AbortController();
    const signal = controller.signal;
    fetchTimeout = setTimeout(() => {
      controller.abort();
    }, timeout);

    const res = await fetch(apiUrl, {signal});

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const resultText = await res.text();
    const match = resultText.split(/\r?\n/).find((hashRemainder) => hashRemainder.startsWith(remainder));
    let pwned = false;
    let occurrences = 0;
    if (match) {
      pwned = true;
      occurrences = parseInt(match.split(':')[1], 10);
    }

    return {
      pwned,
      occurrences,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Timed out after ${timeout}ms.`);
    } else {
      throw error;
    }
  } finally {
    clearTimeout(fetchTimeout);
  }
};