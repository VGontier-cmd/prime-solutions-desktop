/**
 * IMPORT AND ELECTRON GLOBAL VARIABLES
 **/

const {
    app,
    BrowserWindow,
    ipcMain,
    shell,
    dialog,
    protocol,
    TouchBar,
    TouchBar: {
        TouchBarButton
    }
} = require('electron');
const isDev = require('electron-is-dev');
const rp = require('request-promise').defaults({
    simple: false,
    resolveWithFullResponse: true,
    json: true
});
var launcheur, application;
const iconUrl = process.env == 'darwin' ? `${__dirname}/frontend/assets/img/i.icns` : `${__dirname}/frontend/assets/img/icon.ico`
const request = require('request');
const os = require('os')

const log = require('./backend/misc/log')
require('electron-unhandled')({
    logger: err => log('UNHANDLED ERR', err),
    showDialog: false
});
const { autoUpdater } = require('electron-updater');

/**
 * AUTH SYSTEM
 **/

const BASE_URL_API_USER = "";
const AUTHORIZATION_KEY = "";
const ENCRYPTION_KEY = "";

const { AES, enc } = require('crypto-js');
const deviceID = require('node-machine-id').machineIdSync();
const key_regex = new RegExp('(([a-zA-Z0-9]){5}-){4}([a-zA-Z0-9]){5}')
let userInfos = null;
require('events').EventEmitter.defaultMaxListeners = 15;

const Store = require('electron-store');
const encryptionKey = '75866161b7adaa1e31f868036c1b1a98';
const store = new Store({
    encryptionKey
});

//Encrypt datas for auth
const encryptData = (data) => {
    if (data == null || data === '') return null;
    return AES.encrypt(data, ENCRYPTION_KEY).toString();
};

//Decrypt data for auth
const decryptData = (data) => {
    if (data == null || data === '') return null;
    const decrypted = AES.decrypt(data, ENCRYPTION_KEY);
    const text = decrypted.toString(enc.Utf8);
    return text;
};



/**
 * FILE(S) MANAGEMENT
 */
const fs = require('fs');
const documentFolderURL = os.homedir() + '/Documents/Prime';
const fileList = ["/proxylist.json", "/userCredentials.json"];
const csv = require('csv-parser');
const converter = require('json-2-csv')

function loadSettings() {
    if (!fs.existsSync(documentFolderURL)) fs.mkdirSync(documentFolderURL)

    fileList.forEach(element => {
        if (!fs.existsSync(documentFolderURL + element)) fs.writeFileSync(documentFolderURL + element, JSON.stringify({}))
    })

    loadProxies()
}

/**
 * CAPTCHA MODULE
 */

module.exports = {
    sendPublicWebhook,
    getCaptcha,
    updateAccGenStatus,
    removeAccStatus,
    shouldStopAccTask,
    appendCreatedAcc,
    updateBrowserStatus,
    updateSignUpStatus,
    updateCaptchaStatus,
    updateLoginStatus,
    updateOneClickStatus,
    updateCaptchaScore,
    setDiscordStatus,
    setDiscordUsername,
    addPassedTask,
    removePassedTask,
    toast
};
require('./backend/spoofbrowser/browser');
const AccGenTask = require('./backend/accountgen/shopify');
require('./backend/discordtools/discord-tools')
require('./backend/oneclickgen/captcha')
require('./backend/supremesignup/signup')

let captchaWindow = null;
let youtubeWin = null;
const captchaBank = [];
const accTaskStatuses = [];

let licenseKey = null;

/**
 * AUTO-UPDATER
 * */

autoUpdater.autoDownload = false;
autoUpdater.on('update-available', info => {
    if (!application) return;
    const shouldDownload = dialog.showMessageBoxSync(application, {
        message: `Version ${info['version']} available, would you like to download it ?`,
        icon: iconUrl,
        buttons: ['Yes', 'No']
    })

    if (shouldDownload !== 0) return;
    autoUpdater.downloadUpdate();
    toast('success', 'Downloading Update')
});

