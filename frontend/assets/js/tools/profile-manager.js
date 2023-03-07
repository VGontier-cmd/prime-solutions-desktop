//Global vars
//Date
var today = new Date();
var dateDay = String(today.getDate()).padStart(2, '0');
var dateMonth = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var dateYear = today.getFullYear();
var dateToday = `${dateDay}/${dateMonth}/${dateYear}`
//Converter methods
const converter = remote.require('./frontend/assets/js/tools/profile-converter.js')
//uuid object generator
var {
    machineIdSync
} = require('node-machine-id');
const deviceID = machineIdSync();

//lookup for country iso and name
const lookup = require('country-code-lookup');
//profile var
var globalProfiles = []
const sensitiveInfos = [
    'profile_name',
    'first_name',
    'last_name',
    'address',
    'zip',
    'city',
    'country',
    'country_code',
    'card_holder',
    'card_number',
    'expiration_month',
    'expiration_year',
    'card_cvv',
    'checkout_limit'
]

$(document).on('ready', loadProfiles())
$('#createNewProfile').on('click', () => createProfile())
$('#profileManagerSave').on('click', () => saveProfile($('.profile-edition').data("id")))
$('#profileManageDelete').on('click', () => deleteProfile($('.profile-edition').data("id")))
$('#profile-manager-import').on('click', () => ipcRenderer.sendSync('importProfile', null))
$('#exportSelectionType').on('click', () => exportProfile($('#profile-manager-export-type-select').val()))

async function loadProfiles() {
    var profiles = store.get('profiles');
    if (!profiles || !profiles.length) return;

    $('#profileDisplay').html('');

    for (let profile of profiles) {
        $('#profileDisplay').append(`
            <li>
                <div class="profile-card" data-id="${profile.profile_settings.profile_name}" onclick="displayProfile(this)">
                    <div class="card-logo">
                        <img src="../assets/img/PS_Logo/Recurso_1.png">
                    </div>
                    <div class='profile-infos'>
                        <div class="profile-name">
                            <p class="profile-name-field">${profile.profile_settings.profile_name}</p>
                        </div>
                        <div class="profile-display">
                            <div class="full-name">
                                <p class="full-name-title">Full name</p>
                                <p class="full-name-field">${(profile.payment.card_holder) ? profile.payment.card_holder : "Prime Solutions"}</p>
                            </div>
                            <div class="card-ending">
                                <p class="card-ending-title">Card Ending</p>
                                <p class="card-ending-field">${(profile.payment.card_number) ? profile.payment.card_number.substring(12,16) : "0000"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        `)
        $(`[data-id="${profile.profile_settings.profile_name}"]`).css("background", `linear-gradient(${profile.options.gradient_color_1},${profile.options.gradient_color_2})`)
    };

    globalProfiles = await profiles;
    checkDisplayElementsSize()
    displayProfileInput()
}


async function displayProfile(element) {
    var profile = globalProfiles.find(profile => profile.profile_settings.profile_name == $(element).data('id'));
    if (!profile) return toast("error", "Error when trying to load the selected profile");

    //Edit the display card infos
    $('#display-profile-name-field').text(profile.profile_settings.profile_name)
    $('.profile-edition').data("id", profile.profile_settings.profile_name)
    $('#display-full-name-field').text((profile.payment.card_holder) ? (profile.payment.card_holder) : "Prime Solutions")
    $('#display-ending-field').text((profile.payment.card_number) ? profile.payment.card_number.substring(12, 16) : "0000");
    //And colors 
    $('#display-card').css({
        background: $(element).css("background")
    })

    checkDisplayElementsSize()


    //Retrieve all the informations in the fields 
    var inputID = [
        '.profile-first-name',
        '.profile-last-name',
        '.profile-address',
        '.profile-address-2',
        '.profile-zip-code',
        '.profile-telephone',
        '.profile-state',
        '.profile-state-code',
        '.profile-country',
        '.profile-city',
        '.profile-email',
        '.profile-card-holder',
        '.profile-card-number',
        '.profile-card-expiry-month',
        '.profile-card-expiry-year',
        '.profile-card-cvv',
        '.profile-paypal-email',
        '.profile-paypal-password',
        '.profile-checkout-limit'
    ]

    var profileValues = [
        profile.billing.first_name,
        profile.billing.last_name,
        profile.billing.address,
        profile.billing.address_2,
        profile.billing.zip,
        profile.billing.phone,
        profile.billing.state,
        profile.billing.state_code,
        profile.billing.country_code,
        profile.billing.city,
        profile.billing.email,
        profile.payment.card_holder,
        profile.payment.card_number,
        profile.payment.expiration_month,
        profile.payment.expiration_year,
        profile.payment.card_cvv,
        profile.paypal.email,
        profile.paypal.password,
        profile.options.checkout_limit
    ]

    for (let i = 0; i < inputID.length; i++) {
        (profileValues[i] && profileValues.length > 0) ? $(`${inputID[i]} input, ${inputID[i]} select`).val(profileValues[i]): $(`${inputID[i]} input, ${inputID[i]} select`).val('')
    }
}

