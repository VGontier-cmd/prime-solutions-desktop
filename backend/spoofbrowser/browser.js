const { app, ipcMain, BrowserWindow, BrowserView, Notification, session } = require('electron');
const isDev = require('electron-is-dev');
const { updateBrowserStatus, sendPublicWebhook, addPassedTask, removePassedTask } = require('../../app');
const rp = require('request-promise').defaults({
    resolveWithFullResponse: true,
    simple: false,
    json: true
})
const Store = require('electron-store');
const store = new Store({ encryptionKey: '75866161b7adaa1e31f868036c1b1a98' })

const browsers = [];

const passedTasks = [];

ipcMain.on('startBrowser', (e, task) => newWindow(task))
ipcMain.on('stopBrowser', (e, taskID) => closeBrowser(taskID))
ipcMain.on('showBrowser', (e, taskID) => showBrowser(taskID))
ipcMain.on('hideBrowser', (e, taskID) => hideBrowser(taskID))
ipcMain.on('massLinkChange', (e, url) => {
    browsers.forEach(({ viewID }) => {
        const view = BrowserView.fromId(viewID);
        if (!view) return

        view.webContents.loadURL(url)
    })
})

ipcMain.on('browser:loadurl', (e, winID, url) => loadURL(winID, url))
ipcMain.on('browser:goback', (e, winID) => goBack(winID))
ipcMain.on('browser:goforward', (e, winID) => goForward(winID))
ipcMain.on('browser:refresh', (e, winID) => refreshBrowser(winID))
ipcMain.on('browser:autofill', (e, winID) => autoFill(winID))
ipcMain.on('browser:urlchanged', (e, winID, url) => changeBrowserURL(winID, url))

