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
    this.amendFile = amendFile.bind(this)
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
      error.request = response.req
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
    return this.get(apiURI(`/v2/files/${fileId}`)).pluck('file').map(this.amendFile)
  }

  getDirectoryContents(fileId){
    return this.get(apiURI('/v2/files/list', {parent_id: fileId})).map( ({parent, files}) => {
      parent.fileIds = files.map(file => file.id);
      [parent].concat(files).forEach(this.amendFile)
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

const IS_VIDEO_REGEXP = /\.(mkv|mp4|avi|m4v|mov|qt|flv|wmv)$/
const amendFile = function(file){
  file.loadedAt = Date.now()

  file.isDirectory = "application/x-directory" == file.content_type
  file.isVideo = file.file_type === "VIDEO" || file.content_type.match(/^video\//i) || file.name.match(IS_VIDEO_REGEXP)
  file.isImage = file.content_type.match(/^image\//i)
  file.isText  = file.content_type.match(/^text\//i)

  file.putioUrl = baseURI(`/file/${file.id}`)

  if (file.isDirectory) {
    file.directoryContentsLoaded = !!file.fileIds
  }else{
    file.downloadUrl = apiURI(`/v2/files/${file.id}/download`, {oauth_token: this.accessToken})
  }

  if (file.isVideo){
    file.mp4StreamUrl  = apiURI(`/v2/files/${file.id}/mp4/stream`, {oauth_token: this.accessToken})
    file.streamUrl     = apiURI(`/v2/files/${file.id}/stream`, {oauth_token: this.accessToken})
    file.playlistUrl   = apiURI(`/v2/files/${file.id}/xspf`, {oauth_token: this.accessToken})
    file.chromecastUrl = baseURI(`/file/${file.id}/chromecast`, {oauth_token: this.accessToken})
  }

  return file
}
