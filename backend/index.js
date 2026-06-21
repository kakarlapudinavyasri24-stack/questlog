const { start } = require("./server");

if (require.main === module) {
  start().catch((err) => {
    console.error("Failed to initialize database:", err.message);
    process.exit(1);
  });
}

module.exports = require("./server");