async function newWindow({ taskID, url, proxy, profile, gmailAccount, nikeAccount, isSplash }) {
    console.log(browsers)
    if (browsers.find(task => task['taskID'] == taskID)) return;    
    try {
        updateBrowserStatus({ taskID, status: 'Initializing browser', type: 'waiting' })

        const browser = new BrowserWindow({
            width: 980,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            },
            frame: false,
            resizable: false,
            show: true
        })
        browser.loadURL(`${__dirname}/../frontend/browser.html`)
        browser.webContents.once('dom-ready', () => browser.show())
        if (!isDev) browser.removeMenu()
        browser.webContents.once('dom-ready', () => browser.webContents.send('browser:updateurl', url))

        const browserView = new BrowserView({
            webPreferences: {
                preload: `${__dirname}/preload.js`,
                session: session.fromPartition((Math.random() * 1000).toString())
            }
        })
        browser.setBrowserView(browserView)
        browserView.setBounds({ x: 0, y: 35, width: 980, height: 565 })
        if (isDev) browserView.webContents.openDevTools()
        
        browserView.webContents.on('new-window', (e, url) => {
            e.preventDefault()
            browserView.webContents.loadURL(url)
        })

        const taskObj = {
            taskID, 
            windowID: browser.id,
            viewID: browserView.id,
            nikeAccount
        }; 
        browsers.push(taskObj);
        if (proxy && proxy.split(':')[0] && proxy.split(':')[1]) await browserView.webContents.session.setProxy({ proxyRules: `${proxy.split(':')[0]}:${proxy.split(':')[1]}` })

        browserView.webContents.loadURL(url, { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' });

        const googleCookies = await session.fromPartition(`persist:${gmailAccount}`).cookies.get({});
        googleCookies.map(cookie => {
            const scheme = cookie.secure ? 'https' : 'http';
            const host = cookie.domain[0] == '.' ? cookie.domain.substr(1) : cookie.domain;
            cookie.url = `${scheme}://${host}`
        })
        googleCookies.filter(cookie => !cookie.name.includes('__Secure-') || !cookie.name.includes('__Host-'))

        for (const cookie of googleCookies) {             
            try {
                await browserView.webContents.session.cookies.set(cookie)
            } catch(err) {
                console.log(err.message, cookie)
            }
        }

        browser.on('close', e => {
            e.preventDefault()
            browser.hide()
        })
        browser.once('closed', () => {
            updateBrowserStatus({ taskID, status: 'Browser closed', type: 'error' })
            browserView.destroy()
            console.log(browserView.isDestroyed())
            browsers.splice(browsers.indexOf(taskObj), 1);
        })

        browserView.webContents.on('did-navigate', (e, url) => {
            if (!browser.isDestroyed()) browser.webContents.send('browser:updateurl', url)
        })

        if (!isSplash) return updateBrowserStatus({ taskID, status: 'URL successfully loaded', type: 'success' })
        else updateBrowserStatus({ taskID, status: 'Waiting in splash', type: 'waiting' })

        browserView.webContents.session.cookies.on('changed', (e, cookie, cause, removed) => {
            if (cookie.value.includes('~hmac=') && !removed && cause == 'explicit') {
                if (passedTasks.includes(taskID)) return
                console.log('hmac cookie was added:', cookie.value, taskID)
                
                updateBrowserStatus({ taskID, status: 'Passed splash', type: 'success' })
                notifyPassed(taskID)

                browser.webContents.session.cookies.removeAllListeners()
            }
        });

    } catch(err) {
        updateBrowserStatus({ taskID, status: 'Error', type: 'error' })
        console.log(err.stack)
    }
}

async function notifyPassed(taskID) {
    if (Notification.isSupported())  {
        const notif = new Notification({
            icon: `${__dirname}/../frontend/assets/img/icon.ico`,
            title: 'Splash passed',
            body: 'A task passed just the splash page!'
        });
        notif.show();
    }

    addPassedTask(taskID)
    passedTasks.push(taskID)

    sendPublicWebhook({ type: 'splashpassed' })
    sendSuccessWebhook()
}

async function sendSuccessWebhook() {
    console.log('sending webhook')
    // if (!settings.sendWebhook) return
    const webhook = store.get('settings.webhook');
    if (!webhook) return
    console.log('Webhook url:', webhook)
    const body = {
        username: 'PrimeSolutions',
        avatar_url: 'https://cdn.discordapp.com/attachments/613049104574054456/713821065058713781/Prime_Solutions_Logo_Transparent.png',
        embeds: [{
            title: 'Splash page passed',
            description: ':white_check_mark: One of your tasks just passed the splash page!',
            footer: {
                'icon_url': 'https://cdn.discordapp.com/attachments/613049104574054456/713821065058713781/Prime_Solutions_Logo_Transparent.png',
                'text': `PrimeSolutions Version ${app.getVersion()}`
            },
            color: 547216,
            timestamp: new Date()
        }]
    }
    console.log(body)
    const response = await rp({
        method: 'POST',
        url: webhook,
        body
    });
    console.log(response)

    console.log('Webhook response:', response.statusCode, response.body)
}

function showBrowser(taskID) {
    try {
        if (!browsers.length) return

        let browser = browsers.find(browser => browser['taskID'] == taskID);
        if (!browser) return
        
        browser = BrowserWindow.fromId(browser.windowID);

        if (browser.isVisible()) browser.focus()
        else browser.show()
    } catch (err) {
        updateBrowserStatus({ taskID, status: 'Error', type: 'error' })
        console.log(err.message)
    }
}

function hideBrowser(taskID) {
    try {
        if (!browsers.length) return

        let browser = browsers.find(browser => browser['taskID'] == taskID);
        console.log(browser)
        if (!browser) return
        
        browser = BrowserWindow.fromId(browser.windowID);

        browser.hide()
    } catch (err) {
        updateBrowserStatus({ taskID, status: 'Error', type: 'error' })
        console.log(err.stack)
    }
}

function closeBrowser(taskID) {
    try {
        if (!browsers.length) return

        removePassedTask(taskID)
        if (passedTasks.includes(taskID)) passedTasks.splice(passedTasks.indexOf(taskID), 1)
        
        const browser = browsers.find(browser => browser['taskID'] == taskID);
        if (!browser) return
    
        const window = BrowserWindow.fromId(browser.windowID);
        console.log(window)
        window.destroy()
    } catch (err) {
        updateBrowserStatus({ taskID, status: 'Error', type: 'error' })
        console.log(err.message)
    }
}

function loadURL(winID, url) {
    if (!winID) return

    const task = browsers.find(b => b.windowID == winID)
    if (!task) return

    if (!url.startsWith('http')) return
    const view = BrowserView.fromId(task.viewID)
    view.webContents.loadURL(url)    
}

function goBack(winID) {
    if (!winID) return

    const task = browsers.find(b => b.windowID == winID)
    if (!task) return

    const view = BrowserView.fromId(task.viewID)
    view.webContents.goBack()    
}

function goForward(winID) {
    if (!winID) return

    const task = browsers.find(b => b.windowID == winID)
    if (!task) return

    const view = BrowserView.fromId(task.viewID)
    view.webContents.goForward()
}

function refreshBrowser(winID) {
    if (!winID) return

    const task = browsers.find(b => b.windowID == winID)
    if (!task) return

    const view = BrowserView.fromId(task.viewID)
    view.webContents.reload()
}

function autoFill(winID) {
    if (!winID) return

    const task = browsers.find(b => b.windowID == winID)
    if (!task) return
    const { taskID } = task;

    const view = BrowserView.fromId(task.viewID)
    view.webContents.send('autofill', taskID)
}

function changeBrowserURL(winID, url) {
    if (!winID) return

    const task = browsers.find(b => b.windowID == winID)
    if (!task) return

    const window = BrowserWindow.fromId(winID)
    window.webContents.send('browser:updateurl', url)
}