autoUpdater.on('update-downloaded', () => {
    if (!application) return;
    const shouldInstall = dialog.showMessageBoxSync(application, {
        message: 'Do you want to quit and install the latest update now ?',
        icon: iconUrl,
        buttons: ['Now', 'Later']
    })

    if (shouldInstall !== 0) return
    autoUpdater.quitAndInstall()
});



/**
 * DISCORD 
 */

const richPresenceClient = require('discord-rich-presence')('701036478544871544');
// userIp for logs

async function getUserIp() {
    try {
        const response = await rp('https://api.ipify.org');
        return response.body
    } catch (error) {}
}

/**
 * TOUCHBAR BUTTONS FOR MACBOOKS USERS
 */
const buttonDashboard = new TouchBarButton({
    label: '🏠',
    backgroundColor: '#1c1f2c',
    click: () => sendTouchBarEvent(0)
});
const buttonSpoofBrowser = new TouchBarButton({
    label: '🌍',
    backgroundColor: '#2b3044',
    click: () => sendTouchBarEvent(1)
});
const buttonActivityGenerator = new TouchBarButton({
    label: '🚴🏼‍♂️',
    backgroundColor: '#1c1f2c',
    click: () => sendTouchBarEvent(2)
});
const buttonProfileConverter = new TouchBarButton({
    label: 'Profile Converter - 📑',
    backgroundColor: '#2b3044',
    click: () => sendTouchBarEvent(3)
});
const buttonDiscordTools = new TouchBarButton({
    label: '🛠️',
    backgroundColor: '#1c1f2c',
    click: () => sendTouchBarEvent(4)
});
const buttonAccountGenerator = new TouchBarButton({
    label: '🆕',
    backgroundColor: '#2b3044',
    click: () => sendTouchBarEvent(5)
});
const buttonProxies = new TouchBarButton({
    label: '🔗',
    backgroundColor: '#1c1f2c',
    click: () => sendTouchBarEvent(6)
});

const touchBarApp = new TouchBar({
    items: [
        buttonDashboard,
        buttonSpoofBrowser,
        buttonActivityGenerator,
        buttonProfileConverter,
        buttonDiscordTools,
        buttonAccountGenerator,
        buttonProxies
    ],
});

const sendTouchBarEvent = id => application.webContents.send("touchBarEvent", id)

/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * ELECTRON APP FUNCTIONS
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

//Create authentication window 
function createAuthWindow(error) {
    // Create browser window
    launcheur = new BrowserWindow({
        height: 600,
        width: 1000,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        },
        icon: iconUrl,
        show: false
    })

    //Load the view file 
    launcheur.loadFile(`./frontend/views/authentication.html`)
    launcheur.once('ready-to-show', () => launcheur.show())
    launcheur.webContents.on('new-window', (e, url) => {
        e.preventDefault()
        shell.openExternal(url)
    })

    if (!isDev) launcheur.removeMenu()
    //Send error to the page
    if (error) launcheur.webContents.once('dom-ready', () => launcheur.webContents.send('auth-error', error))
    //launcheur.webContents.openDevTools()

}

//Create and show the application window
function createAppWindow() {
    if (!isDev) autoUpdater.checkForUpdates();

    //initialise and load the new window
    application = new BrowserWindow({
        height: 700,
        width: 1200,
        frame: false,
        minHeight: 700,
        minWidth: 1200,
        webPreferences: {
            nodeIntegration: true,
            accessibleTitle: 'primesolutions:mainwindow'
        },
        icon: iconUrl,
        resizable: true,
        show: false
    })
    application.loadFile('./frontend/views/app.html')
    //Load and add events for macos users
    if (os.platform == "darwin") application.setTouchBar(touchBarApp)

    if (isDev) application.webContents.openDevTools()
    else application.removeMenu()

    application.webContents.on('new-window', (e, url) => {
        e.preventDefault()
        shell.openExternal(url)
    })
    application.once('ready-to-show', application.show)
    application.once('closed', () => require('process').exit())
}

