const { app, BrowserWindow, session, net, ipcMain } = require('electron');
const { updateCaptchaStatus, updateLoginStatus, updateOneClickStatus, updateCaptchaScore, sendPublicWebhook, toast } = require('../../app');
const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const adblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const googleTrends = require('google-trends-api');
const isDev = require('electron-is-dev');
const fs = require('fs');
const moment = require('moment');
const rp = require('request-promise').defaults({
    simple: false,
    resolveWithFullResponse: true,
    json: true
});
const Store = require('electron-store');
const store = new Store({ encryptionKey: '75866161b7adaa1e31f868036c1b1a98' })
const log = require('../misc/log');
[adblockerPlugin, stealthPlugin].forEach(p => puppeteer.use(p()));

const captchaTaskStates = [];
const loginWindowQueue = [];
const oneClickWindows = [];
const testingCaptchScore = [];
const openedAccountWindows = [];

process.setMaxListeners(Infinity);

ipcMain.on('startCaptchaTask', startCaptchaTask)

ipcMain.on('stopCaptchaTask', stopCaptchaTask)

ipcMain.on('deleteCaptchaTask', (e, taskID) => {
    stopCaptchaTask(e, taskID);
    const index = captchaTaskStates.findIndex(t => t['taskID'] == taskID);
    if (index == -1) return
    captchaTaskStates.splice(index, 1);
})

ipcMain.on('testCaptcha', testCaptcha)
ipcMain.on('testScore', testCaptchaScore)

ipcMain.on('openAccount', async (e, email) => {
    try {
        const openedWindow = openedAccountWindows.find(win => win.email == email);
        if (openedWindow) return openedWindow.window.focus()
        
        const allAccs = store.get('gmailAccounts');
        const acc = allAccs.find(a => a.email == email)
        if (!acc) return
        console.log(acc)

        const window = new BrowserWindow({
            width: 500,
            height: 700,
            webPreferences: {
                partition: `persist:${email}`
            },
            resizable: false
        })
        if (!isDev) window.removeMenu()
        
        if (acc.proxy) await window.webContents.session.setProxy({ proxyRules: acc.proxy.split(':').slice(0, 2).join(':') });
        
        window.loadURL('https://accounts.google.com')

        const obj = { email, window };
        openedAccountWindows.push(obj)

        window.once('closed', () => openedAccountWindows.splice(openedAccountWindows.indexOf(obj), 1));
    } catch(err) {
        console.log(err)
    }
})

ipcMain.on('oneClickStatus', (e, windowID, status) => {
    const window = oneClickWindows.find(w => w.windowID == windowID);
    if (!window) return;

    updateOneClickStatus(window.taskID, status)
    if (status == 'success') {
        const config = { type: 'captchaoneclick', email: window.email }
        sendDiscordWebhook(config)
        sendPublicWebhook(config)
    }
});

ipcMain.on('receiveCaptchaScore', async (e, winID, token) => {
    const task = captchaScoreWindows.find(task => task.windowID == winID);
    if (!task) return
    
    const response = await rp({
        url: `https://recaptcha-demo.appspot.com/recaptcha-v3-verify.php?action=examples/v3scores&token=${token}`,
        simple: false,
        resolveWithFullResponse: true,
        json: true
    })

    console.log(response.body)

    // updateCaptchaScore(task.taskID, response.body.score)
})

function randomElement() {
    return this[~~(Math.random() * this.length)]
}
Array.prototype.random = randomElement;

const checkTimeoutErr = err => /timeout|connection_failed/i.test(err);

const random = (min, max) => ~~(Math.random() * (max - min + 1) ) + min;

const getVideoDuration = 'document.querySelector(\'.ytp-time-duration\') ? document.querySelector(\'.ytp-time-duration\').innerHTML : null';

