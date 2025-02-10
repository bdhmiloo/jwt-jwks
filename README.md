# jwt-jwks

## Description
This script generates a JSON Web Token (JWT) based on a JSON Web Key Set (JWKS) stored on AWS secret manager.

## Prerequisite

- Have an aws account with aws secret manager entry containing the jwks
- Assume aws account in order to execute script

## Installation
Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd jwt-jwks
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

## Configuration
Create a `.env` file and fill in the required values:
```env
SUBJECT=
API_KEY_ARN=
PRIVATE_KEY_ARN=
KEY_ID=
AUDIENCE=
ISSUER=
REGION=
ALG=
EXPIRES_IN=
```
