const { app, BrowserWindow, ipcMain, shell, session } = require('electron');
const rp = require('request-promise').defaults({
    simple: false,
    resolveWithFullResponse: true,
    json: true
});
const { Client } = require('discord.js');
const client = new Client();
const Store = require('electron-store');
const store = new Store({ encryptionKey: '75866161b7adaa1e31f868036c1b1a98', watch: true })

const { toast, setDiscordStatus, setDiscordUsername, sendPublicWebhook } = require('../../app');

let settings = {},
    running = false,
    unsubscribe = null;
    loginWindow = null;
    loggedIn = false;

ipcMain.on('discordtools:login', createLoginWindow)
ipcMain.on('discordtools:logout', () => {
    store.set('discordSettings.discordToken', '')
    if (loggedIn) {
        client.removeAllListeners()
        client.destroy()
    }
    running = false;
    loggedIn = false;
    unsubscribe = null;
    settings = {};
    setDiscordStatus('inactive')
    setDiscordUsername(null)
})
ipcMain.on('discordtools:start', startClient)
ipcMain.on('discordtools:stop', () => {
    if (unsubscribe) unsubscribe()
    running = false;
    unsubscribe = null;
    settings = {};
    setDiscordStatus('inactive')
})

function createLoginWindow() {
    if (loginWindow) return loginWindow.focus()

    loginWindow = new BrowserWindow({
        width: 510,
        height: 710,
        resizable: false,
        webPreferences: {
            session: session.fromPartition('discord-login'),
            webSecurity: false
        }
    });
    loginWindow.removeMenu()

    loginWindow.loadURL('https://discord.com/api/oauth2/authorize?client_id=752815281503600680&redirect_uri=https%3A%2F%2Fwww.primesolutions.app%2F&response_type=code&scope=identify');

    loginWindow.webContents.session.webRequest.onSendHeaders(details => {
        if (details.url.split('/').pop().split('&')[0] == 'authorize?client_id=752815281503600680' && details.method == 'POST') {
            if (details.requestHeaders['Authorization']) store.set('discordSettings.discordToken', details.requestHeaders['Authorization'])
            if (loginWindow) loginWindow.close()
            toast('success', 'Discord login successful')
        }
    })

    loginWindow.once('closed', () => loginWindow = null)
}

function loadSettings() {
    const defaultSettings = {
        discordToken: '',
        channelIds: [],
        keywords: [],
        autoJoiner: false,
        autoClicker: false,
        nitroClaimer: false,
        sendWebhook: true
    }

    const discSettings = store.get('discordSettings');
    if (!discSettings) {
        store.set('discordSettings', defaultSettings);
        settings = defaultSettings
    } else settings = discSettings
    
    console.log(settings)
    unsubscribe = store.onDidChange('discordSettings', newVal => {
        for (const prop in newVal) settings[prop] = newVal[prop]
        console.log(settings)
    })
}

function startClient() {
    if (running) return
    loadSettings()
    if (!settings.discordToken) {
        toast('error', 'Please log into a discord account')
        if (unsubscribe) unsubscribe()
        settings = {}
        running = false
        loggedIn = false
        return setDiscordStatus('inactive')
    }

    if (loggedIn) {
        running = true
        return setDiscordStatus('active')
    }
    client.once('ready', () => {
        running = true;
        loggedIn = true;
        setDiscordStatus('active')
        console.log(`Logged in as ${client.user.tag}!`)
        setDiscordUsername(client.user.tag)
    });

    client.on('message', msg => {
        if (!running) return
        if (msg.author.id == client.user.id && settings.ignoreOwn) return
        if (msg.channel.type == 'dm') return
        if (!settings.channelIds.length) return console.log('No channed ids specified.')
        else if (!settings.channelIds.some(channelId => msg.channel.id == channelId)) return

        if (msg.content.includes('discord.gg/') && msg.content.split('discord.gg/')[1] && settings.autoJoiner) {
            console.log(`Found Invite [${msg.guild.name},#${msg.channel.name}]`)
            joinServer(msg.content.split('discord.gg/')[1].split(' ')[0])
        } else if (msg.content.includes('discord.gift/') && msg.content.split('discord.gift/')[1] && settings.nitroClaimer) {
            console.log(`Found Nitro [${msg.guild.name},#${msg.channel.name}]`)
            claimNitro(msg.content.split('discord.gift/')[1].split(' ')[0], msg.guild)
        } else if (settings.autoClicker) {
            if (msg.content.includes('http') && msg.content.split('http')[1] && settings.keywords.some(keyword => msg.content.split('http')[1].includes(keyword))) {
                const url = `http${msg.content.split('http')[1].split(' ')[0]}`;
                
                console.log(`Found URL ${url} [${msg.guild.name},#${msg.channel.name}]`)
                shell.openExternal(url)
            
                const { id, name, icon } = msg.guild;
                const keyword = settings.keywords.find(keyword => msg.content.split('http')[1].includes(keyword));
                const config = {
                    type: 'autoclicker',
                    serverId: id,
                    serverName: name,
                    serverIcon: icon,
                    keyword,
                    url
                };
                sendSuccessWebhook(config)
                sendPublicWebhook(config)
                toast('success', `Found URL: ${url}`)
            } else if (msg.embeds.length) {
                for (const { url } of msg.embeds) {
                    if (settings.keywords.some(kw => url.includes(kw))) console.log('keyword matched', url)
                }
            }
        }
    });

    try {
        client.login(settings.discordToken);
    } catch(err) {
        console.log(err.message)
        if (err.message.includes('invalid')) console.log('Discord Token invalid!')
    }
}