function calculateDelay(duration) {
    if (duration.split(':').length > 2) {
        const sleepDur = (+duration.split(':')[0] * 60) + (+duration.split(':')[1]) + (+duration.split(':')[2] / 60);
        return ~~((random(30, 80) / 100) * Math.round(sleepDur) * 60000)
    } else {
        const sleepDur = (+duration.split(':')[0]) + (+duration.split(':')[1] / 60);
        if (sleepDur <= 4) return Math.round(sleepDur) * 60000;

        return ~~((random(30, 80) / 100) * Math.round(sleepDur) * 60000)
    }
};

function startCaptchaTask(e, config) {
    const taskState = captchaTaskStates.find(({ taskID }) => taskID == config['taskID']);
    console.log(taskState)
    if (taskState && taskState['state'] !== 'stopped') return;
    new ActivityTask(config)
};

function stopCaptchaTask(e, taskID) {
    const taskState = captchaTaskStates.find(task => task['taskID'] == taskID);
    if (!taskState || taskState.state == 'stopped') return
    updateCaptchaStatus({ taskID, status: 'Stopping task', type: 'waiting' })
    taskState['state'] = 'stopped';
    const loginWindow = loginWindowQueue.find(task => task['taskID'] == taskID);
    console.log(loginWindow)
    if (loginWindow && loginWindow['loginWin']) {
        loginWindow['loginWin'].close()
        const otherTask = loginWindowQueue.find(task => task.taskID !== taskID && !task.loginWin);
        if (otherTask) otherTask.createLoginWindow()
    }
    loginWindowQueue.splice(loginWindowQueue.indexOf(loginWindow), 1)
};

async function testCaptcha(e, { taskID, email, proxy }) {
    if (!isDev && !captchaTaskStates.find(task => task.taskID == taskID)) return toast('error', 'Please start your task before testing OneClick');

    const googleCookies = await session.fromPartition(`persist:${email}`).cookies.get({ name:'SIDCC', domain:'youtube.com' });
    if (!googleCookies.length) return toast('error', 'Please log into your account before testing OneClick');

    const win = oneClickWindows.find(w => w.taskID == taskID);
    if (win) return BrowserWindow.fromId(win.windowID).focus();

    const testWindow = new BrowserWindow({
        width: 500,
        height: 700,
        frame: false,
        webPreferences: {
            partition: `persist:${email}`,
            nodeIntegration: true,
            webSecurity: false
        },
        backgroundColor: '#1c1f2c',
        resizable: false,
        icon: process.env == 'darwin' ? `${__dirname}/../frontend/assets/img/logo.icns` : `${__dirname}/../frontend/assets/img/icon.ico`
    });

    setupIntercept(email, 'captcha');

    if (proxy !== null) await testWindow.webContents.session.setProxy({ proxyRules: proxy.split(':').slice(0, 2).join(':') });
    
    testWindow.loadURL('http://www.supremenewyork.com/mobile_stock.json');

    const winObj = { taskID, windowID: testWindow.id, email };
    oneClickWindows.push(winObj);

    testWindow.once('closed', () => oneClickWindows.splice(oneClickWindows.indexOf(winObj), 1));
}

async function testCaptchaScore(e, { taskID, email, proxy }) {
    if (!isDev && !captchaTaskStates.find(task => task.taskID == taskID)) return toast('error', 'Please start your task before testing the Captcha Score');

    if (testingCaptchScore.find(task => task == taskID)) return;

    const googleCookies = await session.fromPartition(`persist:${email}`).cookies.get({ name:'SIDCC', domain:'youtube.com' });
    if (!googleCookies.length) return toast('error', 'Please log into your account before testing the Captcha Score');

    const cookies = await session.fromPartition(`persist:${email}`).cookies.get({});
    const args = ['--window-size=700,700', '--mute-audio'];
    if (proxy) args.push(`--proxy-server=${proxy.split(':')[0].trim()}:${proxy.split(':')[1].trim()}`)
    
    const browser = await puppeteer.launch({
        headless: true,
        args,
        ignoreDefaultArgs: ['--enable-automation'],
        executablePath: isDev ? puppeteer.executablePath() : puppeteer.executablePath().replace(/app.asar/i, 'app.asar.unpacked')
    });
    const page = await browser.newPage()

    if (proxy && proxy.split(':')[2] && proxy.split(':')[3]) await page.authenticate({ username: proxy.split(':')[2].trim(), password: proxy.split(':')[3].trim() })
    await page.setCookie(...cookies);

    testingCaptchScore.push(taskID)

    page.on('response', async res => {
        if (res.url().startsWith('https://recaptcha-demo.appspot.com/recaptcha-v3-verify.php?')) {
            const result = await res.json();
            await browser.close()
            if (result.score) {
                updateCaptchaScore(taskID, result.score)
                if (result.score >= 0.7) {
                    const config = { type: 'captchascore', email, score: result.score }
                    sendDiscordWebhook(config)
                    sendPublicWebhook(config)             
                }
            }
        }
    });

    await page.goto('http://recaptcha-demo.appspot.com/recaptcha-v3-request-scores.php');
}