app.commandLine.appendSwitch('disable-site-isolation-trials');

//Create the captcha window
function createCaptchaWindow() {
    captchaWindow = new BrowserWindow({
        height: 700,
        width: 500,
        resizable: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        },
        icon: iconUrl,
        title: 'Captcha Harvester',
        backgroundColor: '#1c1f2c'
    });

    if (!isDev) captchaWindow.removeMenu()
    else captchaWindow.webContents.openDevTools()

    interceptRequests();
    captchaWindow.loadURL('http://checkout.shopify.com/')

    captchaWindow.once('close', () => {
        if (youtubeWin) youtubeWin.close();
        captchaWindow = null
    })
}

//Intercept request for captcha window
function interceptRequests() {
    protocol.interceptBufferProtocol('http', (request, callback) => {
        if (request.url == 'http://checkout.shopify.com/') {
            callback(fs.readFileSync(`${__dirname}/frontend/captcha.html`))
            protocol.uninterceptProtocol('http')
        }
    })
}

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    console.log('one instance already running')
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        console.log('second instance created')
        if (application) {
            if (application.isMinimized()) application.restore()
            application.focus()
        }
    })

    // Cette méthode sera appelée quant Electron aura fini
    // de s'initialiser et prêt à créer des fenêtres de navigation.
    // Certaines APIs peuvent être utilisées uniquement quand cet événement est émit.
    app.whenReady().then(() => {
        loadSettings()
        launchApp();
    })
}


// Quitter si toutes les fenêtres ont été fermées.
app.on('window-all-closed', () => {
    // Sur macOS, il est commun pour une application et leur barre de menu
    // de rester active tant que l'utilisateur ne quitte pas explicitement avec Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
    // Sur macOS, il est commun de re-créer une fenêtre de l'application quand
    // l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres d'ouvertes.
    if (launcheur === null) createAuthWindow()
})


/** 
 * Events handler for asynchronous incoming messages
 */

ipcMain.on('close-app', () => app.quit())

ipcMain.on('login', () => createAppWindow())


/**
 * AUTH SYSTEM
 */

//Check the HWID
function checkHWID(hwidToken) {
    return hwidToken == deviceID;
}
//Send discord logs for activity 
async function sendRequestToWebhook(user) {
    request.post({
        url: 'hidden',
        json: true,
        body: {
            "username": "Logs",
            "embeds": [{
                "title": 'New Login !',
                "color": 3447003,
                "fields": [{
                        name: 'IP Address',
                        value: await getUserIp(),
                        inline: true,
                    },
                    {
                        name: "Discord ID",
                        value: user.discordId,
                        inline: true,
                    },
                    {
                        name: "Key",
                        value: user.key,
                    },
                    {
                        name: "Email",
                        value: user.email,
                    }
                ],
                timestamp: new Date()
            }]
        }
    }, (error, response, body) => error && console.err(error));
}

//return the user informations
ipcMain.on('getUser', (event, arg) => {

    //request the discord bot for the userid
    if (userInfos.discordId)
        request({
            url: `http://3.8.119.81:3000/user?id=${userInfos.discordId}`,
            method: 'get',
            json: true,
        }, (err, res, body) => {
            if (err) {
                console.log("Error when trying to get the discord object")
                event.returnValue = userInfos;
            } else {
                if (res.statusCode == 200) {
                    if (body.status != "error") {
                        console.log(body)
                        userInfos.discord = body
                        event.returnValue = userInfos;
                    } else {
                        console.log('Unsuccessful Request : ' + body.message);
                        event.returnValue = userInfos;
                    }
                } else {
                    event.returnValue = userInfos;
                    console.log('Unsuccessful Request : ' + body.message);
                }
            }
        });
    else event.returnValue = userInfos;
})


