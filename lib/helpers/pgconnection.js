var details = {
  //database: 'campy',
  host: 'localhost'
};
module.exports = process.env.DATABASE_URL || details;
