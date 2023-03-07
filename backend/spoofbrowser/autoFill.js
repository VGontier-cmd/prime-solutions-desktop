const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const store = new Store({ encryptionKey: '75866161b7adaa1e31f868036c1b1a98' })

ipcRenderer.on('autofill', autoFill)

function autoFill(e, taskID) {
    const url = location.href
    // if (url.includes('supremenewyork.com')) autoFillSupreme()
    if (url.includes('nike.com')) autoFillNike(taskID)
}

function getNikeAccount(taskID) {
    const tasks = store.get('browserTasks');
    // const nikeAccounts = store.get('nikeAccounts');
    // if ((!tasks || !nikeAccounts) || (!tasks.length || !nikeAccounts.length)) return null
    if (!tasks || !tasks.length) return

    const task = tasks.find(t => t.taskID == taskID);
    if (!task) return null

    const { nikeAccount } = task;
    if (!nikeAccount) return null
    
    return nikeAccount

    // const nikeAccount = nikeAccounts.find(acc => acc.split(':')[0] == nikeAccEmail);
    // console.log('acc:', nikeAccount)
    // if (!nikeAccount) return null

    // return nikeAccount
}

function autoFillField(element, text) {
    console.log(element, text)
    if (!element) return
    element.dispatchEvent(new Event('focus'));
    element.value = '';
    element.dispatchEvent(new Event('change'));
    [...text].forEach(char => {
        element.value += char;
        element.dispatchEvent(new Event('change'));
    })
    element.dispatchEvent(new Event('blur'))
}

function autoFillSupreme() {
    const elements = ['#order_billing_name', '#order_email', '#order_tel', 'input[name="order[billing_address]"]', 'input[name="order[billing_address_2]"]', '#order_billing_city',
        '#order_billing_zip', '#order_billing_country'];
    elements.forEach(e => $(e).length && $(e).val('test'))
}

function autoFillNike(taskID) {
    const account = getNikeAccount(taskID)
    if (!account) return

    console.log(account)
    const [email, password] = account.split(':');
    console.log(email, password)

    autoFillField(document.querySelector('input[type=email]'), email)
    autoFillField(document.querySelector('input[type=password]'), password)
}