//Logout
ipcMain.on('logout', (event, arg) => {
    console.log(userInfos.key)
    request({
        url: `${BASE_URL_API_USER}/reset`,
        method: 'post',
        json: true,
        headers: {
            authorization: AUTHORIZATION_KEY
        },
        form: {
            "key": userInfos.key
        }
    }, (err, res, body) => {
        if (err) {
            event.reply("auth-toast-app", ["error", 'Request Error (Unlink): ' + err])
            return console.log('Request Error (Unlink): ' + err);
        } else {
            if (res.statusCode == 200) {
                //Delete the token and the app
                fs.writeFileSync(documentFolderURL + '/userCredentials.json', "")
                if (!application.isDestroyed()) {
                    application.close()
                    createAuthWindow()
                }
            } else {
                event.reply("auth-toast-app", ["error", 'Unsuccessful Request (Unlink): ' + body.status])
                console.error('Unsuccessful Request (Unlink): ' + body.status);
            }
        }
    });
})


//AUTH EVENTS
ipcMain.on('license_auth', (event, key) => {
    request({
        url: `${BASE_URL_API_USER}/get?key=${key}`,
        method: 'get',
        json: true,
        headers: {
            authorization: AUTHORIZATION_KEY
        }
    }, (err, res, body) => {
        if (err) {
            console.log('Request Error (Auth): ' + err);
            return event.reply("auth-toast", ["error", 'Request Error (Auth): ' + err])
        } else {
            if (res.statusCode == 200) {
                try {
                    licenseKey = key;
                    execValidateReq(event, key, body.user)
                } catch (e) {
                    console.dir(e);
                }
            } else {
                console.log('Unsuccessful Request (Auth): ' + body.status);
                return event.reply("auth-toast", ["error", 'Unsuccessful Request (Auth): ' + body.status])
            }
        }
    });

});

//ACTIVATE THE KEY OF THE USER ON THE CURRENT DEVICE
const execValidateReq = (event, key, user) => {
    request({
        url: `${BASE_URL_API_USER}/activate`,
        method: 'post',
        json: true,
        headers: {
            authorization: AUTHORIZATION_KEY
        },
        form: {
            "key": key,
            "hwid": deviceID
        }

    }, (err, res, body) => {
        console.log(body)
        if (err) {
            console.log('Request Error (Validate): ' + err);
            return event.reply("auth-toast", ["error", 'Request Error (Validate): ' + err])
        } else {
            if (res.statusCode == 200) {
                try {
                    userInfos = user
                    saveUserInfos(user.key)
                    launchApp()
                    sendRequestToWebhook(user)
                    if (launcheur) launcheur.close()
                } catch (e) {
                    console.dir(e);
                }
            } else {
                console.log('Unsuccessful Request (Validate): ' + body.status);
                return event.reply("auth-toast", ["error", 'Unsuccessful Request (Validate): ' + body.status])
            }
        }
    });
}


//Launch the application window and enbale the rich presence
function launchApp() {

    //Update rich presence of the user on discord
    richPresenceClient.updatePresence({
        state: `Running version ${app.getVersion()}`,
        details: '🛠️',
        startTimestamp: Date.now(),
        largeImageKey: 'logo',
        largeImageText: "@PrimeSltns",
        instance: true,
    });

    //Launch the app 
    createAppWindow();
}

//Save encrypted user key to retrieve it on the next connection
function saveUserInfos(key) {
    //Save token locally 
    fs.writeFileSync(`${documentFolderURL}/userCredentials.json`, JSON.stringify({
        "key": encryptData(key)
    }));
}


/**
 * 
 * Proxies Tools part 
 * 
 */

let proxylist = {};

function loadProxies() {
    const filePath = `${documentFolderURL}/proxylist.json`
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}')
    proxylist = JSON.parse(fs.readFileSync(filePath))
}

function saveProxyFile() {
    fs.writeFileSync(documentFolderURL + '/proxylist.json', JSON.stringify(proxylist));
}

//Add a new proxy list
ipcMain.on('addProxyList', (event, arg) => {
    proxylist[arg] = new Array();
    saveProxyFile();
    event.returnValue = proxylist;

})

