const {
    get
} = require("request-promise");

//Close button
$('.close').on("click", () => {
    remote.getCurrentWindow().close();
    ipcRenderer.send('close-app', null);
    // remote.app.quit()
})
//Minimize Button
$('.minimize').on("click", () => remote.getCurrentWindow().minimize())

$('.maximize').on("click", () => {
    (remote.getCurrentWindow().isMaximized()) ? remote.getCurrentWindow().unmaximize(): remote.getCurrentWindow().maximize()
})
//Logout button 
$('#logout-btn').on("click", function () {
    ipcRenderer.send('logout', null)
})

ipcRenderer.on("auth-toast-app", (event, arg) => {
    toast(arg[0], arg[1])
})

//App version
$('#app-version').html(`V ${remote.app.getVersion()} ${isDev ? '[DEV]' : ''}`)

//Get the user object of the discord auth and display informations
async function displayUser() {
    var userObject = await ipcRenderer.sendSync('getUser', null)
    console.log(userObject)
    if (userObject) {
        if (userObject.email) {
            $('.user-email').html(userObject.email)
        }
        if (userObject.email) {
            $('.user-name').html(userObject.email.substr(0, userObject.email.indexOf('@')))
        }
        if (userObject.key) {
            $(".license-keyF").val(userObject.key)
        }
        if (userObject.lifetime) {
            $(".license-type").html("Lifetime")
        }
        if (userObject.subscription.next_renewal) {
            $("#billing-date").html(userObject.subscription.next_renewal)
            if (!userObject.lifetime) {
                var renewal_date = new Date(userObject.subscription.next_renewal)
                var today_date = new Date()

                var Difference_In_Time = renewal_date.getTime() - today_date.getTime();
                $('.renewal-days .number').html(Math.round(Difference_In_Time / (1000 * 3600 * 24)));
            }

        }
        //Replace by discord credentials if existing 
        if (userObject.discord) {
            let discordCred = userObject.discord;
            if (discordCred.tag) {
                $('.user-name').html(discordCred.tag)
            }
            if (discordCred.avatar) {
                $('.avatar-img').attr("src", `https://cdn.discordapp.com/avatars/${discordCred.id}/${discordCred.avatar}`)
            }
        }

        //Cut size if username or email is too long 
        checkSize()
    } else
        console.log('Error getting user object from the ipc renderer');
}

displayUser()


/**
 * 
 * Page events
 * 
 */


/**
 * Clock of the application 
 */
setInterval(function () {
    var date = new Date()
    $('#app-clock').html(`${('0'+date.getHours()).slice(-2)}:${('0'+date.getMinutes()).slice(-2)}:${('0'+date.getSeconds()).slice(-2)}`)
}, 1000);


/* Switch between tools */
var toolButtons = $('.tool');
var tools = $('.tool-element');
$('.tool').on("click", function () {
    for (var i = 0; i < toolButtons.length; i++) {
        if (toolButtons[i] != $(this)[0]) {
            toolButtons[i].className = "tool"
            if (tools[i]) {
                $(tools[i]).fadeOut(500)
                tools[i].display = "none"
            }
        } else {
            toolButtons[i].className = "tool active"
            if (tools[i]) {
                if (tools[i].className.includes("discord-tools") && !store.get("disclaimerDisplay")) {
                    $('#disclaimer').fadeIn(1000)
                }
                $(tools[i]).fadeIn(500)
                tools[i].display = ""
            }
        }
    }
})

/* Switch between profile(s) */
$('.elt .img-div').on("click", (e) => {
    $('.elt .img-div').removeClass('selected')
    e.currentTarget.className += " selected"
})

$('img').each((_, e) => $(e).attr('draggable', false))

/* Switch between settings page in each tool */
var {
    settingsShowBrowser,
    settingsShowAccount,
    accountsShowCaptcha,
    profilesSupremeSignup
} = false;


/**
 * Spoofer Browser 
 */
$('#spoofer-browser-settings').on("click", (e) => {
    if (settingsShowBrowser) {
        $('#spoofBrowserBody .settingsPart').fadeOut(300)
        $('#spoofBrowserBody .table-tasks').fadeIn(300)
    } else {
        $('#spoofBrowserBody .table-tasks').fadeOut(300)
        $('#spoofBrowserBody .settingsPart').fadeIn(300)
    }
    settingsShowBrowser = !settingsShowBrowser
})
/**
 * Account generator 
 */
$('#account-generator-settings').on("click", (e) => {
    if (settingsShowAccount) {
        $('#accountGenBody .settingsPart').fadeOut(300)
        $('#accountGenBody .table-tasks').fadeIn(300)
    } else {
        $('#accountGenBody .table-tasks').fadeOut(300)
        $('#accountGenBody .settingsPart').fadeIn(300)
    }
    settingsShowAccount = !settingsShowAccount
})

