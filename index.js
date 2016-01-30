'use strict';

const URI = require('urijs');
const request = require('request-promise');
const get = request.get;


class Putio {
  constructor(token) {
    this.setToken(token);
  }

  setToken(token) {
    this.token = token;
    return this;
  }

  accountInfo(){
    var uri = apiURI('/v2/account/info',{oauth_token:this.token});
    console.log('GET', uri);
    return get(uri);
  }

  addTransfer(magnetLink){
    return post(apiURI('/v2/transfers/add', {url: magnetLink})).then(function(response){
      return response.transfer;
    });
  }
}

module.exports = Putio;


const uri = (endpoint, path, query) => {
  return URI(endpoint).query(query||{}).path(path||'/').toString();
};


const ENDPOINT = 'https://put.io';
const baseUri = (path, query) => {
  return uri(ENDPOINT, path, query);
};

const API_ENDPOINT = 'https://api.put.io/v2';
const apiURI = (path, query) => {
  return uri(API_ENDPOINT, path, query);
};

