const URI = require('urijs');
// const request = require('request-promise');

export default class Putio {
  constructor(options) {
    this.clientId      = options.clientId;
    this.secret        = options.secret;
    this.oauthToken    = options.oauthToken;
    this.redirectURI   = options.redirectURI;
    this.accessToken   = options.accessToken;
    this.oAuthResponseType = options.oAuthResponseType || 'token';
    this._request = options.request || this.request;
  }

  oauthUrl(){
    return URI('https://api.put.io/v2/oauth2/authenticate').query({
      client_id: this.clientId,
      response_type: this.oAuthResponseType,
      redirect_uri: this.redirectURI,
    })
  }

  _request(){
    throw new Error('you must define putio.request')
  }

  request(method, url, body){
  // get(url, query) {
    // query.oauth_token = this.accessToken;
    url = URI(url)
    url.addQuery({oauth_token: this.accessToken})
    url = url.toString();

    console.info('Put.io '+method+' '+url);
    return this._request({
      method: method,
      url: url,
      body: body,
      responseType: 'json',
      crossDomain: true,
      withCredentials: false,
      headers: {
        'Accept': 'application/json',
      }
    }).map(request => request.body)
  }

  get(url, query) {
    return this.request('GET', url, query)
  }

  post(url, query) {
    return this.request('POST', url, query)
  }

  accountInfo(){
    return this.get(apiURI('/v2/account/info')).map(response => {
      return response.info
    })
  }

  addTransfer(magnetLink){
    return this.post(apiURI('/v2/transfers/add'), {url: magnetLink}).map(function(response){
      return response.transfer;
    });
  }

  transfers(){
    return this.get(apiURI('/v2/transfers/list')).map( response => {
      return response.transfers;
    });
  }
}

const uri = (endpoint, path, query) => {
  return URI(endpoint).query(query||{}).path(path||'/').toString();
};

const ENDPOINT = 'https://put.io';
const baseURI = (path, query) => {
  return uri(ENDPOINT, path, query);
};

const API_ENDPOINT = 'https://api.put.io';
const apiURI = (path, query) => {
  return uri(API_ENDPOINT, path, query);
};

