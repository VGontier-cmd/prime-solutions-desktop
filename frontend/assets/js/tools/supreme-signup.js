var signUpProfiles = []
var signUpTasks = [];

var editPageElements = [
    "editSupremeProfileProfileName",
    "editSupremeProfileName",
    "editSupremeProfileEmail",
    "editSupremeProfilePhone",
    "editSupremeProfileCountry",
    "editSupremeProfileAddress",
    "editSupremeProfileAppt",
    "editSupremeProfileZip",
    "editSupremeProfileCity",
    "editSupremeProfileState",
    "editSupremeProfileCc",
    "editSupremeProfileMonthExpiry",
    "editSupremeProfileYearExpiry",
    "editSupremeProfileCvc",
]

var addPageElements = [
    "addSupremeProfileProfileName",
    "addSupremeProfileName",
    "addSupremeProfileEmail",
    "addSupremeProfilePhone",
    "addSupremeProfileCountry",
    "addSupremeProfileAddress",
    "addSupremeProfileAppt",
    "addSupremeProfileZip",
    "addSupremeProfileCity",
    "addSupremeProfileState",
    "addSupremeProfileCc",
    "addSupremeProfileMonthExpiry",
    "addSupremeProfileYearExpiry",
    "addSupremeProfileCvc"
]

//$(document).on('ready', loadSignUpProfiles())
$(document).on('ready', loadSignUpTasks())

$(document).on('click', '.startSignup', ({
    target
}) => {
    ipcRenderer.send(
        'startSignUpTask', [
            signUpTasks.find(task => task['taskID'] == target.id.split('-')[1]),
            findProfile((signUpTasks.find(task => task['taskID'] == target.id.split('-')[1]).profile))
        ]
    )
})
$(document).on('click', '.stopSignup', ({
    target
}) => ipcRenderer.send('stopSignUpTask', target.id.split('-')[1]))

$(document).on('click', '.deleteSignup', ({
    target
}) => deleteSignUpTask(target.id.split('-')[1]))

$('#supreme-signup-startAll').on("click", () => {
    signUpTasks.forEach(task =>
        ipcRenderer.send('startSignUpTask', [
            task,
            findProfile(task.profile)
        ]))
})

$('#supreme-signup-stopAll').on("click", () => signUpTasks.forEach(({
    taskID
}) => ipcRenderer.send('stopSignUpTask', taskID)))

$('#supreme-signup-deleteAll').on("click", () => {
    deleteAllSignUpTasks()
})

$('#createSupremeSignupTask').on("click", () => {
    createSignUpTask()
});

/*
 *
 * TASKS METHODS MANAGER
 * 
 */

ipcRenderer.on('updateSignUpStatus', (e, {
    taskID,
    status,
    type
}) => {
    $(`#signupStatus-${taskID}`).removeClass().addClass(type).html(status)
})


function loadSignUpTasks() {
    const tasks = store.get('signUpTasks');
    if (!tasks || !tasks.length) return;

    for (let task of tasks) {
        $('#supremeTbody').append(`
            <tr data-id="${task['taskID']}">
                <td class="signup-id">${task['taskID']}</td>
                <td class="signup-store">${getStoreLocation(task['store_location'])}</td>
                <td class="signup-profile">${task['profile']}</td>
                <td class="signup-gmailAccount">${task['gmailAccount'] ? task['gmailAccount'] : " None" }</td>
                <td class="signup-proxy">${task['proxy'] ? task['proxy'] : 'None'}</td>
                <td class="signup-status">
                    <p id="signupStatus-${task['taskID']}" class="waiting">Idle</p>
                </td>
                <td class="signup-actions">
                <i class="fas fa-play startSignup" id="startSignup-${task['taskID']}" draggable="false"></i>
                <i class="fas fa-stop stopSignup" id="stopSignup-${task['taskID']}" draggable="false"></i>
                <i class="fas fa-trash deleteSignup" id="deleteSignup-${task['taskID']}" draggable="false"></i>
                </td>
            </tr>
        `)
    };
    signUpTasks = tasks;
    $('#tasksNumberSupreme').html(signUpTasks.length)
};


