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
    }).map(response => {
      const body = response.body
      if (body.status === "OK") return body
      console.warn('putio request error', body)
      const error = new Error('Putio request failed')
      error.response = response
      throw error
    })
  }

  get(url, query) {
    return this.request('GET', url, query)
  }

  post(url, query) {
    return this.request('POST', url, query)
  }

  // account info

  getAccountInfo(){
    return this.get(apiURI('/v2/account/info')).pluck('info')
  }

  // transfers

  getTransfer(){
    debugger
  }

  getTransfers(){
    return this.get(apiURI('/v2/transfers/list')).pluck('transfers')
  }

  addTransfer(magnetLink){
    return this.post(apiURI('/v2/transfers/add'), {url: magnetLink}).pluck('transfer')
  }

  deleteTransfer(id){
    return this.post(apiURI('/v2/transfers/cancel'), {transfer_ids: id}).map(function(response){
      debugger
      return response
      // return response.transfer;
    });
  }

  // files

  getFile(fileId){
    return this.get(apiURI(`/v2/files/${fileId}`)).pluck('file').map(amendFile)
  }

  getDirectoryContents(fileId){
    return this.get(apiURI('/v2/files/list', {parent_id: fileId})).map( ({parent, files}) => {
      parent.fileIds = files.map(file => file.id);
      [parent].concat(files).forEach(amendFile)
      return {parent, files}
    })
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

const IS_VIDEO_REGEXP = /\.(mkv|mp4|avi)$/
const amendFile = (file) => {
  file.loadedAt = Date.now()

  if (file.id == 0) file.name = 'All Files'

  file.isDirectory = "application/x-directory" == file.content_type

  if (file.isDirectory) {
    file.directoryContentsLoaded = !!file.fileIds
  }

  file.putioUrl = baseURI(`/file/${file.id}`)
  file.downloadUrl = apiURI(`/v2/files/${file.id}/download`)

  file.isVideo = IS_VIDEO_REGEXP.test(file.name)
  if (file.isVideo){
    file.mp4StreamUrl  = apiURI(`/v2/files/${file.id}/mp4/stream`)
    file.streamUrl     = apiURI(`/v2/files/${file.id}/stream`)
    file.playlistUrl   = apiURI(`/v2/files/${file.id}/xspf`)
    file.chromecastUrl = baseURI(`/file/${file.id}/chromecast`)
  }

  return file
}