async function createProfile() {

    console.log($("#profile-manager-profile-name").val())
    if ($("#profile-manager-profile-name").val() && $("#profile-manager-profile-name").val().length > 0) {
        var newGradient = getRandomGradient();
        var newProfile = {
            "profile_settings": {
                "profile_name": String($("#profile-manager-profile-name").val()).toLowerCase().replace(/\s\s+/g, ' ').replace(/ /g, "_"),
                "profile_id": null
            },
            "billing": {
                "phone": null,
                "email": null,
                "first_name": null,
                "last_name": null,
                "address": null,
                "address_2": null,
                "address_3": null,
                "zip": null,
                "city": null,
                "province": null,
                "state": null,
                "state_code": null,
                "country": null,
                "country_code": null,
                "area": null
            },
            "payment": {
                "card_holder": null,
                "card_number": null,
                "expiration_month": null,
                "expiration_year": null,
                "card_cvv": null,
                "card_type": null
            },
            "paypal": {
                "email": null,
                "password": null
            },
            "options": {
                "device_id": deviceID,
                "billing_same": true,
                "date": dateToday,
                "checkout_limit": null,
                "one_checkout": null,
                "gradient_color_1": newGradient[0],
                "gradient_color_2": newGradient[1]
            }
        }

        if (globalProfiles.find(profile => profile.profile_settings.profile_name == newProfile.profile_settings.profile_name) || newProfile.profile_settings.profile_name == "Prime_Solutions_Profile") return toast("error", "Profile name already used !")
        globalProfiles.push(newProfile)

        $('#profileDisplay').append(`
                <li>
                    <div class="profile-card" data-id="${newProfile.profile_settings.profile_name}" onclick="displayProfile(this)">
                        <div class="card-logo">
                            <img src="./assets/img/PS_Logo/Recurso_1.png">
                        </div>
                        <div class='profile-infos'>
                            <div class="profile-name">
                                <p class="profile-name-field">${newProfile.profile_settings.profile_name}</p>
                            </div>
                            <div class="profile-display">
                                <div class="full-name">
                                    <p class="full-name-title">Full name</p>
                                    <p class="full-name-field">${(newProfile.payment.card_holder) ? newProfile.payment.card_holder : "Prime Solutions"}</p>
                                </div>
                                <div class="card-ending">
                                    <p class="card-ending-title">Card Ending</p>
                                    <p class="card-ending-field">${(newProfile.payment.card_number) ? newProfile.payment.card_number.substring(12,16) : "0000"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            `)
        $(`[data-id="${newProfile.profile_settings.profile_name}"]`).css("background", `linear-gradient(${newProfile.options.gradient_color_1},${newProfile.options.gradient_color_2})`)
        store.set('profiles', globalProfiles)
        displayProfileInput()
    }


}

