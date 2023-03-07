const {
    ipcMain,
    session,
    Notification
} = require('electron')
const puppeteer = require('puppeteer');
var signUpTasks = [];
const {
    updateSignUpStatus
} = require('../../app');
ipcMain.on('startSignUpTask', (e, task) => newSignupTasks(task))
ipcMain.on('stopSignUpTask', (e, taskID) => stopSignupTask(taskID))

async function newSignupTasks(args) {
    try {
        var task = await args[0]
        var profile = await args[1]

        console.log(task)
        //Chekc if the tasks is not already running
        if (signUpTasks.find(SignUpTask => SignUpTask['taskID'] == task.taskID)) return;
        //Check if the linked profile exist
        if (!profile){
            updateSignUpStatus({ taskID: task.taskID, status: 'Non-existent profile', type: 'error'})
            return;
        } 
        //Load and create the json for the autofill
        var formInfosProfile = {
            "name": `${profile.billing.first_name} ${profile.billing.last_name}`,
            "email": profile.billing.email,
            "telephone": profile.billing.phone,
            "store_location": task.store_location,
            "address": profile.billing.address,
            "address_2": profile.billing.address_2,
            "zip": profile.billing.zip,
            "city": profile.billing.city,
            "state": profile.billing.state,
            "country" : profile.billing.country_code,
            "ccnumber": profile.payment.card_number,
            "cc_exp_month": (profile.payment.expiration_month.split("")[0] == '0') ? profile.payment.expiration_month.split("")[1] : profile.payment.expiration_month,
            "cc_exp_year": profile.payment.expiration_year,
            "cc_cvc": profile.payment.card_cvv
        }
        //Print for logs
        console.log(formInfosProfile)
        //Retry delay for refreshing the page if the signup forms is not already loaded
        var retryDelay = 1000;
        //Load the current url depending of the store 
        var storeUrl = `https://${(formInfosProfile.store_location == "london" || formInfosProfile.store_location == "paris") ? formInfosProfile.store_location : "register"}.supremenewyork.com`
        //Add the args and the proxy if exist
        var args = ['--mute-audio'];
        if (task.proxy){
            var [ip, port, user, pass] = await task.proxy.split(':').map(e => e.trim());
            task.proxy = { ip, port, user, pass };
            await args.push(`--proxy-server=${task.proxy.ip}:${task.proxy.port}`)
        } 

        //Launch the browser linked to the task and register it to a var to retrieve it 
        
        console.log(args)
        var browser = await puppeteer.launch({
            headless: false,
            args,
            ignoreDefaultArgs: ['--enable-automation'],
            executablePath:  puppeteer.executablePath().replace(/app.asar/i, 'app.asar.unpacked')
        });

        signUpTasks.push({
            taskID: task.taskID,
            browserObject: browser
        })

        //Update the task status 
        updateSignUpStatus({
            taskID: task.taskID,
            status: 'Initializing Task',
            type: 'waiting'
        })

        //Start the script 
        try {
            //Create a new page with a new user agent and also with a proxy auth if a proxy if given
            var [page] = await browser.pages();
            try {
                if (task.proxy && task.proxy.user && task.proxy.pass) await page.authenticate({ username: task.proxy.user, password: task.proxy.pass })
            }catch(error){
                updateSignUpStatus({
                    taskID: task.taskID,
                    status: 'Proxy Auth Error',
                    type: 'error'
                })
            }
          
            page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36")

            //Load the gmail account to the page is existing 
            if (task.gmailAccount) {
                var ses = session.fromPartition(`persist:${task.gmailAccount}`);
                var allCookies = await ses.cookies.get({});
                await page.setCookie(...allCookies);
            }

            //Catch the event send via the console
            page.on('console', msg => {
                for (let i = 0; i < msg.args().length; ++i){
                    //If a reload of the page is needed
                    if(msg.text().includes("page-reload")){
                        setTimeout(() => {
                            page.reload();
                        }, retryDelay);
                        updateSignUpStatus({
                            taskID: task.taskID,
                            status: 'Refreshing Page ...',
                            type: 'waiting'
                        })
                    }
                    //Track events and send updates to the frontend
                    else if(msg.text().includes("page-filling")){
                        updateSignUpStatus({
                            taskID: task.taskID,
                            status: 'Filling Informations ...',
                            type: 'waiting'
                        })
                    }
                    else if(msg.text().includes("page-wait-user-verification")){
                        updateSignUpStatus({
                            taskID: task.taskID,
                            status: 'Waiting User Verification',
                            type: 'success'
                        })
                        if (Notification.isSupported())  {
                            var notif = new Notification({
                                icon: `${__dirname}/../frontend/assets/img/icon.ico`,
                                title: 'Supreme Signup - User Verification !',
                                body: `A user verification is needed for the task : ${task.taskID}`
                            });
                            notif.show();
                        }
                    }
                }
            });
            do {
                //Goto the store url
                await page.goto(storeUrl);
                //Insert JQuery
                await page.addScriptTag({url: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.js'});
                //Wait the page to load and inject the js script 
                await Promise.all([
                    page.waitForNavigation({
                        waitUntil: 'load'
                    }),
                    page.evaluate(function ({
                        formInfosProfile
                    }) {
                        //retrieve user informations for autofill
                        var formInfos = formInfosProfile
                        //ID of the differents fields 
                        var firstFormElements = {
                            "name": "customer_nrime",
                            "email": "customer_email",
                            "telephone": "customer_tel",
                            "store_locations": [
                                "xpref_manhattanx",
                                "xpref_brooklynx",
                                "xpref_lax",
                                "xpref_sfx"
                            ],
                            "country": "customer_country",
                            "address": "customer_st3",
                            "address_2": "customer_street_2",
                            "zip": "customer_zip",
                            "city": "customer_city",
                            "state": "customer_state",
                            "country" : "customer_country",
                            "ccnumber": "cn",
                            "cc_exp_month": "credit_card_month",
                            "cc_exp_year": "credit_card_year",
                            "cc_cvc": "credit_card_verification_value"
                        }
                        /**
                         * Load data in each field for each info
                         */
                        if ($('#signup_button').length == 0) {
                            console.log("page-filling")
                            for (key in firstFormElements) {
                                if (key == "store_locations") {
                                    for (store_location in firstFormElements.store_locations)
                                        if (firstFormElements.store_locations[store_location].includes(formInfos.store_location))
                                            $(`#${firstFormElements.store_locations[store_location]}`).prop("checked", true);
                                } else {
                                    try {
                                        $(`#${firstFormElements[key]}`).val(formInfos[key]);
                                        console.log(formInfos[key])
                                    } catch (error) {
                                        console.log(error)
                                    }
                                }
                            }
                            //Click on next button
                            setTimeout(() => {
                                $('#step_1_button').trigger('click')
                                setTimeout(() => {
                                    $('#submit_button').trigger('click')
                                    console.log("page-wait-user-verification")
                                }, 4000)
                            }, 2000)
                        } else {
                            //Submit a response to reload the current page
                            console.log("page-reload")
                        }
                    }, {
                        formInfosProfile
                    }),
                ]);
            } while (!page.url().includes("signup")) // reload the page until you got the last page
            updateSignUpStatus({
                taskID: task.taskID,
                status: 'Task finished',
                type: 'success'
            })
        } catch (err) {
            console.error(err);
        }
    }catch(error){
        console.log(error)
    }
}
async function stopSignupTask(taskIDToFind) {
    var task = signUpTasks.find(signUpTask => signUpTask.taskID == taskIDToFind)
    if (!task) return
    task.browserObject.close()
    signUpTasks.splice(signUpTasks.indexOf(task), 1)
    updateSignUpStatus({
        taskID: taskIDToFind,
        status: 'Task Stopped',
        type: 'error'
    })
}