/**
 * Activity generator 
 */
$('#activity-generator-accounts').on("click", (e) => {
    if (accountsShowCaptcha) {
        $('#captchaBody .manage-accounts').fadeOut(300)
        setTimeout(() => {
            $('#captchaBody .table-tasks').fadeIn(300)
        }, 400)
    } else {
        $('#captchaBody .table-tasks').fadeOut(300)
        setTimeout(() => {
            $('#captchaBody .manage-accounts').fadeIn(300)
        }, 400)
    }
    accountsShowCaptcha = !accountsShowCaptcha
})

/**
 * Supreme Signup
 */

$('#supreme-signup-profiles').on("click", (e) => {
    if (profilesSupremeSignup) {
        $('#supremeSignupBody .profiles').fadeOut(300)
        setTimeout(() => {
            $('#supremeSignupBody .table-tasks').fadeIn(300)
        }, 400)
    } else {
        $('#supremeSignupBody .table-tasks').fadeOut(300)
        setTimeout(() => {
            $('#supremeSignupBody .profiles').fadeIn(300)
        }, 400)
    }
    profilesSupremeSignup = !profilesSupremeSignup
})

/**
 * TouchBar events 
 */
ipcRenderer.on('touchBarEvent', function (event, id) {
    for (var i = 0; i < toolButtons.length; i++) {
        if (toolButtons[i] != toolButtons[id]) {
            toolButtons[i].className = "tool"
            if (tools[i]) {
                $(tools[i]).fadeOut(300)
                tools[i].display = "none"
            }
        } else {
            toolButtons[i].className = "tool active"
            if (tools[i]) {
                $(tools[i]).fadeIn(300)
                tools[i].display = ""
            }
        }
    }
});

/* Copy licence key into clipboard */
$('.copy').on("click", (e) => {
    clipboard.writeText($('.license-keyF').val())
    toast("success", "Key copied");
})

//Check size of differents extern values 
function checkSize() {
    $('.user-email').each(function (index) {
        $('.user-email')[index].innerHTML.length > 22 ? $('.user-email')[index].innerHTML = `${$('.user-email')[index].innerHTML.substr(0,22)}...` : null
    })
    $('.user-name').each(function (index) {
        $('.user-name')[index].innerHTML.length > 12 ? $('.user-name')[index].innerHTML = `${$('.user-name')[index].innerHTML.substr(0,12)}...` : null
    })
}

//Remove definitively the disclaimer 
function acceptDisclaimer() {
    store.set("disclaimerDisplay", true)
    closeDisclaimer()
}

function dismissDisclaimer() {
    document.querySelector('#tools-list > div:nth-child(5)').className = "tool"
    $('.tool-element .discord-tools').fadeOut(500)
    $('.tool-element.discord-tools').css('display', 'none')
    document.querySelector('#tools-list > div:nth-child(1)').className = "tool active"

    $('.tool-element.dashboard').fadeIn(500)
    closeDisclaimer()
}

function closeDisclaimer() {
    $('#disclaimer').fadeOut(500)
}
//Run popover(s) of the app
$("[data-toggle=popover]").popover();



/**
 * Profile Manager
 */


$('.button-div button').on("click", (element) => {
    for (let i = 0; i < $('.button-div button'); i++) {
        if ($('.button-div button')[i].classList.contains("active"))
            $('.button-div button')[i].removeClass("active")
    }

    element.target.classList.add('active')
})

const profilePart = $('.profile-edition-part');
const profilePartBtn = $('.profile-part-btn');


$('.profile-part-btn').on("click", function () {
    for (var i = 0; i < profilePartBtn.length; i++) {
        if (profilePartBtn[i] != $(this)[0]) {
            profilePartBtn[i].classList.remove("active")
            if (profilePart[i]) {
                $(profilePart[i]).fadeOut(100)
            }
        } else {
            profilePartBtn[i].classList.add("active")
            if (profilePart[i]) {
                displaySection(i)
            }
        }
    }
})

function displaySection(index) {
    setTimeout(() => {
        $(profilePart[index]).fadeIn(800)
    }, 500)
}

async function editModalInformation(title, text, buttonText, buttonColor) {
    var titleDiv = $('#modalInformationTitle');
    var textDiv = $('#modalInformationText');
    var button = $('#modalInformationBtn')

    titleDiv.html(title)
    textDiv.html(text)
    button.html(buttonText)

    button.attr('class', `global-button ${buttonColor}`);

    $('#modalInformation').modal('show')
}



