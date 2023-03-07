let browserTasks = [];
const passedTasks = [];

ipcRenderer.on('updateBrowserStatus', (e, { taskID, status, type }) => {
    $(`#browserTaskStatus-${taskID}`).removeClass().addClass(type).html(status)
})

ipcRenderer.on('addPassedTask', (e, taskID) => {
    if (passedTasks.find(id => taskID == id)) return
    passedTasks.push(taskID)
    addNotification('Spoof Browser', 'Passed the splash page on a task!', 'green')
    $('.tasks-passed .number').html(passedTasks.length)
})

ipcRenderer.on('removePassedTask', (e, taskID) => {
    if (!passedTasks.find(id => taskID == id)) return
    passedTasks.splice(passedTasks.indexOf(taskID), 1)
    $('.tasks-passed .number').html(passedTasks.length)
})

function generateID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVW0123456789';
    let id = '';

    for (let i = 0; i < 6; i++) {
        id += chars.charAt(~~(Math.random() * chars.length));
    };
    
    return id;
}

$('#spoofer-browser-showAll').on('click', () => {
    browserTasks.forEach(({ taskID }) => ipcRenderer.send('showBrowser', taskID))
})
$('#spoofer-browser-hideAll').on('click', () => {
    browserTasks.forEach(({ taskID }) => ipcRenderer.send('hideBrowser', taskID))
})

$('#modalBrowserTaskUrlEdition').on('click', massLinkChange)
function massLinkChange() {
    const url = $('#browser-url-mass-change').val();
    if (!url.startsWith('http')) return toast('error', 'Invalid URL')

    browserTasks = browserTasks.map(task => ({ ...task, url }))
    store.set('browserTasks', browserTasks)

    $('.browser-url').each((i, e) => $(e).html(url))
    ipcRenderer.send('massLinkChange',)
}

function createBrowserTask() {
    for (const field of ['browser-url', 'browser-profile']) {
        if ($(`#${field}`).val() && field !== 'browser-url') break;

        switch(field) {
            case 'browser-url':
                if ($('#browser-url').val() && $('#browser-url').val().startsWith('http')) break;
                return toast('error', 'Please enter a valid url.');
            case 'browser-profile':
                if (!$('#browser-autofill').prop('checked')) break;
                return toast('error', 'Please select a profile.')
        }
    }

    const proxies = $('#browser-proxylist').val() !== 'localhost' ? ipcRenderer.sendSync('getProxies', $('#browser-proxylist').val()) : null;
    console.log(proxies)
    const newTask = {
        taskID: generateID(),
        url: $('#browser-url').val(),
        // proxy: proxies ? proxies.length ? proxies[~~(Math.random() * proxies.length)] : null : null,
        proxy: proxies ? proxies[~~(Math.random() * proxies.length)] : null,
        gmailAccount: $('#browser-gmail').val() == 'none' ? null : $('#browser-gmail').val(),
        nikeAccount: $('#browser-nike-account').val() == 'none' ? null : $('#browser-nike-account').val(),
        isSplash: $('#browser-enable-queue-release').prop('checked'),
        profile: null
    };

    if (browserTasks.find(task => task.taskID == newTask['taskID'])) return createBrowserTask()
    
    browserTasks.push(newTask)
    
    console.log(newTask)

    $('.spoof-browser tbody').append(`
        <tr data-id="${newTask['taskID']}">
            <td class="browser-url" id="browserUrl-${newTask['taskID']}">${newTask['url']}</td>
            <td class="browser-proxy">${newTask['proxy'] ? newTask['proxy'] : 'None'}</td>
            <td class="browser-status">
                <p class="waiting" id="browserTaskStatus-${newTask['taskID']}">Idle</p>
            </td>
            <td class="browser-actions">
                <i class="fas fa-play startBrowser" id="startBrowser-${newTask['taskID']}"></i>
                <i class="fas fa-stop stopBrowser" id="stopBrowser-${newTask['taskID']}"></i>
                <i class="fas fa-eye showBrowser" id="showBrowser-${newTask['taskID']}"></i>
                <i class="fas fa-eye-slash hideBrowser" id="hideBrowser-${newTask['taskID']}"></i>
                <i class="fas fa-trash deleteBrowser" id="deleteBrowser-${newTask['taskID']}"></i>
            </td>
        </tr>
    `)

    store.set('browserTasks', browserTasks)
    $('#tasksNumberBrowser').html(browserTasks.length)
    $('.browsers-running .number').html(browserTasks.length)
};

function duplicateBrowserTask(taskID) {
    const task = browserTasks.find(task => task['taskID'] == taskID);

    console.log(task)

    if (!task) return toast('error', 'Error while cloning task')

    const newTask = JSON.parse(JSON.stringify(task));

    newTask['taskID'] = generateID();

    if (browserTasks.find(task => task['taskID'] == newTask['taskID'])) return duplicateBrowserTask(taskID);

    browserTasks.push(newTask);

    $('.spoof-browser tbody').append(`
        <tr data-id="${newTask['taskID']}}">
            <td class="browser-url" id="browserUrl-${newTask['taskID']}">${newTask['url']}</td>
            <td class="browser-proxy">${newTask['proxy'] ? newTask['proxy'] : 'None'}</td>
            <td class="browser-status"><p>Idle</p></td>
            <td class="browser-actions">
                <img src="assets/img/play.png" id="startBrowser-${newTask['taskID']}" class="startBrowser">
                <img src="assets/img/stop.png" id="stopBrowser-${newTask['taskID']}" class="stopBrowser">
                <img src="assets/img/trash.png" id="deleteBrowser-${newTask['taskID']}" class="deleteBrowser">
            </td>
        </tr>
    `);

    $('.tasks-number .number').html(browserTasks.length)
    $('.browsers-running .number').html(browserTasks.length)
};

