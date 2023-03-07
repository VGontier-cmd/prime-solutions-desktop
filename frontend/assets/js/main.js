$('#saveWebhook').on("click",() => {
    if (!$('#webhook').val() || (!$('#webhook').val().startsWith('https://'))) return toast('error', 'Invalid webhook')
    store.set('settings.webhook', $('#webhook').val())
    toast('success', 'Saved webhook')
})
$('#testWebhook').on("click",testWebhook)
$(document).ready(() => $('#webhook').val(store.get('settings.webhook')))

async function testWebhook() {
    const webhookUrl = $('#webhook').val();

    if (!webhookUrl || !webhookUrl.startsWith('https://')) return toast('error', 'Invalid webhook')

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'PrimeSolutions',
            avatar_url: 'https://cdn.discordapp.com/attachments/613049104574054456/713821065058713781/Prime_Solutions_Logo_Transparent.png',
            embeds: [{
                title: 'Webhook test',
                description: 'This is a test message from PrimeSolutions',
                footer: {
                    'icon_url': 'https://cdn.discordapp.com/attachments/613049104574054456/713821065058713781/Prime_Solutions_Logo_Transparent.png',
                    'text': `PrimeSolutions V${remote.app.getVersion()}`
                },
                color: 547216,
                timestamp: new Date()
            }]
        })
    });

    if (response.status == 204) toast('success', 'Successfully sent webhook')
    else toast('error', 'Failed to send webhook')
}

async function sendToWebhook(title, fieldsImport) {
    console.log(fieldsImport)
    const webhookUrl = $('#webhook').val();

    if (!webhookUrl || !webhookUrl.startsWith('https://discordapp.com/api/webhooks/') || !webhookUrl.startsWith('https://canary.discordapp.com/api/webhooks/')) return

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'PrimeSolutions',
            avatar_url: 'https://cdn.discordapp.com/attachments/613049104574054456/713821065058713781/Prime_Solutions_Logo_Transparent.png',
            embeds: [{
                title: title,
                fields : fieldsImport,
                footer: {
                    'icon_url': 'https://cdn.discordapp.com/attachments/613049104574054456/713821065058713781/Prime_Solutions_Logo_Transparent.png',
                    'text': `PrimeSolutions V${remote.app.getVersion()}`
                },
                color: 547216,
                timestamp: new Date()
            }]
        })
    });

    if (response.status == 204) toast('success', 'Successfully sent webhook')
    else toast('error', 'Failed to send webhook')
}