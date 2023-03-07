const rp = require('request-promise').defaults({
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36'
    },
    simple: false,
    resolveWithFullResponse: true,
    followAllRedirects: true,
    time: true
});
const cheerio = require('cheerio');
const Store = require('electron-store');
const store = new Store({ encryptionKey: '75866161b7adaa1e31f868036c1b1a98', watch: true })

const { updateAccGenStatus, removeAccStatus, shouldStopAccTask, appendCreatedAcc, getCaptcha } = require('../../app');

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

function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVW0123456789';
    let password = '';

    for (let i = 0; i < 10; i++) {
        password += chars.charAt(~~(Math.random() * chars.length));
    };
    
    return password;
};

let settings = null;

function loadSettings() {
    const accgensettings = store.get('accGenSettings');
    if (!accgensettings) {
        settings = {
            '2captcha': false,
            '2captchaKey': ''
        };
        store.set('accGenSettings', settings)
    } else settings = accgensettings

    store.onDidChange('accGenSettings', newVal => settings = newVal)
}
loadSettings()

module.exports = class AccountGenTask {
    constructor ({ taskID, storeType, store, email, proxy }) {
        this.taskID = taskID;
        this.storeType = storeType;
        this.store = store;
        this.email = email;
        this.proxy = proxy;

        this.password = generatePassword();
        this.jar = rp.jar()
        this.url = this.storeType == 'custom' ? `${this.store}/account` : `https://${this.storeType}/account`;

        console.log(this.proxy)
        if (this.proxy) {
            if (this.proxy.split(':')[2] && this.proxy.split(':')[3]) this.proxy = `http://${proxy.split(':')[2]}:${proxy.split(':')[3]}@${proxy.split(':')[0]}:${proxy.split(':')[1]}`;
            else this.proxy = `http://${proxy.split(':')[0]}:${proxy.split(':')[1]}`;
        }
    }

    stopTask() {
        updateAccGenStatus({ taskID: this.taskID, status: 'Stopped', type: 'error' })
        removeAccStatus(this.taskID)
    }

    async postData() {
        try {
            if (shouldStopAccTask(this.taskID)) return this.stopTask()
            updateAccGenStatus({ taskID: this.taskID, type: 'waiting', status: 'Creating account' })

            const options = {
                method: 'POST',
                url: this.url,
                form: {
                    'form_type': 'create_customer',
                    'utf-8': '✓',
                    'customer[first_name]': firstNames[~~(Math.random() * firstNames.length)],
                    'customer[last_name]': lastNames[~~(Math.random() * lastNames.length)],
                    'customer[email]': this.email,
                    'customer[password]': this.password
                },
                jar: this.jar
            };

            if (this.proxy) options['proxy'] = this.proxy;

            const response = await rp(options)
        
            console.log(response.statusCode)
            // console.log(response.request._redirect.redirects)
            if (response.statusCode !== 200) return updateAccGenStatus({ taskID: this.taskID, type: 'error', status: 'Invalid Store' })

            const $ = cheerio.load(response.body);
            this.authToken = $('input[name=authenticity_token]').val();

            if (shouldStopAccTask(this.taskID)) return this.stopTask()
            this.postCaptcha()
        } catch (err) {
            if (shouldStopAccTask(this.taskID)) return this.stopTask()
            updateAccGenStatus({ taskID: this.taskID, type: 'error', status: 'Error, retrying' })
            setTimeout(this.postData.bind(this), 500)
        }
    }

    async postCaptcha() {
        try {
            if (shouldStopAccTask(this.taskID)) return this.stopTask()
            
            if (!settings['2captcha']) {
                updateAccGenStatus({ taskID: this.taskID, type: 'waiting', status: 'Waiting for captcha' })
                const captcha = await getCaptcha(this.taskID);
                this.captchaToken = captcha.captchaToken
            } else {
                updateAccGenStatus({ taskID: this.taskID, type: 'waiting', status: 'Awaiting 2Captcha' })
                await this.requestCaptcha()

                while (!this.captchaToken) {
                    await this.get2CaptchaResponse()

                    await new Promise(resolve => setTimeout(resolve, 1000))
                }
            }
                
            
            if (shouldStopAccTask(this.taskID)) return this.stopTask()
            updateAccGenStatus({ taskID: this.taskID, type: 'waiting', status: 'Creating account' })

            if (shouldStopAccTask(this.taskID)) return this.stopTask()
            
            const options = {
                method: 'POST',
                url: this.url,
                form: {
                    'authenticity_token': this.authToken,
                    'g-recaptcha-response': this.captchaToken
                },
                jar: this.jar
            };

            if (this.proxy) options['proxy'] = this.proxy;

            const response = await rp(options)
        
            console.log(response.statusCode, response.body, this.email, this.password)
            // console.log(response.request._redirect.redirects)

            if (shouldStopAccTask(this.taskID)) return this.stopTask()
            if (response.statusCode !== 400) {
                updateAccGenStatus({ taskID: this.taskID, type: 'success', status: 'Account created' })
                appendCreatedAcc(`${this.email}:${this.password}`)
            } else updateAccGenStatus({ taskID: this.taskID, type: 'error', status: 'Error while sending Captcha' })

            removeAccStatus(this.taskID)
        } catch (err) {
            if (shouldStopAccTask(this.taskID)) return this.stopTask()
            updateAccGenStatus({ taskID: this.taskID, type: 'error', status: 'Error, retrying' })
            setTimeout(this.postCaptcha.bind(this), 500)
        }
    }

    async requestCaptcha() {
        const response = await rp({
            method: 'POST',
            uri: 'https://2captcha.com/in.php',
            json: true,
            form: {
                key: settings['2captchaKey'],
                method: 'userrecaptcha',
                googlekey: '6LeoeSkTAAAAAA9rkZs5oS82l69OEYjKRZAiKdaF',
                pageurl: 'http://checkout.shopify.com/',
                json: true
            }
        });
    
        console.log(response.statusCode, response.body)
    
        this.captchaID = response.body.request;
    }

    async get2CaptchaResponse() {
        const response = await rp({
            uri: `http://2captcha.com/res.php?id=${this.captchaID}&key=${settings['2captchaKey']}&action=get&json=true`,
            json: true
        });
    
        console.log(response.body)
    
        if (response.statusCode == 200) {
            if (response.body['status'] == 1) this.captchaToken = response.body['request']
        } else updateAccGenStatus({ taskID: this.taskID, type: 'error', status: '2Captcha Error' })
    }
}