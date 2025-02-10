'use strict';

require('dotenv').config();

const crypto = require('crypto');
const jose = require('jose');
const jwt = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');
const secretsManager = require('@aws-sdk/client-secrets-manager');
const clipboardy = require('node-clipboardy');

if (process.argv.length < 3) {
    console.error(`There are too few parameters!\n` +
        `Usage: npm run generate-jwt 'some payload'\n`);
    return;
}

const payload = process.argv[2];

// CONFIG ////////////////////////////////
const subject = process.env.SUBJECT;
const apiKeyArn = process.env.API_KEY_ARN;
const privateKeyArn = process.env.PRIVATE_KEY_ARN;
const keyId = process.env.KEY_ID;
const audience = process.env.AUDIENCE;

const region = process.env.REGION;
const alg = process.env.ALG;
const expiresIn = process.env.EXPIRES_IN;
//////////////////////////////////////////

const stringify = (json) => {
    return JSON.stringify(json, null);
}

const sha256Hash = (string) => {
    return crypto.createHash('sha256').update(string).digest('hex');
}

const importKey = async (key) => {
    const importedKey = await jose.importJWK(key, alg)
    return await jose.exportPKCS8(importedKey);
}

const getJWT = async (iss, sub, kid, aud, hash, privateKey) => {
    const caPrivateKey = await importKey(privateKey);

    const signOptions = {
        algorithm: alg,
        keyid: kid,
        expiresIn,
        jwtid: uuidv4(),
        issuer: iss,
        audience: aud,
        subject: sub,
    };
    const payload = {
        data: hash,
    };

    var jwtAuth = jwt.sign(payload, caPrivateKey, signOptions);
    var jwtDecoded = jwt.decode(jwtAuth, {complete: true});

    console.log(`JWT-\n${jwtAuth}\n`);
    console.log(`Decoded JWT-\n${stringify(jwtDecoded.header)}.${stringify(jwtDecoded.payload)}\n`);

    clipboardy.writeSync(jwtAuth);
    console.log('\n✅ Token has been copied to the clipboard!');
};

const exec = async () => {
    const secretsClient = new secretsManager.SecretsManagerClient({region});
    let data;

    data = await secretsClient.send(new secretsManager.GetSecretValueCommand({
        SecretId: apiKeyArn
    }));
    const issuer = data.SecretString;

    data = await secretsClient.send(new secretsManager.GetSecretValueCommand({
        SecretId: privateKeyArn
    }));
    const privateKey = JSON.parse(data.SecretString);

    const hash = sha256Hash(payload);

    await getJWT(issuer, subject, keyId, audience, hash, privateKey);
};

exec();