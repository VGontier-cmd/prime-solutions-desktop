const { app } = require('electron');
const fs = require('fs');

const logPath = `${app.getPath('userData')}/log.log`;

module.exports = (taskID, err) => {
    if (!fs.existsSync(logPath)) fs.writeFileSync(logPath);

    fs.appendFileSync(logPath, `\n[${new Date().toLocaleString()}] [${taskID}] ${err}`)
}