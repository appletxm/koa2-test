// Node.js program to demonstrate the  
// crypto.publicEncrypt() method 
  
// Including crypto and fs module 
const crypto = require('crypto'); 
const fs = require("fs"); 
  
// Using a function generateKeyFiles 
function generateKeyFiles() { 
  
    const keyPair = crypto.generateKeyPairSync('rsa', { 
        modulusLength: 520, 
        publicKeyEncoding: { 
            type: 'spki', 
            format: 'pem'
        }, 
        privateKeyEncoding: { 
        type: 'pkcs8', 
        format: 'pem', 
        cipher: 'aes-256-cbc', 
        passphrase: ''
        } 
    }); 
       
    // Creating public key file  
    fs.writeFileSync("./crypto-key/public_key", keyPair.publicKey); 
    fs.writeFileSync("./crypto-key/private_key", keyPair.privateKey); 
} 
  
// Generate keys 
generateKeyFiles();