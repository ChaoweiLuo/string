const fs = require('fs');
const path = require('path');

module.exports = function (program) {
  const folders = [];

  fs.readdirSync(__dirname).forEach(function (file) {
    if (fs.statSync(path.join(__dirname, file)).isDirectory()) {
      folders.push(file);
    }
  });

  folders.forEach(function (folder) {
    loadCommands(program, folder);
  });
};

function loadCommands (program, folder) {
  const commandsPath = path.join(__dirname, folder);
  const commandFiles = fs.readdirSync(commandsPath);

  commandFiles.forEach(function (file) {
    if (file.endsWith('.js')) {
      const command = require(path.join(commandsPath, file));
      command(program);
    }
  });
}