class ActivityTask {
    constructor({ taskID, email, password, proxy, timer }) {
        this.taskID = taskID;
        this.email = email;
        this.password = password;
        // this.timer = timer;

        const settings = store.get('captchaSettings');
        console.log('settings:', settings)
        if (!settings) {
            this.timer = {
                runTime: { min: 50, max: 80 },
                sleepTime: { min: 100, max: 180 }
            }
        } else {
            if (!settings.runTime || !settings.sleepTime) {
                this.timer = {
                    runTime: { min: 50, max: 80 },
                    sleepTime: { min: 100, max: 180 }
                }
            } else this.timer = {
                runTime: {
                    min: settings.runTime.min || 50,
                    max: settings.runTime.max || 80
                },
                sleepTime: {
                    min: settings.sleepTime.min || 100,
                    max: settings.sleepTime.max || 180
                }
            }
        }
        console.log(this.timer)


        if (proxy) {
            const [ip, port, user, pass] = proxy.split(':').map(e => e.trim());
            this.proxy = { ip, port, user, pass };
        }

        this.proxyErrors = 0;

        this.setState('running');

        this.initialize()
    }

    scheduleTask() {
        if (this.shouldStopTask && !this.shouldSleepTask) return this.sendStatus({ status: 'Stopped', type: 'error' });

        const { runTime, sleepTime, runUntil, sleepUntil } = this.timer;

        if (!runUntil) this.timer['runUntil'] = moment().add({ minutes: random(runTime.min, runTime.max) }).unix();
        if (runUntil && this.state !== 'sleeping' && runUntil <= moment().unix()) {
            this.timer['sleepUntil'] = moment().add({ minutes: random(sleepTime.min, sleepTime.max) }).unix();
            this.setState('sleeping')
            console.log('sleeping now')
        } else if (sleepUntil && this.state == 'sleeping' && sleepUntil <= moment().unix()) {
            this.timer['runUntil'] = moment().add({ minutes: random(runTime.min, runTime.max) }).unix();
            this.setState('running')
            console.log('running now')
            this.initialize();
        }

        setTimeout(this.scheduleTask.bind(this), 5000)
    }

    setState(state) {
        const taskState = captchaTaskStates.find(({ taskID }) => taskID == this.taskID);
        if (!taskState) captchaTaskStates.push({ taskID: this.taskID, state });
        else taskState['state'] = state;
    }

    async sleep(time) {
        console.log('Sleeping', time / 60000, 'minutes')
        for (let i = 0; i < time / 500; i++) {
            await new Promise(resolve => setTimeout(resolve, 500))
            if (this.shouldStopTask) break;
        }
    };

    get state() {
        const taskState = captchaTaskStates.find(({ taskID }) => taskID == this.taskID);
        if (!taskState) return 'stopped';
        return taskState['state']
    }

    get shouldStopTask() {
        if (this.state == 'running') return false
        return true
    }

    get shouldSleepTask() {
        if (this.state == 'sleeping') return true
        return false
    }

    sendStatus({ status, type }) {
        updateCaptchaStatus({ taskID: this.taskID, status, type })
    };

    runRandomModule() {
        const allModules = [
            this.youtubeRecommendations,
            this.youtubeRecommendations,
            this.youtubeRecommendations,
            this.youtubeTrends,
            this.googleNews,
            this.google
        ];
        const module = allModules.random().bind(this);
        module();
    }