function deleteBrowserTask(taskID) {
    const task = browserTasks.find(task => task['taskID'] == taskID);

    if (!task) return toast('error', 'Error while deleting task');

    browserTasks.splice(browserTasks.indexOf(task), 1);
    store.set('browserTasks', browserTasks)
    $(`[data-id=${taskID}]`).remove();

    ipcRenderer.send('stopBrowser', taskID)

    $('#tasksNumberBrowser').html(browserTasks.length)
    $('.browsers-running .number').html(browserTasks.length)
}

async function deleteAllBrowserTasks() {
    const { response } = await dialog.showMessageBox(remote.getCurrentWindow(), {
        message: 'Are you sure you want to delete all browser tasks?',
        buttons: ['cancel', 'yes']
    });
    if (!response) return

    store.set('browserTasks', [])
    browserTasks.forEach(task=>{
        ipcRenderer.send('stopBrowser', task['taskID'])
        $(`[data-id=${task['taskID']}]`).remove();
    })
    browserTasks.splice(0, browserTasks.length)
    $('#tasksNumberBrowser').html(0)
    $('.browsers-running .number').html(0)
}

$(document).on('click', '.startBrowser', ({ target }) => ipcRenderer.send('startBrowser', browserTasks.find(task => task['taskID'] == target.id.split('-')[1])))
$(document).on('click', '.stopBrowser', ({ target }) => ipcRenderer.send('stopBrowser', target.id.split('-')[1]))
$(document).on('click', '.showBrowser', ({ target }) => ipcRenderer.send('showBrowser', target.id.split('-')[1]))
$(document).on('click', '.hideBrowser', ({ target }) => ipcRenderer.send('hideBrowser', target.id.split('-')[1]))
// $(document).on('click', '.cloneBrowser', ({ target }) => duplicateBrowserTask(target.id.split('-')[1]))
$(document).on('click', '.deleteBrowser', ({ target }) => deleteBrowserTask(target.id.split('-')[1]))

$('#spoofer-browser-startAll').on("click", () => browserTasks.forEach(task => ipcRenderer.send('startBrowser', task)))
$('#spoofer-browser-stopAll').on("click", () => browserTasks.forEach(({ taskID }) => ipcRenderer.send('stopBrowser', taskID)))
$('#spoofer-browser-deleteAll').on("click", deleteAllBrowserTasks)

$('#modalBrowserTaskCreation-button').on("click",({ target }) => {
    const type = $(target).data()['tasktype'];

    const browserFields = ['browser-url', 'browser-proxylist', 'browser-profile'];
    const captchaFields = [];
    const accFields = [];

    for (const field of type == 'browser' ? browserFields : type == 'captcha' ? captchaFields : accFields) {
        if ($(`#${field}`).val() && field !== 'browser-url') break;

        switch(field) {
            case 'browser-url':
                if ($('#browser-url').val() && $('#browser-url').val().startsWith('http')) break;
                return toast('error', 'Please enter a valid url.');
            case 'browser-proxylist':
                if (!$('#browser-useproxy').prop('checked')) break;
                return toast('error', 'Please select a proxy list.')
            case 'browser-profile':
                if (!$('#browser-autofill').prop('checked')) break;
                return toast('error', 'Please select a profile.')
        }
    }

    for (let i = 0; i < ($(`#${type}-qty`).val() <= 0 ? 1 : $(`#${type}-qty`).val()); i++) {
        if (type == 'browser') {
            createBrowserTask()
        } else if (type == 'captcha') {
            createCaptchaTask()
        } else {
            createAccTask()
        }
    }
})

function loadBrowserTasks() {
    const tasks = store.get('browserTasks');

    if (!tasks || !tasks.length) return;

    browserTasks.push(...tasks);

    for (const task of tasks) {
        $('.spoof-browser tbody').append(`
            <tr data-id="${task['taskID']}">
            <td class="browser-url" id="browserUrl-${task['taskID']}">${task['url']}</td>
                <td class="browser-proxy">${task['proxy'] ? task['proxy'] : 'None'}</td>
                <td class="browser-status">
                    <p id="browserTaskStatus-${task['taskID']}" class="waiting">Idle</p>
                </td>
                <td class="browser-actions">
                    <i class="fas fa-play startBrowser" id="startBrowser-${task['taskID']}"></i>
                    <i class="fas fa-stop stopBrowser" id="stopBrowser-${task['taskID']}"></i>
                    <i class="fas fa-eye showBrowser" id="showBrowser-${task['taskID']}"></i>
                    <i class="fas fa-eye-slash hideBrowser" id="hideBrowser-${task['taskID']}"></i>
                    <i class="fas fa-trash deleteBrowser" id="deleteBrowser-${task['taskID']}"></i>
                </td>
            </tr>
        `)
    };

    $('#tasksNumberBrowser').html(browserTasks.length)
    $('.browsers-running .number').html(browserTasks.length)
};

$(document).ready(loadBrowserTasks)

$('#browserModifyNikeAccounts-btn').on('click', saveNikeAccounts)
function saveNikeAccounts() {
    const accounts = $('#browserModifyNikeAccounts-field').val().split('\n').map(e => e.trim()).filter(e => e)
    store.set('nikeAccounts', accounts)

    loadNikeAccounts()
}

function loadNikeAccounts() {
    const accounts = store.get('nikeAccounts');
    if (!accounts || !accounts.length) return

    $('#browser-nike-account').html('<option value="none">None</option>')
    $('#browserModifyNikeAccounts-field').val(accounts.join('\n'))
    accounts.forEach(acc => $('#browser-nike-account').append(`<option>${acc}</option>`))
}
$(loadNikeAccounts)