#!/usr/bin/env node --harmony

'use strict'

let fs = require('fs');
let Putio = require('../dist/index.js');
let minimist = require('minimist');
let prompt = require('prompt');

let usage = () => {
  console.log('put.io command [options]');
  console.log('  options:');
  console.log('   info');
  console.log('   transfers');
};

let getToken = (callback) => {
  fs.exists(process.env.HOME+'/.putio/token', (exists) => {
    if (exists) {
      fs.readFile(process.env.HOME+'/.putio/token', (err, token) => {
        if (err){ throw err; }
        callback(new Putio(token));
      });
    } else {
      prompt.start();
      prompt.get(['Put.io Auth Token'], (err, token) => {
        if (err){ throw err; }
        fs.mkdir(process.env.HOME+'/.putio', token, (err) => {
          if (err){ throw err; }
          fs.writeFile(process.env.HOME+'/.putio/token', token, (err) => {
            if (err){ throw err; }
            callback(new Putio(token));
          });
        });
      });
    }
  });
}

let login = (callback) => {
  getToken((token) => {
    let _putio = new Putio('3GJXYZBR');
    callback(_putio);
  })
};

let CLI = {
  info: (options) => {
    console.log('INFO:', options);
    login((putio)=>{
      putio.accountInfo().then(console.dir);
    })
  },
  transfers: () => {
    login((putio)=>{
      putio.transfers().then(console.dir);
    })
  }
}






// let p =
// p.accountInfo().then(function(response){
//   console.log(response)
// })



let argv = minimist(process.argv.slice(2));

let command = argv._.shift();
let verbose = argv.v || argv.verbose;

// console.log({
//   command: command,
//   verbose: verbose,
// })


let commandFunction = CLI[command];
if (commandFunction){
  commandFunction(argv);
}else{
  console.warn('command '+command+' not found');
  usage();
}
