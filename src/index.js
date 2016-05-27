export default class Putio {

}

// const URI = require('urijs');
// // const request = require('request-promise');

// export default class Putio {
//   constructor(token) {
//     this.setToken(token);
//   }

//   setToken(token) {
//     this.token = token;
//     return this;
//   }

//   get(url, query) {
//     query = query || {};
//     console.log('GET', url, query);
//     query.oauth_token = this.token;
//     url = URI(url).query(query).toString();
//     return request.get(url).then(JSON.parse);
//   }

//   accountInfo(){
//     return this.get(apiURI('/v2/account/info'));
//   }

//   addTransfer(magnetLink){
//     return this.post(apiURI('/v2/transfers/add'), {url: magnetLink}).then(function(response){
//       return response.transfer;
//     });
//   }

//   transfers(){
//     return this.get(apiURI('/v2/transfers/list')).then(function(response){
//       return response.transfers;
//     });
//   }
// }

// const uri = (endpoint, path, query) => {
//   return URI(endpoint).query(query||{}).path(path||'/').toString();
// };

// const ENDPOINT = 'https://put.io';
// const baseURI = (path, query) => {
//   return uri(ENDPOINT, path, query);
// };

// const API_ENDPOINT = 'https://api.put.io/v2';
// const apiURI = (path, query) => {
//   return uri(API_ENDPOINT, path, query);
// };

