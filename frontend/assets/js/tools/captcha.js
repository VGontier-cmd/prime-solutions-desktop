const captchaTasks = [];
const goodAccs = [];

$(document).ready(() => {
    loadCaptchaTasks()
    loadGmailAccounts()
    loadCaptchaSettings()
});
$('#activity-generator-import').on("click",() => {
    const file = dialog.showOpenDialogSync(remote.getCurrentWindow(), {
        filters: [
            { name: 'CSV/TXT', extensions: ['csv', 'txt'] }
        ],
        properties: ['openFile', 'dontAddToRecent']
    });

    if (!file || !file.length) return;

    const accs = fs.readFileSync(file[0]).toString();

    const allAccounts = accs.split('\n').filter(line => line.replace(/\s/g, '').length);
    console.log(allAccounts)
    for (const account of allAccounts) {
        const [email, password, proxy] = account.split(',').map(e => e.trim());
        addGmailAccount({ email, password, proxy }, true)
    }
});
$('#activity-generator-export').on("click",() => {
    const allAccs = store.get('gmailAccounts');
    if (!allAccs || !allAccs.length) return toast('error', 'No accounts to export')

    const path = dialog.showSaveDialogSync(remote.getCurrentWindow(), {
        filters: [
            { name: 'CSV', extensions: ['csv'] }
        ],
        properties: ['dontAddToRecent']
    });

    if (!path) return;

    const formattedAccounts = allAccs.map(({ email, password, proxy }) => `${email},${password},${proxy || ''}`).join('\n');

    fs.writeFileSync(path, formattedAccounts)
    toast('success', 'Successfully exported accounts')
});
$('#activity-generator-delete-all').on('click', async () => {
    const { response } = await dialog.showMessageBox(remote.getCurrentWindow(), {
        message: 'Are you sure you want to delete all accounts?',
        buttons: ['cancel', 'yes']
    });
    if (!response) return
    store.set('gmailAccounts', [])
    loadGmailAccounts()
})
$('#activity-generator-test-score-all').on('click', () => captchaTasks.forEach(task => ipcRenderer.send('testScore', task)))


$(document).on('click', '#editGmailRefreshProxy', () => {
    console.log('clicked')

    $('#editGmailProxyDiv').html(`
        <select id="editGmail-proxyList" class="global-input proxyList"></select>
    `)

    refreshProxyView()
});

$('#createCaptchaTask').on("click",() => {
    const accounts = store.get('gmailAccounts');
    if (!accounts || !accounts.length) return toast('error', 'Invalid Account')
    if ($('#captchaGen-gmail').val() == 'all') return accounts.forEach(acc => addCaptchaTask(acc, true));
    
    const account = accounts.find(acc => acc.email == $('#captchaGen-gmail').val());
    if (!account) return taost('error', 'Invalid Account');

    addCaptchaTask(account, true)
})

$('#addGmailAccount').on("click",() => {
    const proxies = ($('#addGmail-proxy').val() == 'localhost' ? null : ipcRenderer.sendSync('getProxies', $('#addGmail-proxy').val()));

    addGmailAccount({
        email: $('#addGmail-gmail').val(),
        password: $('#addGmail-password').val(),
        proxy: proxies ? proxies[~~(Math.random() * proxies.length)] : ($('#addGmail-speProxy').val().trim() || null)
    }, true);
})

$('#activity-generator-startAll').on("click",() => captchaTasks.forEach(task => ipcRenderer.send('startCaptchaTask', task)))
$('#activity-generator-stopAll').on("click",() => captchaTasks.forEach(task => {
    ipcRenderer.send('stopCaptchaTask', task['taskID'])
}))
$('#activity-generator-deleteAll').on("click", deleteAllCaptchaTasks)

$(document).on('click', '.startCaptchaTask', ({ target: { id } }) => {
    const task = captchaTasks.find(task => task['taskID'] == id.split('-')[1]);
    if (!task) return;
    ipcRenderer.send('startCaptchaTask', task)
})

$(document).on('click', '.stopCaptchaTask', ({ target: { id } }) => ipcRenderer.send('stopCaptchaTask', id.split('-')[1]))
$(document).on('click', '.deleteCaptchaTask', deleteCaptchaTask)