    async getGoogleSearches() {
        try {
            const results = await googleTrends.dailyTrends({ geo: 'US' });
            return JSON.parse(results)['default']['trendingSearchesDays'].random()['trendingSearches'].random()['title']['query'];
        } catch (err) {
            console.log('Error:', err)
        }
    }
   
    async initialize() {
        try {
            this.sendStatus({ status: 'Verifying Login', type: 'waiting' })
  
            const ses = session.fromPartition(`persist:${this.email}`);
            const youtubeCookies = await ses.cookies.get({ name:'SIDCC', domain:'youtube.com' });
            
            if (!youtubeCookies.length) {
                updateLoginStatus(this.taskID, 'failed')
                return this.createLoginWindow();
            }
            const allCookies = await ses.cookies.get({});
            
            updateLoginStatus(this.taskID, 'success')

            const args = ['--window-size=700,700', '--mute-audio'];
            if (this.proxy) args.push(`--proxy-server=${this.proxy.ip}:${this.proxy.port}`)
    
            this.sendStatus({ status: 'Launching Browser', type: 'waiting' })
            this.browser = await puppeteer.launch({
                headless: !isDev,
                args,
                ignoreDefaultArgs: ['--enable-automation'],
                executablePath: isDev ? puppeteer.executablePath() : puppeteer.executablePath().replace(/app.asar/i, 'app.asar.unpacked')
            });
            this.page = await this.browser.newPage();
            if (this.proxy && this.proxy.user && this.proxy.pass) await this.page.authenticate({ username: this.proxy.user, password: this.proxy.pass })
            await this.page.setCookie(...allCookies);
            
            this.runRandomModule();
            this.scheduleTask();
        } catch (err) {
            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            console.log(err.message)
            log(this.email, err.message)
            if (/proxy/i.test(err.message)) return this.sendStatus({ status: 'Proxy error', type: 'error' })
            this.sendStatus({ status: 'Error while initializing', type: 'error' })
        }
    }