async function joinServer(inviteCode) {
    try {
        console.log(settings.delay)
        await new Promise(resolve => setTimeout(resolve, settings.delay))
        console.log('delay finished')

        const response = await rp({
            method: 'POST',
            url: `https://discordapp.com/api/v8/invites/${inviteCode}`,
            headers: { authorization: settings.discordToken }
        });
    
        if (response.statusCode == 200) {
            const { code, guild: { id, name, icon } } = response.body;

            if (response.body.new_member) {
                const config = {
                    type: 'autojoiner',
                    inviteCode: code,
                    serverId: id,
                    serverName: name,
                    serverIcon: icon
                };
                
                sendSuccessWebhook(config)
                sendPublicWebhook(config)
                toast('success', `Joined server: ${name}`)
            } else console.log(`[${response.statusCode}] Already joined ${response.body.guild.name}`)
            // console.log(response.body)
        } else console.log(`[${response.statusCode}] Error while joining server with invite ${inviteCode}`)
    
    } catch(err) {
        console.log('Error while joining server', err.message)
    }
}

async function claimNitro(nitroCode, { id, name, icon }) {
    try {
        await new Promise(resolve => setTimeout(resolve, settings.delay))
        
        const response = await rp({
            method: 'POST',
            url: `https://discordapp.com/api/v8/entitlements/gift-codes/${nitroCode}/redeem`,
            headers: { authorization: settings.discordToken }
        });
    
        if (response.statusCode == 200) {
            const config = { 
                type: 'nitroclaimer',
                serverId: id,
                serverName: name,
                serverIcon: icon
            };
            sendSuccessWebhook(config)
            sendPublicWebhook(config)
            toast('success', `Claimed nitro in server: ${name}`)
        } else console.log(`[${response.statusCode}] Error while claiming Nitro`)
    } catch(err) {
        console.log('Error while claiming Nitro', err.message)
    }
}

async function sendSuccessWebhook({ type, inviteCode, serverId, serverName, serverIcon, keyword, url }) {
    if (!settings.sendWebhook) return
    const webhook = store.get('settings.webhook');
    if (!webhook) return

    const body = {
        username: 'PrimeSolutions',
        avatar_url: 'https://cdn.discordapp.com/attachments/613049104574054456/713821065058713781/Prime_Solutions_Logo_Transparent.png',
        embeds: [{
            title: 'Discord Tools Success',
            thumbnail: { url: `https://cdn.discordapp.com/icons/${serverId}/${serverIcon}.png` },
            fields: [
                {
                    name: 'Server Name',
                    value: serverName,
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

    if (type == 'autojoiner') {
        body.embeds[0].description = ':white_check_mark: Successfully joined a server'

        body.embeds[0].fields.push({
            name: 'Invite code',
            value: inviteCode,
            inline: true
        })
    } else if (type == 'autoclicker') {
        body.embeds[0].description = ':white_check_mark: Successfully opened a link which matched your keywords'

        body.embeds[0].fields.push({
            name: 'Matched Keyword',
            value: keyword,
            inline: true
        }, {
            name: 'Link',
            value: url,
            inline: true
        })
    } else body.embeds[0].description = ':white_check_mark: Successfully claimed a nitro'

    const response = await rp({
        method: 'POST',
        url: webhook,
        body
    });

    console.log(response.statusCode)
}