$(document).on('click', '.testCaptcha', ({ target: { id } }) => {
    const task = captchaTasks.find(task => task['taskID'] == id.split('-')[1]);
    if (!task) return;
    ipcRenderer.send('testCaptcha', task)
})

$(document).on('click', '.testScore', ({ target: { id } }) => {
    const task = captchaTasks.find(task => task['taskID'] == id.split('-')[1]);
    if (!task) return;
    ipcRenderer.send('testScore', task)
    // $(`#captchaScore-${id.split('-')[1]}`).html('<div class="loader"></div>')
})

$(document).on('click', '.editGmail', ({ target: { id } }) => {
    const email = id.split('-')[1];

    const accounts = store.get('gmailAccounts');
    if (!accounts || !accounts.length) return;
    const account = accounts.find(acc => acc.email == email);
    if (!account) return;
    $('#editGmailProxyDiv').html(`
        <input id="editGmail-proxy" type="text" class="global-input">
        <i class="fas fa-sync-alt" id="editGmailRefreshProxy"></i>
    `)

    tippy('#editGmailRefreshProxy', {
        content: 'Assign random proxy from list',
        placement: 'right',
        arrow: false
    });

    $('#editGmail-gmailUser').val(account.email || '')
    $('#editGmail-gmailPassword').val(account.password || '')
    $('#editGmail-proxy').val(account.proxy || '')
})

$('#editGmailButton').on("click",editGmail)

$(document).on('click', '.deleteGmail', deleteGmailAccount)
$(document).on('click', '.openAccount', ({ target }) => {
    const email = target.id.split('-')[1]
    ipcRenderer.send('openAccount', email)
})

ipcRenderer.on('updateCaptchaStatus', (e, { taskID, status, type }) => $(`#captchaTaskStatus-${taskID}`).removeClass().addClass(type).html(status))
ipcRenderer.on('updateLoginStatus', (e, taskID, status) => {
    $(`#loginStatus-${taskID}`).html(status == 'failed' ? 'Failed' : 'Success')
    .removeClass()
    .addClass(status == 'failed' ? 'activity-login redText' : 'activity-login greenText')
})
ipcRenderer.on('updateOneClickStatus', (e, taskID, status) => {
    $(`#oneclickStatus-${taskID}`).html(status == 'failed' ? '<i class="fas fa-times redText"></i>' : '<i class="fas fa-check greenText"></i>')
    if (goodAccs.find(acc => acc == taskID)) {
        if (status == 'failed') {
            goodAccs.splice(goodAccs.indexOf(goodAccs.find(acc => acc == taskID)), 1);
            $('#goodAccs').html(goodAccs.length)
        }
        return
    }
    if (status == 'failed') return
    goodAccs.push(taskID)
    $('#goodAccs').html(goodAccs.length)
    const task = captchaTasks.find(t => t.taskID == taskID);
    if (!task) return;
    addNotification('Captcha', `OneClick Success for Email ${task.email}`, 'green')
})
ipcRenderer.on('updateCaptchaScore', (e, taskID, score) => {
    console.log(`Task ${taskID} got a captcha score ${score}`)
    $(`#captchaScore-${taskID}`).html(score)
    .removeClass()
    .addClass(score < 0.7 ? 'activity-score redText' : 'activity-score greenText')
})