    async createLoginWindow() {
        try {
            loginWindowQueue.push(this);

            if (loginWindowQueue.length && loginWindowQueue[0]['taskID'] !== this.taskID) return this.sendStatus({ status: 'Login queued', type: 'waiting' });
            this.sendStatus({ status: 'Waiting for Login', type: 'waiting' })
    
            this.loginWin = new BrowserWindow({
                height: 700,
                width: 500,
                webPreferences: {
                    partition: `persist:${this.email}`,
                    preload: `${__dirname}/stealth.js`
                },
                title: `Google Login ${this.email}`,
                resizable: false
            })
            if (!isDev) this.loginWin.removeMenu()
            
            console.log(this.proxy)
            if (this.proxy) await this.loginWin.webContents.session.setProxy({ proxyRules: `${this.proxy['ip']}:${this.proxy['port']}` })
    
            this.loginWin.loadURL('https://www.youtube.com/signin', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' });
            
            this.loginWin.once('close', () => {
                this.sendStatus({ status: 'Stopped', type: 'error' });
                this.setState('stopped');
                this.loginWin.webContents.session.cookies.removeAllListeners()
                this.loginWin.webContents.removeAllListeners()
                this.loginWin = null;
                loginWindowQueue.splice(loginWindowQueue.indexOf(this), 1);
            })
            this.loginWin.webContents.on('new-window', e => e.preventDefault())
            this.loginWin.webContents.on('page-title-updated', () => this.loginWin.setTitle(`Google Login ${this.email}`))
            this.loginWin.webContents.session.cookies.on('changed', (e, cookie, cause, removed) => {
                if (cookie.name == 'SIDCC' && cookie.domain == '.youtube.com' && cause == 'explicit' && !removed) {
                    if (this.loginWin) {
                        this.loginWin.webContents.session.cookies.removeAllListeners()
                        this.loginWin.webContents.removeAllListeners()
                        this.loginWin.destroy()
                    }
                    this.initialize()
                    loginWindowQueue.splice(0, 1);
                    if (loginWindowQueue[0]) loginWindowQueue[0].createLoginWindow();
                    return
                }
            });
            this.loginWin.webContents.on('did-finish-load', () => {
                try {
                    this.loginWin.webContents.executeJavaScript(`if (document.querySelector('input[type=email]')) document.querySelector('input[type=email]').value = '${this.email}'`);
                    if (!this.password) return; 
                    this.loginWin.webContents.executeJavaScript(`if (document.querySelector('input[type=password]')) document.querySelector('input[type=password]').value = '${this.password}'`);
                } catch (err) { console.log(err.message) }
            });
        } catch (err) {
            console.log(err.message)
            log(this.email, err.message)
        }
    }

    async google() {
        try {
            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            this.sendStatus({ status: 'Searching Google', type: 'success' })
            const search = await this.getGoogleSearches();

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            await this.page.goto(`https://google.com/search?q=${search}`, { waitUntil: 'networkidle2' });

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            const allLinks = await this.page.evaluate('[...document.querySelectorAll(\'a\')].filter(e => e.getAttribute(\'ping\') && e.href && !/google/i.test(e.href))');
            console.log(allLinks)

            const link = allLinks.random()

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            await this.page.goto(link, { waitUntil: 'networkidle2' });

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            await this.sleep(random(60000, 300000))

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            this.runRandomModule()
        } catch (err) {
            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            console.log('Error:', err.stack)
            log(this.email, err.message)
            if (checkTimeoutErr(err.message)) this.sendStatus({ status: 'Slow connection, retrying', type: 'error' })
            else this.sendStatus({ status: 'Error while searching Google', type: 'error' })
            setTimeout(this.runRandomModule.bind(this), 2000)
        }
    }

    async googleNews() {
        try {
            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            this.sendStatus({ status: 'Choosing news article', type: 'success' })

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            await this.page.goto('https://news.google.com', { waitUntil: 'networkidle2' });

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            const allArticles = await this.page.evaluate('[...document.querySelectorAll(\'a\')].filter(e => e.href && /articles/i.test(e.href)).map(e => e.href)');
            console.log(allArticles)

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            await this.page.goto(allArticles.random(), { waitUntil: 'networkidle2' });

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }
            
            this.sendStatus({ status: 'Reading news', type: 'success' })
            await this.sleep(random(60000, 300000))

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            this.runRandomModule()
        } catch (err) {
            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            console.log('Error:', err.stack)
            log(this.email, err.message)
            if (checkTimeoutErr(err.message)) this.sendStatus({ status: 'Slow connection, retrying', type: 'error' })
            else this.sendStatus({ status: 'Error while searching Google', type: 'error' })
            setTimeout(this.runRandomModule.bind(this), 2000)
        }
    }

    async youtubeRecommendations() {
        try {
            this.sendStatus({ status: 'Watching YouTube', type: 'success' })

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            await this.page.goto('https://youtube.com/', { waitUntil: 'networkidle2', timeout: 20000 });

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            await this.page.waitForSelector('a#video-title-link', { timeout: 10000 });
            const videos = await this.page.$$('a#video-title-link');
            if (!videos.length) return this.youtubeRecommendations();
            
            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            const visibleVideos = videos.filter(async v => await v.boundingBox());
            if (!visibleVideos.length) return this.youtubeRecommendations();
            const video = visibleVideos.find(async v => await v.boundingBox())
            if (!await video.boundingBox()) return this.youtubeRecommendations();

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            await video.click();

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 })

            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            await this.page.waitForSelector('.ytp-time-duration', { visible: true });

            const duration = await this.page.evaluate(getVideoDuration);