async function saveProfile(profileID) {
    var profile = await findProfile(profileID)
    var index = globalProfiles.indexOf(profile);

    profile = {
        "profile_settings": {
            "profile_name": profileID,
            "profile_id": null
        },
        "billing": {
            "phone": $('.profile-telephone input').val(),
            "email": $('.profile-email input').val(),
            "first_name": $('.profile-first-name input').val(),
            "last_name": $('.profile-last-name input').val(),
            "address": $('.profile-address input').val(),
            "address_2": $('.profile-address-2 input').val(),
            "address_3": null,
            "zip": $('.profile-zip-code input').val(),
            "city": $('.profile-city input').val(),
            "province": null,
            "state": $('.profile-state input').val(),
            "state_code": $('.profile-state-code input').val(),
            "country": $('.profile-country select option:selected').text(),
            "country_code": $('.profile-country select').val(),
            "area": null
        },
        "payment": {
            "card_holder": $('.profile-card-holder input').val(),
            "card_number": $('.profile-card-number input').val(),
            "expiration_month": $('.profile-card-expiry-month select').val(),
            "expiration_year": $('.profile-card-expiry-year select').val(),
            "card_cvv": $('.profile-card-cvv input').val(),
            "card_type": converter.getCardType($('.profile-card-number input').val())
        },
        "paypal": {
            "email": $('.profile-paypal-email input').val(),
            "password": $('.profile-paypal-password input').val()
        },
        "options": {
            "device_id": deviceID,
            "billing_same": true,
            "date": dateToday,
            "checkout_limit": $('.profile-checkout-limit input').val(),
            "one_checkout": null,
            "gradient_color_1": profile.options.gradient_color_1,
            "gradient_color_2": profile.options.gradient_color_2
        }
    }
    if (index !== -1) {
        globalProfiles[index] = await profile;
        store.set('profiles', globalProfiles)
        toast("success", "Profile saved successfully !")
        displayProfile($(`[data-id="${profileID}"]`))
        loadProfiles()
        displayProfileInput()
        checkDisplayElementsSize()
    } else
        toast("error", "Error when trying to save the profile")
}


function findProfile(profileName) {
    return globalProfiles.find(profile => profile.profile_settings.profile_name == profileName)
}

async function deleteProfile(profileID) {
    console.log(profileID)
    const profile = await findProfile(profileID)
    if (!profile) return toast('error', 'Error while deleting profile');

    globalProfiles.splice(globalProfiles.indexOf(profile), 1);
    store.set('profiles', globalProfiles)
    $(`[data-id="${profileID}"]`).parent().remove();

    defaultDisplay()
    displayProfileInput()
}


async function defaultDisplay() {
    $('#display-profile-name-field').text("Prime_Solutions_Profile")
    $('.profile-edition').data("id", "-1")
    $('#display-full-name-field').text("Prime Solutions")
    $('#display-ending-field').text("0000");
    //And colors 
    $('#display-card').css({
        background: "linear-gradient(rgb(224, 102, 21), purple)"
    })

    checkDisplayElementsSize()
}


async function displayProfileInput() {
    //remove all options
    $('.global-profile-select option').remove()
    //Add profiles options 
    globalProfiles.forEach(profile => {
        $('.global-profile-select').append(`
            <option value="${profile.profile_settings.profile_name}">${profile.profile_settings.profile_name}</option>
        `)
    })
}

function getRandomGradient() {
    var gradientsTab = [
        ['#EC6F66', '#F3A183'],
        ['#2193b0', '#6dd5ed'],
        ['#1488CC', '#2B32B2'],
        ['#DA22FF', '#9733EE'],
        ['#4776E6', '#8E54E9'],
        ['#FF8008', '#FFC837'],
        ['#EB3349', '#F45C43'],
        ['#000000', '#434343']
    ]
    return gradientsTab[Math.floor(Math.random() * 8)];
}

async function checkDisplayElementsSize() {
    if ($('#display-profile-name-field').text().length > 20)
        $('#display-profile-name-field').text(`${$('#display-profile-name-field').text().substring(0,20)}...`)
    if ($('#display-full-name-field').text().length > 18)
        $('#display-full-name-field').text(`${$('#display-full-name-field').text().substring(0,18)}...`)

    $('.profile-card .profile-name-field').each(function (index) {
        if ($(this).text().length > 20)
            $(this).text(`${$(this).text().substring(0,15)}...`)
    })

    $('.profile-card .full-name-field').each(function (index) {
        if ($(this).text().length > 18)
            $(this).text(`${$(this).text().substring(0,15)}...`)
    })
}