function addCaptchaTask({ taskID, email, password, proxy, timer }, save) {
    if (captchaTasks.find(task => task['email'] == email)) return toast('error', 'Account already running')
    
    const newTask = {
        taskID: taskID || generateID(),
        email,
        password,
        proxy
    };
    if (captchaTasks.find(task => task['taskID'] == newTask['taskID'])) return addCaptchaTask({ email, password, proxy })
    
    captchaTasks.push(newTask);
    if (save) store.set('captchaTasks', captchaTasks);

    $('#captcha-tasks tbody').append(`
        <tr data-id="${newTask['taskID']}">
            <td width="14%" class="activity-url">${email}</td>
            <td width="14%"class="activity-proxy">${proxy || 'None'}</td>
            <td width="10%"class="activity-login yellowText" id="loginStatus-${newTask['taskID']}">Not logged in</td>
            <td width="9%"class="activity-oneClick yellowText" id="oneclickStatus-${newTask['taskID']}">?</td>
            <td width="9%"class="activity-score yellowText" id="captchaScore-${newTask['taskID']}">?</td>
            <td width="20%"class="activity-status">
                <p id="captchaTaskStatus-${newTask['taskID']}" class="waiting">
                    Idle
                </p>
            </td>
            <td width="20%" class="activity-actions">
                <i class="fas fa-play startCaptchaTask" id="startCaptchaTask-${newTask['taskID']}"></i>
                <i class="fas fa-stop stopCaptchaTask" id="stopCaptchaTask-${newTask['taskID']}"></i>
                <i class="fas fa-mouse-pointer testCaptcha" id="testCaptcha-${newTask['taskID']}"></i>
                <i class="fas fa-vial testScore" id="testScore-${newTask['taskID']}"></i>
                <i class="fas fa-trash deleteCaptchaTask" id="deleteCaptchaTask-${newTask['taskID']}"></i>
            </td>
        </tr>
    `);
    // <td class="activity-score yellowText" id="captchaScore-${newTask['taskID']}">?</td>
    // <i class="fas fa-vial testScore" id="testScore-${newTask['taskID']}"></i>
                
    $('#tasksNumberCaptcha').html(captchaTasks.length)

    tippy(`#testCaptcha-${newTask['taskID']}`, {
        content: 'Test OneClick',
        placement: 'bottom',
        arrow: false
    })
    tippy(`#testScore-${newTask['taskID']}`, {
        content: 'Test Captcha Score',
        placement: 'bottom',
        arrow: false
    })
};

function deleteCaptchaTask({ target: { id } }) {
    const taskID = id.split('-')[1];
    $(`[data-id=${taskID}]`).remove();
    ipcRenderer.send('deleteCaptchaTask', taskID);
    const taskIndex = captchaTasks.findIndex(task => task['taskID'] == taskID);
    if (taskIndex == -1) return;
    captchaTasks.splice(taskIndex, 1);
    store.set('captchaTasks', captchaTasks);
    $('#tasksNumberCaptcha').html(captchaTasks.length)
}

async function deleteAllCaptchaTasks() {
    const { response } = await dialog.showMessageBox(remote.getCurrentWindow(), {
        message: 'Are you sure you want to delete all captcha tasks?',
        buttons: ['cancel', 'yes']
    });
    if (!response) return

    store.set('captchaTasks', [])
    captchaTasks.forEach(task=>{
        ipcRenderer.send('deleteCaptchaTask', task['taskID'])
        $(`[data-id=${task['taskID']}]`).remove();
    })
    captchaTasks.splice(0, captchaTasks.length);
    $('#tasksNumberCaptcha').html(captchaTasks.length)
}

function deleteGmailAccount({ target: { id } }) {
    const email = id.split('-')[1];

    $(`[data-account="${email}"]`).remove();

    const accounts = store.get('gmailAccounts');
    if (!accounts || !accounts.length) return 

    console.log(email)
    session.fromPartition(`persist:${email}`).clearStorageData();

    const accIndex = accounts.findIndex(acc => acc['email'] == email);
    if (accIndex == -1) return
    accounts.splice(accIndex, 1);
    store.set('gmailAccounts', accounts);
    loadGmailAccounts()
}

function editGmail() {
    const gmail = $('#editGmail-gmailUser').val();
    if (!gmail) return

    const accounts = store.get('gmailAccounts');
    if (!accounts || !accounts.length) return

    const accIndex = accounts.findIndex(acc => acc.email == gmail);
    if (accIndex == -1) return

    const proxies = $('#editGmail-proxyList').length ? ($('#editGmail-proxyList').val() == 'localhost' ? null : ipcRenderer.sendSync('getProxies', $('#editGmail-proxyList').val())) : null;

    accounts[accIndex] = {
        email: $('#editGmail-gmailUser').val(),
        password: $('#editGmail-gmailPassword').val(),
        proxy: proxies ? proxies[~~(Math.random() * proxies.length)] : ($('#editGmail-proxy') ? ($('#editGmail-proxy').val() || null) : null)
    };

    store.set('gmailAccounts', accounts);
    loadGmailAccounts()
    toast('success', 'Successfully edited gmail account')
};

