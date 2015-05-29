var details = {
  host: 'localhost',
  database: 'campy'
};
module.exports = process.env.DATABASE_URL || details;
