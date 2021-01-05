const fs = require("fs");

module.exports.printMessage = (message) => {
  console.log("");
  console.log("-".repeat(message.length));
  console.log(message.toUpperCase());
  console.log("-".repeat(message.length));
  console.log("");
};

module.exports.createFile = (folder, file, data) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
    fs.writeFileSync(`${folder}/${file}`, data, () => true);
  } else {
    fs.writeFileSync(`${folder}/${file}`, data, () => true);
  }
};