function addGmailAccount({ email, password, proxy }, save) {
    if (!email.includes('@')) {
        if (save) return toast('error', 'Please enter a valid email')
        else return
    }
    const allAccounts = store.get('gmailAccounts') || [];
    if (save) {
        if (allAccounts.find(acc => acc['email'] == email)) return toast('error', `Email "${email}" already added`)
    }
    
    const newAccount = { email, password, proxy };
    
    if (save) {
        allAccounts.push(newAccount);
        store.set('gmailAccounts', allAccounts);
    }

    $('#gmail-accounts tbody').append(`
        <tr data-account="${newAccount['email']}">
            <td class="gmail-url">${newAccount['email']}</td>
            <td class="gmail-proxy">${newAccount['proxy'] || 'None'}</td>
            <td class="gmail-actions">
                <i class="fas fa-external-link-alt openAccount" id="openAccount-${email}"></i>
                <i class="fas fa-edit editGmail" id="editGmail-${email}" data-toggle="modal" data-target="#modalCaptchaEditGmail"></i>
                <i class="fas fa-trash deleteGmail" id="deleteGmail-${email}"></i>
            </td>
        </tr>
    `);

    tippy(`i[id="openAccount-${email}"]`, {
        content: 'Open in browser',
        placement: 'left',
        arrow: false
    })

    $('#captchaGen-gmail').append(`<option>${email}</option>`)
    $('.form-gmail select').append(`<option value="${email}">${email}</option>`)
}

function loadCaptchaTasks() {
    const captchaTasks = store.get('captchaTasks');
    if (!captchaTasks || !captchaTasks.length) return;

    for (const task of captchaTasks) addCaptchaTask(task, false)
}

function loadGmailAccounts() {
    const accounts = store.get('gmailAccounts');

    $('#gmail-accounts tbody').empty();
    $('#captchaGen-gmail').html('<option value="all">One task per gmail</option>');
    $('.form-gmail select').html('<option value="none">None</option>');
    if (!accounts || !accounts.length) return;

    for (const account of accounts) addGmailAccount(account, false)
}

function loadCaptchaSettings() {
    const defaultSettings = {
        sendOneClickWebhook: true,
        sendScoreWebhook: true,
        runTime: { min: 50, max: 80 },
        sleepTime: { min: 100, max: 180 }
    }
    const captchaSettings = store.get('captchaSettings');

    if (!captchaSettings) {
        store.set('captchaSettings', defaultSettings)
        $('#captcha-send-oc-webhook').prop('checked', defaultSettings.sendOneClickWebhook)
        $('#captcha-send-score-webhook').prop('checked', defaultSettings.sendScoreWebhook)
        $('#captcha-run-time-min').val(defaultSettings.runTime.min)
        $('#captcha-run-time-max').val(defaultSettings.runTime.max)
        $('#captcha-sleep-time-min').val(defaultSettings.sleepTime.min)
        $('#captcha-sleep-time-max').val(defaultSettings.sleepTime.max)
    } else {
        $('#captcha-send-oc-webhook').prop('checked', captchaSettings.sendOneClickWebhook)
        $('#captcha-send-score-webhook').prop('checked', captchaSettings.sendScoreWebhook)
        $('#captcha-run-time-min').val(captchaSettings.runTime.min)
        $('#captcha-run-time-max').val(captchaSettings.runTime.max)
        $('#captcha-sleep-time-min').val(captchaSettings.sleepTime.min)
        $('#captcha-sleep-time-max').val(captchaSettings.sleepTime.max)
    }
}

$('#captcha-send-oc-webhook').on('change', e => store.set('captchaSettings.sendOneClickWebhook', e.target.checked))
$('#captcha-send-score-webhook').on('change', e => store.set('captchaSettings.sendScoreWebhook', e.target.checked))
$('#captcha-run-time-min').on('change', e => store.set('captchaSettings.runTime.min', parseTime(e.target.value)))
$('#captcha-run-time-max').on('change', e => store.set('captchaSettings.runTime.max', parseTime(e.target.value)))
$('#captcha-sleep-time-min').on('change', e => store.set('captchaSettings.sleepTime.min', parseTime(e.target.value)))
$('#captcha-sleep-time-max').on('change', e => store.set('captchaSettings.sleepTime.max', parseTime(e.target.value)))

function parseTime(time) {
    time = parseInt(time);
    if (time <= 0) return 1
    else return time
}