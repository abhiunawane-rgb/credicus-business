/**
 * Temporary test — change cPanel startup file to: test-server.js
 * If credicus.in shows "Credicus test OK", Passenger works and Next.js is the problem.
 * Then switch startup back to app.js
 */
const http = require("http");

const server = http.createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Credicus test OK");
});

if (typeof PhusionPassenger !== "undefined") {
  PhusionPassenger.configure({ autoInstall: false });
  server.listen("passenger", () => console.log("[credicus-test] passenger"));
} else {
  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(port, () => console.log("[credicus-test] port", port));
}

module.exports = server;
