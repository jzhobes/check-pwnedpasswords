# check-pwnedpasswords

A simple, secure Node.js module that checks passwords against the [Have I Been Pwned](https://haveibeenpwned.com) database using their k-Anonymity API.

## Installation

```bash
npm install check-pwnedpasswords
```

## Requirements

- Node.js 18.0.0 or higher (uses native `fetch`)

## Usage

```javascript
const checkPwnedPasswords = require('check-pwnedpasswords');

try {
  const result = await checkPwnedPasswords('foobar');
  
  if (result.pwned) {
    console.log(`This password has been seen ${result.occurrences} times!`);
  } else {
    console.log('This password has not been breached.');
  }
} catch (err) {
  console.error('Failed to check password:', err.message);
}
```

## API

### `checkPwnedPasswords(password, [timeout])`

- **password** `(string)`: The plain text password to check.
- **timeout** `(number)`: Optional. Request timeout in milliseconds. Defaults to `5000`.

**Returns** a `Promise` that resolves to an object:
```javascript
{
  pwned: boolean,      // true if found in breach database
  occurrences: number  // Number of times seen (0 if not pwned)
}
```

## Security & Privacy

This module implements the **k-Anonymity** model provided by the Pwned Passwords API. 
1. The password is hashed using SHA-1 locally.
2. Only the **first 5 characters** of the hash are sent to the API.
3. The API returns all hashes matching that prefix.
4. The full hash comparison happens locally on your machine.

**Your full password or full hash is never sent over the network.**
