module.exports = {
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost/pproulette',
  HS_SECRET: process.env.HS_SECRET,
  ZULIP_EMAIL: process.env.ZULIP_EMAIL,
  ZULIP_SECRET: process.env.ZULIP_SECRET
};