async function importExternalProfile(profileFile) {
    $('#modalProfileManagerImportSelection').modal("show");
    $('#importSelectionType').on("click", () => {
        convertImportedProfile(profileFile, $('#profile-manager-import-type').val())
    })
}

ipcRenderer.on('returnImportedProfile', (event, arg) => {
    try {
        (Array.isArray(arg[0])) ? importExternalProfile(arg[0]): importExternalProfile(JSON.parse(arg[0]))
    } catch (error) {
        alert("Erreur : " + error)
    }
})

async function convertImportedProfile(profile, profileType) {
    var profileTemplate;
    switch (profileType) {
        case "Adept":
            break;
        case "AIOMoji":
            profileTemplate = converter.fromAIOMoji(profile)
            break;
        case "ANB":
            profileTemplate = converter.fromANB(profile);
            break;
        case "ArcAIO":
            profileTemplate = converter.fromArc(profile);
            break;
        case "Balko":
            profileTemplate = converter.fromBalko(profile)
            break;
        case "Cybersole":
            profileTemplate = converter.fromCybersole(profile)
            break;
        case "Eve":
            break;
        case "ECB":
            profileTemplate = converter.fromECB(profile);
            break;
        case "F3ather":
            profileTemplate = converter.fromF3ather(profile);
            break;
        case "FlareAIO":
            profileTemplate = converter.fromFlareAIO(profile);
            break;
        case "FleekFramework":
            profileTemplate = converter.fromFleek(profile);
            break;
        case "Ganesh":
            profileTemplate = converter.fromGanesh(profile);
            break;
        case "Hawk":
            profileTemplate = converter.fromHawk(profile);
            break;
        case "Kodai":
            profileTemplate = converter.fromKodai(profile);
            break;
        case "Kylin":
            profileTemplate = converter.fromKylin(profile);
            break;
        case "MangoPreme":
            profileTemplate = converter.fromMangoPreme(profile);
            break;
        case "Mek":
            profileTemplate = converter.fromMek(profile)
            break;
        case "Nova":
            profileTemplate = converter.fromNova(profile)
            break;
        case "NSB":
            profileTemplate = converter.fromNsb(profile)
            break;
        case "Phantom":
            profileTemplate = converter.fromPhantom(profile)
            break;
        case "Phasma":
            profileTemplate = converter.fromPhasma(profile);
            break;
        case "Polaris":
            profileTemplate = converter.fromPolaris(profile);
            break;
        case "Prism":
            profileTemplate = converter.fromPrism(profile);
            break;
        case "Project Destroyer":
            profileTemplate = converter.fromProjectDestroyer(profile)
            break;
        case "QBot":
            profileTemplate = converter.fromQBot(profile)
            break;
        case "Sole":
            profileTemplate = converter.fromSole(profile)
            break;
        case "SoleSneakers":
            profileTemplate = converter.fromSoleSneakers(profile)
            break;
        case "SplashForce":
            profileTemplate = converter.fromSplashForce(profile);
            break;
        case "Tohru":
            profileTemplate = converter.fromTohru(profile)
            break;
        case "TKS":
            profileTemplate = converter.fromTks(profile)
            break;
        case "TSB":
            profileTemplate = converter.fromTsb(profile)
            break;
        case "Velox":
            profileTemplate = converter.fromVelox(profile)
            break;
        case "ZephyrAIO":
            profileTemplate = converter.fromZephyr(profile);
            break;
        default:
            break;
    }

    for (profile of await profileTemplate) {
        verifyFields(await profile, profileType)
        var cpt = 0;
        while (findProfile(profile.profile_settings.profile_name)) {
            console.log(profile.profile_settings.profile_name)
            profile.profile_settings.profile_name += (cpt++)
        }
        globalProfiles.push(profile)
        $('#profileDisplay').append(`
            <li>
                <div class="profile-card" data-id="${profile.profile_settings.profile_name}" onclick="displayProfile(this)">
                    <div class="card-logo">
                        <img src="./assets/img/PS_Logo/Recurso_1.png">
                    </div>
                    <div class='profile-infos'>
                        <div class="profile-name">
                            <p class="profile-name-field">${profile.profile_settings.profile_name}</p>
                        </div>
                        <div class="profile-display">
                            <div class="full-name">
                                <p class="full-name-title">Full name</p>
                                <p class="full-name-field">${(profile.payment.card_holder) ? profile.payment.card_holder : "Prime Solutions"}</p>
                            </div>
                            <div class="card-ending">
                                <p class="card-ending-title">Card Ending</p>
                                <p class="card-ending-field">${(profile.payment.card_number) ? profile.payment.card_number.substring(12,16) : "0000"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        `)
        var color = getRandomGradient();
        profile.options.gradient_color_1 = await color[0]
        profile.options.gradient_color_2 = await color[1]
        $(`[data-id="${profile.profile_settings.profile_name}"]`).css("background", `linear-gradient(${color[0]},${color[1]})`)
        store.set("profiles", globalProfiles)
    }
}