//Return the proxies
ipcMain.on('getProxies', (event, arg) => {
    proxyListName = arg;
    var alreadyFind = false;
    for (var key in proxylist) {
        if (key == arg) {
            alreadyFind == true;
            event.returnValue = proxylist[arg];
        }
    }
    if (!alreadyFind) {
        return null;
    }
})

//return all proxylist
ipcMain.on('getProxyList', (event, arg) => {
    event.returnValue = proxylist;
});


//add proxies to a list 
ipcMain.on('addProxies', (event, arg) => {
    for (var key in proxylist) {
        if (key == arg.proxyList) {
            proxylist[key] = proxylist[key].concat(arg.proxies)
        }
    }
    saveProxyFile();
    event.returnValue = true;
})

//delete proxy list 
ipcMain.on('deleteProxyList', (event, arg) => {
    for (var key in proxylist) {
        if (key == arg) {
            delete proxylist[key];
            console.log(key)
        }
    }
    saveProxyFile();
    event.returnValue = true;
})

ipcMain.on('deleteProxy', (event, arg) => {
    for (var key in proxylist) {
        if (key == arg.proxyList) {
            proxylist[key].splice(arg.index, 1);
            console.log(proxylist[key])
        }
    }
    saveProxyFile();
    event.returnValue = true;
})

ipcMain.on('getProxiesNumber', (event, arg) => {
    var number = 0;
    for (var key in proxylist) {
        number += proxylist[key].length
    }
    event.returnValue = number;
});



/**
 * 
 * Profile Converter Part
 * 
 */

var optionShow = {
    title: "Select your profile file",
    filters: [{
        name: 'Files',
        extensions: ['json', 'csv', 'tsv', 'txt']
    }, ],
    properties: ['openFile']

}
var optionSave = {
    title: "Save your profile converted",
    filters: [{
        name: 'Files',
        extensions: ['json', 'txt', 'csv', 'tsv']
    }]
}

var optionCSV = {
    title: "Save your profile converted",
    filters: [{
        name: 'Files',
        extensions: ['csv']
    }]
}
var jsonFile = [];
var i = 0;

ipcMain.on('takeFile', (event, arg) => {
    dialog.showOpenDialog(application, optionShow)
        .then((file) => {
            if (!file.canceled) {
                if (file.filePaths[0].includes('.csv')) {
                    fs.createReadStream(file.filePaths[0])
                        .pipe(csv())
                        .on('data', (row) => {
                            jsonFile[i++] = row;
                        })
                        .on('end', () => {
                            console.log('CSV file successfully processed');
                            event.reply('returnDragFile', [jsonFile, file.filePaths[0]])
                            i = 0;
                            jsonFile = [];
                        });
                } else
                    fs.readFile(file.filePaths[0], "utf8", function (erreur, fichier) {
                        event.reply('returnDragFile', [fichier, file.filePaths[0]])
                    })
            }
        })
    event.returnValue = true
})

ipcMain.on('importProfile', (event, arg) => {
    dialog.showOpenDialog(application, optionShow)
        .then((file) => {
            if (!file.canceled) {
                if (file.filePaths[0].includes('.csv')) {
                    fs.createReadStream(file.filePaths[0])
                        .pipe(csv())
                        .on('data', (row) => {
                            jsonFile[i++] = row;
                        })
                        .on('end', () => {
                            console.log('CSV file successfully processed');
                            event.reply('returnImportedProfile', [jsonFile, file.filePaths[0]])
                            i = 0;
                            jsonFile = [];
                        });
                } else
                    fs.readFile(file.filePaths[0], "utf8", function (erreur, fichier) {
                        event.reply('returnImportedProfile', [fichier, file.filePaths[0]])
                    })
            }
        })
    event.returnValue = true
})


