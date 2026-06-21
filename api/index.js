const { app, initDb } = require("../backend/server");

let dbReady;

function ready() {
  if (!dbReady) {
    dbReady = initDb();
  }
  return dbReady;
}

module.exports = async function handler(req, res) {
  await ready();

  if (req.url.startsWith("/api/")) {
    req.url = req.url.slice(4);
  } else if (req.url === "/api") {
    req.url = "/";
  }

  return app(req, res);
};
