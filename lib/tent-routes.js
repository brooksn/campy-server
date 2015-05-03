module.exports.postGET = function *(user, next) {
  yield next;
  this.response.body = "This endpoint has not yet been implemented.";
};
