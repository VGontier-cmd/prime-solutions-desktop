const fs = require('fs');

const createdAccounts = [];
const accGenTasks = [];

$(document).ready(() => $('.accounts-created .number').html(store.get('settings.totalAccounts') || 0))

const firstNames = [
    'Cathrine', 'Jamey', 'Valentine', 'Rosa', 'Timmothy', 'Pearline', 'Evelyn', 'Willis',  
    'Sherwood', 'Elza', 'Chelsie', 'Tito', 'Rudy', 'Rogelio', 'Yvette', 'Margot',
    'Dorris', 'Lorenz', 'Louie', 'Lyla'
];

const lastNames = [
    'Franecki', 'Crona', 'Treutel', 'Nitzsche', 'McClure', 'Langosh', 'Gaylord', 'Predovic',
    'Corkery', 'Renner', 'Schuster', 'Murphy', 'Marquardt', 'Kling', 'Robel', 'Konopelski',
    'Fadel', 'Gutmann', 'Okuneva', 'Predovic'
];

function createAccGenTask() {
    for (const field of ['#accountGen-storeUrl', '#accountGen-email']) {
        if ($(field).val()) continue;

        switch(field) {
            case '#accountGen-storeUrl':
                if ($('#accountGen-store').val() !== 'custom') break;
                else return toast('error', 'Please fill out all required fields')
            case '#accountGen-email':
                return toast('error', 'Please fill out all required fields')
        }
    };

    let email = $('#accountGen-email').val();
    
    if (email.includes('@')) {
        if (email.split('@')[1].toLowerCase() !== 'gmail.com') return toast('error', 'Please use either a gmail or a catchall')
        
        if ($('#accountGen-jigg-email').prop('checked')) {
            const emailArr = email.split('@');
            emailArr[0] += `+${Math.floor(Math.random() * 100000).toString()}`;
    
            email = emailArr.join('@')
        }
    } else {
        email = `${firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase() + lastNames[Math.floor(Math.random() * lastNames.length)].toLowerCase()}@${email}`;
    }

    const proxies = $('#accountGen-proxy').val() !== 'localhost' ? ipcRenderer.sendSync('getProxies', $('#accountGen-proxy').val()) : null;

    const newTask = {
        taskID: generateID(),
        storeType: $('#accountGen-store').val(),
        store: $('#accountGen-storeUrl').val(),
        email,
        proxy: proxies ? proxies[~~(Math.random() * proxies.length)] : null
    };

    accGenTasks.push(newTask)

    $('#accGenTbody').append(`
        <tr data-id="${newTask['taskID']}">
            <td class="account-website">${newTask['storeType'] == 'custom' ? newTask['store'] : newTask['storeType']}</td>
            <td class="account-email">${newTask['email']}</td>
            <td class="account-proxy">${newTask['proxy'] ? newTask['proxy'] : 'None'}</td>
            <td class="account-status">
                <p id="accGenStatus-${newTask['taskID']}" class="waiting">
                    Idle
                </p>
            </td>
            <td class="account-actions">
                <img class="startAccGenTask" src="assets/img/play.png" id="startAccGenTask-${newTask['taskID']}" draggable="false">
                <img class="stopAccGenTask" src="assets/img/stop.png" id="stopAccGenTask-${newTask['taskID']}" draggable="false">
                <img class="deleteAccGenTask" src="assets/img/trash.png" id="deleteAccGenTask-${newTask['taskID']}" draggable="false">
            </td>
        </tr>
    `)

    $('#tasksNumberAccGen').html(accGenTasks.length)
}

ipcRenderer.on('appendCreatedAcc', (e, acc) => {
    createdAccounts.push(acc)
    let accNum = store.get('settings.totalAccounts') || 0;
    accNum++;
    store.set('settings.totalAccounts', accNum);
    addNotification('Account Generator', `Created Account for Email ${acc.split(':')[0]}`, 'green')
    $('.accounts-created .number').html(accNum)
})
ipcRenderer.on('updateAccGenStatus', (e, { taskID, type, status }) => {
    $(`#accGenStatus-${taskID}`).removeClass().addClass(type).html(status)
})

$('#account-generator-startAll').on("click",() => {
    for (const task of accGenTasks) {
        ipcRenderer.send('startAccTask', task)
    }
})

$('#account-generator-stopAll').on("click",() => {
    for (const { taskID } of accGenTasks) {
        ipcRenderer.send('stopAccTask', taskID)
    }
})

$(document).on('click', '.startAccGenTask', ({ target }) => {
    const taskID = target['id'].split('-')[1];
    ipcRenderer.send('startAccTask', accGenTasks.find(task => task['taskID'] == taskID))
})

$(document).on('click', '.stopAccGenTask', ({ target }) => {
    const taskID = target['id'].split('-')[1];
    ipcRenderer.send('stopAccTask', taskID)
})

$(document).on('click', '.deleteAccGenTask', ({ target }) => {
    const taskID = target['id'].split('-')[1];
    $(`[data-id=${taskID}]`).remove()
    const taskIndex = accGenTasks.findIndex(task => task['taskID'] == taskID);
    accGenTasks.splice(taskIndex, 1)
    $('#tasksNumberAccGen').html(accGenTasks.length)
    ipcRenderer.send('deleteAccTask', taskID)
});

$('#modalAccountGenTaskCreation-button').on("click",() => {
    for (let i = 0; i < ($('#accountGen-qty').val() < 1 ? 1 : $('#accountGen-qty').val()); i++) {
        createAccGenTask()
    }
})

$('#accountGen-store').change(() => {
    if ($('#accountGen-store').val() !== 'custom') {
        $('#accountGen-storeUrl').prop('disabled', true)
        $('#accountGen-storeUrl').val($('#accountGen-store').val())
    } else {
        $('#accountGen-storeUrl').prop('disabled', false)
        $('#accountGen-storeUrl').val('')
    }
});

$('#account-generator-export').on("click",() => {
    if (!createdAccounts.length) return toast('error', 'No accounts created')

    const path = dialog.showSaveDialogSync(remote.getCurrentWindow(), {
        filters: [
          { name: 'CSV', extensions: ['csv'] }
        ],
        properties: ['dontAddToRecent']
    });

    console.log(path)
    if (path) fs.writeFileSync(path, createdAccounts.join('\n'))
})

$('#account-generator-captcha').on("click",() => ipcRenderer.send('openHarvester'))

$(load2CaptchaSettings)
function load2CaptchaSettings() {
    const settings = store.get('accGenSettings');
    if (!settings) {
        store.set('accGenSettings', {
            '2captcha': false,
            '2captchaKey': ''
        })
        $('#enable2CaptchaSettings').prop('checked', false)
        $('#accountGen-2captcha-key').val('')
    } else {
        $('#enable2CaptchaSettings').prop('checked', settings['2captcha'])
        $('#accountGen-2captcha-key').val(settings['2captchaKey'] || '')
    }
}
$('#enable2CaptchaSettings').on('change', e => store.set('accGenSettings.2captcha', e.target.checked))
$('#accountGen-2captcha-key').on('change', e => store.set('accGenSettings.2captchaKey', e.target.value))