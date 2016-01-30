#!/usr/bin/env node --harmony

'use strict'

let Putio = require('../index.js');
let minimist = require('minimist');

let usage = function(){
  console.log('put.io command [options]');
};

let putio = function(){
  let _putio = new Putio('3GJXYZBR');
  putio = function(){ return _putio };
  return _putio;
};

let CLI = {
  info: (options) => {
    console.log('INFO:', options);
    putio().accountInfo().then(function(response){
      console.log(response);
    });
  }
}






// let p =
// p.accountInfo().then(function(response){
//   console.log(response)
// })



let argv = minimist(process.argv.slice(2));

let command = argv._.shift();
let verbose = argv.v || argv.verbose;

console.log(command, {
  verbose: verbose,
})


let commandFunction = CLI[command];
if (commandFunction){
  commandFunction(argv);
}else{
  console.warn('command '+command+' not found');
  usage();
}