async function exportProfile(profile_type) {
    //Get profile_names and check size 
    console.log(typeof $('#profile-manager-export-profile-select').val() == "object")
    var profile_names = (typeof $('#profile-manager-export-profile-select').val() == "object") ? $('#profile-manager-export-profile-select').val() : [$('#profile-manager-export-profile-select').val()]
    if (await profile_names.length == 0) return toast('No profiles were selected !')
    //initialize the profiles object
    var profiles = []
    //Get each profile for profile name
    profile_names.forEach(function (profile_name) {
        if (!findProfile(profile_name))
            return toast('error', 'Error when trying to retrieve one of your profile informations : ' + profile_name)
        else {
            profiles.push(findProfile(profile_name))
        }
    })

    //Check for each profile if required informations are in 
    for await (var profile of profiles) {
        for (var field in profile) {
            for (var field_2 in profile[field]) {
                for (var i = 0; i < sensitiveInfos.length; i++) {
                    if (field_2 == sensitiveInfos[i])
                        if (profile[field][field_2] == null || profile[field][field_2].replace(/\s/g, '').length == 0) {
                            console.log(field_2)
                            return toast("error", `Your profile ${profile.profile_settings.profile_name} can't be exported due to missing required informations `)
                        }
                }
            }
        }
    }

    //Initialize the convertedProfile var to send
    var convertedProfiles;
    //convert to the selected bot
    try {
        switch (await profile_type) {
            case "Adept":
                break;
            case "AIOMoji":
                convertedProfiles = converter.toAIOMoji(await profiles)
                break;
            case "ANB":
                break;
            case "ArcAIO":
                convertedProfiles = converter.toArc(await profiles)
                break;
            case "Balko":
                convertedProfiles = converter.toBalko(await profiles)
                break;
            case "Cybersole":
                convertedProfiles = converter.toCybersole(await profiles)
                break;
            case "Eve":
                break;
            case "ECB":
                convertedProfiles = converter.toECB(await profiles)
                break;
            case "F3ather":
                convertedProfiles = converter.toF3ather(await profiles)
                break;
            case "FlareAIO":
                convertedProfiles = converter.toFlareAIO(await profiles)
                break;
            case "FleekFramework":
                convertedProfiles = converter.toFleek(await profiles)
                break;
            case "Ganesh":
                convertedProfiles = converter.toGanesh(await profiles)
                break;
            case "Hawk":
                convertedProfiles = converter.toHawk(await profiles)
                break;
            case "Kodai":
                convertedProfiles = converter.toKodai(await profiles)
                break;
            case "Kylin":
                convertedProfiles = converter.toKylin(await profiles)
                break;
            case "MangoPreme":
                convertedProfiles = converter.toMangoPreme(await profiles)
                break;
            case "Mek":
                convertedProfiles = converter.toMek(await profiles)
                break;
            case "Nova":
                convertedProfiles = converter.toNova(await profiles)
                break;
            case "NSB":
                convertedProfiles = converter.toNsb(await profiles)
                break;
            case "Phantom":
                convertedProfiles = converter.toPhantom(await profiles)
                break;
            case "Phasma":
                convertedProfiles = converter.toPhasma(await profiles)
                break;
            case "Polaris":
                convertedProfiles = converter.toPolaris(await profiles)
                break;
            case "Prism":
                convertedProfiles = converter.toPrism(await profiles)
                break;
            case "Project Destroyer":
                convertedProfiles = converter.toProjectDestroyer(await profiles)
                break;
            case "QBot":
                convertedProfiles = converter.toQBot(await profiles)
                break
            case "Sole":
                convertedProfiles = converter.toSole(await profiles)
                break;
            case "SoleSneakers":
                convertedProfiles = converter.toSoleSneakers(await profiles)
                break;
            case "SplashForce":
                convertedProfiles = converter.toSplashForce(await profiles)
                break;
            case "TKS":
                convertedProfiles = converter.toTks(await profiles)
                break;
            case "Tohru":
                convertedProfiles = converter.toTohru(await profiles)
                break;
            case "TSB":
                convertedProfiles = converter.toTsb(await profiles)
                break;
            case "Velox":
                convertedProfiles = converter.toVelox(await profiles)
                break;
            default:
                break;
        }
    } catch (error) {
        console.log(error)
        console.log(convertedProfiles)
    }

    ipcRenderer.sendSync('saveProfileConverter', [await convertedProfiles, converter.isCSV(profile_type)])

}