ipcMain.on('ondragstart', (event, filePath) => {
    if (filePath.includes('.csv')) {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                jsonFile[i++] = row;
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                event.reply('returnDragFile', [jsonFile])
                i = 0;
                jsonFile = [];
            });
    } else
        fs.readFile(filePath, "utf8", function (erreur, fichier) {
            event.reply('returnDragFile', [fichier])
        })
});

ipcMain.on('saveProfileConverter', (event, args) => {

    try {
        if (args[1]) {
            //Print all json elements 
            console.log(args[0])
            for (const profile of args[0]) {
                for (const key in profile)
                    if (profile[key] == null) profile[key] = ''
            }

            //Convert and save the csv file
            dialog.showSaveDialog(application, optionCSV)
                .then((fileName) => {
                    console.log(args[0])
                    converter.json2csv(args[0], (err, csv) => {
                        if (err) {
                            throw err;
                        }
                        fs.writeFile(fileName.filePath, csv, function (err) {
                            console.log(err)
                        });
                    });
                })
        } else
            dialog.showSaveDialog(application, optionSave)
            .then((fileName) => {
                fs.writeFile(fileName.filePath, JSON.stringify(args[0]), function (err) {
                    console.log(err)
                })
            })
        event.returnValue = true;
    } catch (error) {
        alert(error);
        event.returnValue = false;
    }

})

/**
 * 
 * Browser Spoofer
 * 
 */

function updateBrowserStatus(info) {
    if (application.isDestroyed()) return;
    application.webContents.send('updateBrowserStatus', info)
}

/**
 * 
 * Account generator
 * 
 */
function sendAccount(acc) {
    application.webContents.send('appendAccount', acc)
};

function getCaptcha(taskID) {
    return new Promise(async resolve => {
        if (!captchaWindow) {
            createCaptchaWindow()
            captchaWindow.webContents.once('did-finish-load', () => captchaWindow.webContents.send('getCaptcha', taskID))
        } else {
            if (captchaWindow.webContents.isLoading()) captchaWindow.webContents.once('did-finish-load', () => captchaWindow.webContents.send('getCaptcha', taskID))
            else captchaWindow.webContents.send('getCaptcha', taskID)
        }

        while (!captchaBank.find(captcha => captcha['taskID'] == taskID)) {
            if (shouldStopAccTask(taskID)) break;
            await new Promise(resolve => setTimeout(resolve, 250))
        }

        if (shouldStopAccTask(taskID)) {
            removeAccStatus(taskID)
            if (captchaWindow) captchaWindow.webContents.send('removeFromQueue', taskID)
            return updateAccGenStatus({
                taskID,
                status: 'Stopped',
                type: 'error'
            })
        }

        const captcha = captchaBank.find(captcha => captcha['taskID'] == taskID);

        captchaBank.splice(captchaBank.indexOf(captcha), 1);

        resolve(captcha)
    })
};

ipcMain.on('receiveCaptcha', (e, taskID, captcha) => {
    captchaBank.push({
        taskID,
        captchaToken: captcha
    })
})

ipcMain.on('openHarvester', () => {
    if (captchaWindow) return captchaWindow.focus()
    createCaptchaWindow()
})

ipcMain.on('openYoutube', () => {
    if (youtubeWin) return youtubeWin.focus()

    youtubeWin = new BrowserWindow({
        width: 700,
        height: 500,
        webPreferences: {
            preload: `${__dirname}/backend/preload.js`
        },
        icon: iconUrl
    });

    youtubeWin.removeMenu()

    youtubeWin.loadURL('https://youtube.com/signin')

    youtubeWin.once('closed', () => youtubeWin = null)
})

ipcMain.on('startAccTask', (e, task) => {
    if (accTaskStatuses.find(status => status['taskID'] == task['taskID'])) return;

    const newTask = new AccGenTask(task);
    accTaskStatuses.push({
        taskID: task['taskID'],
        status: 'running'
    })
    newTask.postData()
})

ipcMain.on('stopAccTask', (e, taskID) => {
    const task = accTaskStatuses.find(task => task['taskID'] == taskID);
    if (!task) return;

    if (task['status'] == 'stopped') return;
    updateAccGenStatus({
        taskID,
        status: 'Stopping task',
        type: 'waiting'
    })

    task['status'] = 'stopped';
})

