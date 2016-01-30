#!/usr/bin/env node --harmony

'use strict'

let Putio = require('../index.js')


let p = new Putio('3GJXYZBR')
p.accountInfo().then(function(response){
  console.log(response)
})

