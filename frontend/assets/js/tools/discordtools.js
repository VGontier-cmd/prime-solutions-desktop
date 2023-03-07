$('#discord-login').on('click', () => ipcRenderer.send('discordtools:login'))
$('#discord-logout').on('click', () => ipcRenderer.send('discordtools:logout'))
$('#discord-turn-on').on('click', () => ipcRenderer.send('discordtools:start'))
$('#discord-turn-off').on('click', () => ipcRenderer.send('discordtools:stop'))
$('#discord-add-channel-id').on('click', addChannelID)
$('#discord-add-keyword').on('click', addKeyword)

$(document).on('click', '.removeChannel', removeChannel)
$(document).on('click', '.removeKeyword', removeKeyword)

$('#discord-enable-autoclicker').on('change', e => store.set('discordSettings.autoClicker', e.target.checked))
$('#discord-enable-autojoiner').on('change', e => store.set('discordSettings.autoJoiner', e.target.checked))
$('#discord-enable-nitrosniper').on('change', e => store.set('discordSettings.nitroClaimer', e.target.checked))
$('#discord-send-success-webhook').on('change', e => store.set('discordSettings.sendWebhook', e.target.checked))
$('#discord-ignore-message').on('change', e => store.set('discordSettings.ignoreOwn', e.target.checked))
$('#discord-delay').on('change', e => store.set('discordSettings.delay', e.target.value))

$(loadDiscordSettings)

ipcRenderer.on('discordtools:setstatus', (e, status) => {
    $('#discord-status span').text(status == 'active' ? 'ON' : 'OFF').removeClass().addClass(status == 'active' ? 'success' : 'error')
})
ipcRenderer.on('discordtools:setusername', (e, username) => $('#discord-login-display span').text(username || 'None').removeClass().addClass(username ? 'success' : 'error'))

function loadDiscordSettings() {
    $('#discord-channelids').empty()
    $('#discord-keywords').empty()

    const defaultSettings = {
        discordToken: '',
        channelIds: [],
        keywords: [],
        autoJoiner: false,
        autoClicker: false,
        nitroClaimer: false,
        sendWebhook: true,
        ignoreOwn: true,
        delay: 500
    }
    const settings = store.get('discordSettings');
    if (!settings) store.set('discordSettings', defaultSettings)
    for (const key in settings) {
        if (!settings[key]) store.set(`discordSettings.${key}`, defaultSettings[key])
    }

    if (settings.channelIds && settings.channelIds.length) {
        settings.channelIds.forEach(id => {
            $('#discord-channelids').append(`
                <div class="channel-id-element">
                    <div class="channel-id">${id}</div>
                    <div class="actions">
                        <i class="fas fa-trash-alt removeChannel" id="removeChannel-${id}"></i>
                    </div>
                </div>
            `)
        })
    }
    if (settings.keywords && settings.keywords.length) {
        settings.keywords.forEach(keyword => {
            $('#discord-keywords').append(`
                <div class="keyword-id-element">
                    <div class="keyword-id">${keyword}</div>
                    <div class="actions">
                        <i class="fas fa-trash-alt removeKeyword" id="removeKeyword-${keyword}"></i>
                    </div>
                </div>
            `)
        })
    }

    $('#discord-enable-autoclicker').prop('checked', settings.autoClicker)
    $('#discord-enable-autojoiner').prop('checked', settings.autoJoiner)
    $('#discord-ignore-message').prop('checked', settings.ignoreOwn)
    $('#discord-enable-nitrosniper').prop('checked', settings.nitroClaimer)
    $('#discord-send-success-webhook').prop('checked', settings.sendWebhook)
    $('#discord-delay').val(settings.delay)
    
}

function addChannelID() {
    const id = $('#channelIdInput').val().trim()
    if (!id) return
    $('#channelIdInput').val('')

    if ([...id].some(e => isNaN(+e))) return toast('error', 'Invalid channel id')

    const allIds = store.get('discordSettings.channelIds', []);
    if (allIds.includes(id)) return toast('error', 'Channel ID already added')
    store.set('discordSettings.channelIds', [...allIds, id])

    $('#discord-channelids').append(`
        <div class="channel-id-element">
            <div class="channel-id">${id}</div>
            <div class="actions">
                <i class="fas fa-trash-alt removeChannel" id="removeChannel-${id}"></i>
            </div>
        </div>
    `)
}

function addKeyword() {
    const kw = $('#keywordInput').val().trim()
    if (!kw) return
    $('#keywordInput').val('')

    const allKeywords = store.get('discordSettings.keywords', []);
    if (allKeywords.includes(kw)) return toast('error', 'Keyword already added')
    store.set('discordSettings.keywords', [...allKeywords, kw])

    $('#discord-keywords').append(`
        <div class="keyword-id-element">
            <div class="keyword-id">${kw}</div>
            <div class="actions">
                <i class="fas fa-trash-alt removeKeyword" id="removeKeyword-${kw}"></i>
            </div>
        </div>
    `)
}

function removeChannel({ target: { id }}) {
    const channel = id.split('-')[1];
    const allChannels = store.get('discordSettings.channelIds', []);
    if (!allChannels.includes(channel)) return toast('error', 'Error while deleting channel id')

    allChannels.splice(allChannels.indexOf(channel), 1);
    store.set('discordSettings.channelIds', allChannels)
    loadDiscordSettings()
}

function removeKeyword({ target: { id }}) {
    const keyword = id.split('-')[1];
    const allKeywords = store.get('discordSettings.keywords', []);
    if (!allKeywords.includes(keyword)) return toast('error', 'Error while deleting keywords')

    allKeywords.splice(allKeywords.indexOf(keyword), 1);
    store.set('discordSettings.keywords', allKeywords)
    loadDiscordSettings()
}