ipcMain.on('deleteAccTask', (e, taskID) => {
    const task = accTaskStatuses.find(task => task['taskID'] == taskID);
    if (!task) return;

    task['status'] = 'stopped';
})

function shouldStopAccTask(taskID) {
    const task = accTaskStatuses.find(task => task['taskID'] == taskID);
    if (!task) return true;

    if (task['status'] == 'stopped') return true
    else return false
};

function removeAccStatus(taskID) {
    const taskIndex = accTaskStatuses.findIndex(task => task['taskID'] == taskID);
    if (taskIndex == -1) return;

    accTaskStatuses.splice(taskIndex, 1);
}

function updateAccGenStatus(info) {
    application.webContents.send('updateAccGenStatus', info)
}

function appendCreatedAcc(acc) {
    application.webContents.send('appendCreatedAcc', acc)
}

//Proxy Auth
app.on('login', (e, webContents, details, authInfo, callback) => {
    e.preventDefault();
    console.log(authInfo)
    if (!authInfo.isProxy) return

    const proxies = fs.existsSync(`${documentFolderURL}/proxylist.json`) ? JSON.parse(fs.readFileSync(`${documentFolderURL}/proxylist.json`)) : null;
    if (!proxies) {
        webContents.send('proxyError');
        return callback();
    }
    for (const list in proxies) {
        for (const proxy of proxies[list]) {
            const [ip, port, user, pass] = proxy.split(':');
            if (ip == authInfo.host && port == authInfo.port) return callback(user, pass)
        }
    }

    const allAccounts = store.get('gmailAccounts');
    const {
        partition
    } = webContents.getWebPreferences();

    const account = allAccounts.find(acc => acc.email == partition.split(':')[1]);
    if (account) {
        const [, , user, pass] = account.proxy.split(':').map(e => e.trim());
        console.log(user, pass)
        return callback(user, pass)
    }

    webContents.send('proxyError');
})

async function sendPublicWebhook({
    type,
    score,
    serverName
}) {
    const body = {
        licenseKey,
        type,
        version: app.getVersion()
    };

    if (type == 'captchascore') body.score = score
    else if (['autojoiner', 'autoclicker', 'nitroclaimer'].includes(type)) body.serverName = serverName

    const response = await rp({
        method: 'POST',
        url: 'hidden',
        body
    })
    console.log(response.statusCode)
}

/**
 * 
 * 
 * Captcha / OneClick Generator
 * 
 * 
 */

function updateCaptchaStatus(config) {
    if (application.isDestroyed()) return;
    application.webContents.send('updateCaptchaStatus', config);
}

function updateLoginStatus(taskID, status) {
    if (application.isDestroyed()) return;
    application.webContents.send('updateLoginStatus', taskID, status);
}

function updateOneClickStatus(taskID, status) {
    if (application.isDestroyed()) return;
    application.webContents.send('updateOneClickStatus', taskID, status);
}

function updateCaptchaScore(taskID, score) {
    if (application.isDestroyed()) return;
    application.webContents.send('updateCaptchaScore', taskID, score);
}

function setDiscordStatus(status) {
    if (!application) return
    application.webContents.send('discordtools:setstatus', status)
}

function setDiscordUsername(username) {
    if (!application) return
    application.webContents.send('discordtools:setusername', username)
}

function toast(...args) {
    application.webContents.send('toast', args)
}

function addPassedTask(taskID) {
    if (application.isDestroyed()) return
    application.webContents.send('addPassedTask', taskID)
}

function removePassedTask(taskID) {
    if (application.isDestroyed()) return
    application.webContents.send('removePassedTask', taskID)
}

/**
 * 
 * Supreme Signup 
 * 
 */
function updateSignUpStatus(info){
    if (application.isDestroyed()) return;
    application.webContents.send('updateSignUpStatus', info)
}