async function createSignUpTask() {
    fields = [
        "addSupremeTask-storeLocation",
        "addSupremeTask-profile",
        "addSupremeTask-gmail",
        "addSupremeTask-proxy",
        "addSupremeTask-speProxy",
        "addSupremeTask-qty"
    ]

    for (var field of fields) {
        switch (field) {
            case 'addSupremeTask-profile':
                if (await verifyProfile($("#addSupremeTask-profile").val()) == -1)
                    return
                break;
            case 'addSupremeTask-qty':
                var number = $("#addSupremeTask-qty").val()
                if (Number.isInteger(number) && number >= 1 && number <= 50)
                    return toast('error', 'Invalid task quantity')
                break;
            default:
                break;
        }
    }

    const proxies = $('#addSupremeTask-proxy').val() !== 'localhost' ? ipcRenderer.sendSync('getProxies', $('#addSupremeTask-proxy').val()) : null;
    for (var i = 0; i < $("#addSupremeTask-qty").val(); i++) {
        const newTask = {
            taskID: generateID(),
            store_location: $('#addSupremeTask-storeLocation').val(),
            proxy: proxies ? proxies[~~(Math.random() * proxies.length)] : null,
            gmailAccount: $('#addSupremeTask-gmail').val() == 'none' ? null : $('#addSupremeTask-gmail').val(),
            profile: $("#addSupremeTask-profile").val()
        };

        if (signUpTasks.find(task => task.taskID == newTask['taskID'])) {
            newTask.taskID = generateID()
        }
        signUpTasks.push(newTask)

        $('#supremeTbody').append(`
                <tr data-id="${newTask['taskID']}">
                    <td class="signup-id">${newTask['taskID']}</td>
                    <td class="signup-store">${getStoreLocation(newTask['store_location'])}</td>
                    <td class="signup-profile">${newTask['profile']}</td>
                    <td class="signup-gmailAccount">${newTask['gmailAccount'] ? newTask['gmailAccount'] : " None" }</td>
                    <td class="signup-proxy">${newTask['proxy'] ? newTask['proxy'] : 'None'}</td>
                    <td class="signup-status">
                        <p id="signupStatus-${newTask['taskID']}" class="waiting">Idle</p>
                    </td>
                    <td class="signup-actions">
                        <i class="fas fa-play startSignup" id="startSignup-${newTask['taskID']}" draggable="false"></i>
                        <i class="fas fa-stop stopSignup" id="stopSignup-${newTask['taskID']}" draggable="false"></i>
                        <i class="fas fa-trash deleteSignup" id="deleteSignup-${newTask['taskID']}" draggable="false"></i>
                    </td>
                </tr>
            `)

        store.set('signUpTasks', signUpTasks)
        $('#tasksNumberSupreme').html(signUpTasks.length)
    }
};


function deleteSignUpTask(taskID) {
    const task = signUpTasks.find(task => task['taskID'] == taskID);

    if (!task) return toast('error', 'Error while deleting task');

    signUpTasks.splice(signUpTasks.indexOf(task), 1);
    store.set('signUpTasks', signUpTasks)
    $(`[data-id=${taskID}]`).remove();

    ipcRenderer.send('stopSignupTask', taskID)

    $('#tasksNumberSupreme').html(signUpTasks.length)
}

function deleteAllSignUpTasks() {
    store.set('signUpTasks', [])
    signUpTasks.forEach(task => {
        ipcRenderer.send('stopSignupTask', task['taskID'])
        $(`[data-id=${task['taskID']}]`).remove();
    })
    signUpTasks.splice(0, signUpTasks.length)
    $('#tasksNumberSupreme').html(0)
}

function getStoreLocation(idStore) {
    switch (idStore) {
        case "london":
            return "London";
        case "la":
            return "Los Angeles";
        case "paris":
            return "Paris";
        case "brooklyn":
            return "Brooklyn";
        case "manhattan":
            return "Manhattan";
        case "sf":
            return "San Francisco";
        default:
            return "Store undefined";
    }
}


async function verifyProfile(profileName) {
    var profile = findProfile(profileName)
    try {
        var profileValues = {
            "First Name": profile.billing.first_name,
            "Last Name": profile.billing.last_name,
            "Address": profile.billing.address,
            "Zip Code": profile.billing.zip,
            "Phone Number": profile.billing.phone,
            "State": profile.billing.state,
            "Country": profile.billing.country,
            "City": profile.billing.city,
            "Email": profile.billing.email,
            "Card Holder": profile.payment.card_holder,
            "Card Number": profile.payment.card_number,
            "Expiration Month": profile.payment.expiration_month,
            "Expiration Year": profile.payment.expiration_year,
            "Card CVV/CVC": profile.payment.card_cvv
        }
    } catch (error) {}

    if (!profile) {
        toast("error", "Error when trying to retrieve your profile");
        return -1;
    }

    var missingElements = [];

    for (field in profileValues) {
        if (!profileValues[field] || profileValues[field].length == 0) {
            console.log(field)
            missingElements.push(field)
        }
    }
    if (await missingElements.length == 0) {
        return profile
    } else {
        var content = 'Missing element(s) : <br>';
        for (element of missingElements) {
            content += `- ${element} <br>`
        }
        editModalInformation("Missing elements in your profile", content, "Ok", "green")
        return -1;
    }
}