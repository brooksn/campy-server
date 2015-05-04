module.exports.postGET = function *(userid, next) {
  this.userid = userid;
  yield next;
  if (this.hawk.authorized === true && this.hawk.user === userid) {
    console.log('all OK.');
  }
  this.response.body = "This endpoint has not yet been implemented.";
};