            if (!duration) await this.sleep(random(300000, 600000))
            else await this.sleep(calculateDelay(duration))
            
            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }
            
            this.runRandomModule()
        } catch (err) {
            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            console.log('Error:', err.message)
            log(this.email, err.message)
            if (checkTimeoutErr(err.message)) this.sendStatus({ status: 'Slow connection, retrying', type: 'error' })
            else this.sendStatus({ status: 'Error while watching YouTube', type: 'error' })
            setTimeout(this.runRandomModule.bind(this), 2000)
        }
    }

    async youtubeTrends() {
        try {
            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            this.sendStatus({ status: 'Watching YouTube Trends', type: 'success' })
            await this.page.goto('https://www.youtube.com/feed/trending', { waitUntil: 'networkidle2', timeout: 20000 })
            await this.page.waitForSelector('a#video-title', { timeout: 10000 })
            
            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }
            
            const videos = await this.page.$$('a#video-title');
            if (!videos.length) return this.youtubeTrends();
    
            const visibleVideos = videos.filter(async v => await v.boundingBox());
            const video = visibleVideos.find(async v => v.boundingBox())
            if (!await video.boundingBox()) return this.youtubeTrends();
            
            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            await video.click();
            await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
            await this.page.waitForSelector('.ytp-time-duration', { visible: true, timeout: 10000 });
            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }
    
            const duration = await this.page.evaluate(getVideoDuration);
    
            if (!duration) await this.sleep(random(300000, 600000))
            else await this.sleep(calculateDelay(duration))
            
            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            this.runRandomModule() 
        } catch (err) {
            if (this.shouldStopTask) {
                if (this.shouldSleepTask) this.sendStatus({ status: 'Sleeping', type: 'waiting' });
                else this.sendStatus({ status: 'Stopped', type: 'error' });
                
                if (this.browser) await this.browser.close();
                return
            }

            console.log('Error:', err.message)
            log(this.email, err.message)
            if (checkTimeoutErr(err.message)) this.sendStatus({ status: 'Slow connection, retrying', type: 'error' })
            else this.sendStatus({ status: 'Error while watching YouTube', type: 'error' })
            setTimeout(this.runRandomModule.bind(this), 2000)
        }
    }
}

async function sendDiscordWebhook({ type, email, score }) {
    const webhook = store.get('settings.webhook');
    if (!webhook) return
    if (type == 'captchaoneclick' && !store.get('captchaSettings.sendOneClickWebhook')) return
    else if (type == 'captchascore' && !store.get('captchaSettings.sendScoreWebhook')) return

    console.log('sending webhook')

    const body = {
        username: 'PrimeSolutions',
        avatar_url: 'https://cdn.discordapp.com/attachments/613049104574054456/713821065058713781/Prime_Solutions_Logo_Transparent.png',
        embeds: [{
            fields: [
                {
                    name: 'Email',
                    value: email,
                    inline: true
                }
            ],
            footer: {
                'icon_url': 'https://cdn.discordapp.com/attachments/613049104574054456/713821065058713781/Prime_Solutions_Logo_Transparent.png',
                'text': `PrimeSolutions Version ${app.getVersion()}`
            },
            color: 547216,
            timestamp: new Date()
        }]
    }

    if (type == 'captchaoneclick') body.embeds[0].title = ':white_check_mark: OneClick Success'
    else {
        body.embeds[0].title = ':white_check_mark: Captcha Score Success'
        body.embeds[0].fields.push({
            name: 'Captcha Score',
            value: `${score}`,
            inline: true
        })
    }

    const response = await rp({
        method: 'POST',
        url: webhook,
        body
    });

    console.log(response.statusCode)
}

function setupIntercept(email) {
    session.fromPartition(`persist:${email}`).protocol.interceptBufferProtocol('http', (req, callback) => {
        if (req.url == 'http://www.supremenewyork.com/mobile_stock.json') callback({ mimeType: 'text/html', data: fs.readFileSync(`${__dirname}/../frontend/testCaptcha.html`) })
        else {
            const request = net.request(req)
            request.on('response', res => {
                const chunks = []

                res.on('data', chunk => chunks.push(Buffer.from(chunk)))
                res.on('end', async () => callback(Buffer.concat(chunks)))
            })

            if (req.uploadData) {
                req.uploadData.forEach(part => {
                    if (part.bytes) request.write(part.bytes)
                    else if (part.file) request.write(fs.readFileSync(part.file))
                })
            }

            request.end()
        }
    })
}