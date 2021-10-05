# check-pwnedpasswords
A simple Node.js module that checks against the https://haveibeenpwned.com database through its https://api.pwnedpasswords.com API.

### Usage
```javascript
const checkPwnedPasswords = require('check-pwnedpasswords');

await checkPwnedPasswords('foobar');
// Output: {pwnd: true, occcurrences: <number of times the password has been seen>}

await checkPwnedPasswords('<secure password>');
// Output: {pwnd: false, occcurrences: 0}

// Optional second timeout argument in milliseconds (defaults to 5000):
await checkPwnedPasswords('<secure password>', 1000);
```