function verifyFields(profile, profileType) {

    //browse all the json to remove empty strings and convert numbers to string
    for (var field in profile) {
        if (typeof profile[field] == "object")
            for (var field_2 in profile[field]) {
                profile[field][field_2] = (profile[field][field_2] && profile[field][field_2].length > 0) ? profile[field][field_2].toString() : null
            }
        else
            profile[field] = (profile[field] && profile[field].length > 0) ? profile[field].toString() : null
    }

    console.log(profile)

    //Infos to verify to convert to the Prime Solutions standard profile
    var sensitiveInfos = {
        "profile_name": profile.profile_settings.profile_name,
        "country": profile.billing.country,
        "country_code": profile.billing.country_code,
        "card_holder": profile.payment.card_holder,
        "card_number": profile.payment.card_number,
        "expiration_month": profile.payment.expiration_month,
        "expiration_year": profile.payment.expiration_year,
        "card_type": profile.payment.card_type,
        "one_checkout": profile.options.one_checkout
    }
    
    if(profile.payment.expiration_month == profile.payment.expiration_year){
        profile.payment.expiration_month = profile.payment.expiration_month.replace(/\s+/g, '').split("/")[0]
        profile.payment.expiration_year = profile.payment.expiration_year.replace(/\s+/g, '').split("/")[1]
    }
       

    for (var info in sensitiveInfos) {
        switch (info) {
            case "profile_name":
                if (!profile.profile_settings.profile_name) {
                    let cpt = 0
                    do {
                        profile.profile_settings.profile_name == `${profileType}_profile_${cpt++}`
                    } while (findProfile(profile.profile_settings.profile_name))
                }
                break;
            case "country":
                if (!profile.billing.country) {
                    if (profile.billing.country_code)
                        profile.billing.country = lookup.byIso(profile.billing.country_code).country
                }
                break;
            case "country_code":
                if (!profile.billing.country_code) {
                    if (profile.billing.country)
                        profile.billing.country_code = lookup.byCountry(profile.billing.country).iso2
                }
                break;
            case "card_holder":
                if (profile.payment.card_holder) {
                    if (profile.billing.first_name && profile.billing.last_name)
                        profile.payment.card_holder = `${profile.billing.first_name} ${profile.billing.last_name}`
                }
                break;
            case "card_number":
                if (profile.payment.card_number) {
                    profile.payment.card_number = profile.payment.card_number.replace(/\s+/g, '')
                    console.log(profile.payment.card_number)
                }
                break;
            case "expiration_month":
                if (profile.payment.expiration_month) {
                    if (profile.payment.expiration_month.length == 1)
                        profile.payment.expiration_month = `0${profile.payment.expiration_month}`
                }
                break;
            case "expiration_year":
                if (profile.payment.expiration_year) {
                    if (profile.payment.expiration_year.length == 2 ){
                        profile.payment.expiration_year = `20${profile.payment.expiration_year}`
                    }
                }
                break;
            case "card_type":
                if (profile.payment.card_number)
                    profile.payment.card_type = converter.getCardType(profile.payment.card_number)
                break;
            case "one_checkout":
                if (profile.options.one_checkout) {
                    profile.options.checkout_limit = profile.options.one_checkout
                }
                break;
        }
    }

}