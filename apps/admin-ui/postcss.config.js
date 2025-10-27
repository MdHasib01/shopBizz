// postcss.config.js
const { join } = require("path");

module.exports = {
  plugins: {
    "@tailwindcss/postcss": {
      // optional if you keep a config file
      config: join(__dirname, "tailwind.config.js"),
    },
    autoprefixer: {},
  },
};
