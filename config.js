module.exports = {
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  MONGO_URI: process.env.MONGO_URI || 'localhost',
  HS_SECRET: process.env.HS_SECRET,
  ZULIP_SECRET: process.env.ZULIP_SECRET
};
