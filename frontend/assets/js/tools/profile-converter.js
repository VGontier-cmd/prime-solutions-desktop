/*//uuid object generator
var {
    machineIdSync
} = require('node-machine-id');
const deviceID = machineIdSync();

//Drag and drop
var dragFileContent = null;
var dragFileElement = document.getElementById('drag-and-drop')

//Date 
var today = new Date();
var dateDay = String(today.getDate()).padStart(2, '0');
var dateMonth = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var dateYear = today.getFullYear();
var null = `${dateDay}/${dateMonth}/${dateYear}`

//CountryCodes
const lookup = require('country-code-lookup')

//Send the pick-a-file event to display the dialog
$('#pick-a-file').on("click", (e) => {
    ipcRenderer.sendSync('takeFile', null);
});

//Drag and Drop part
dragFileElement.addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length == 1) {
        ipcRenderer.send('ondragstart', e.dataTransfer.files[0].path)
        displayFileInformations(e.dataTransfer.files[0].path)
    }
})
//Remove propagation when the drag is over
dragFileElement.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation()
});


function displayFileInformations(filepath) {
    $('#drag-and-drop .content-drag').fadeOut("slow")
    $('#drag-and-drop .content-file').fadeIn("slow");
    $('#drag-and-drop .content-file .file-name').html(filepath.split("/")[filepath.split("/").length - 1])
}

function displayDragAndDropInformation() {
    $('#drag-and-drop .content-file').fadeOut("slow");
    $('#drag-and-drop .content-drag').fadeIn("slow");
}

//Receive file content from the backend 
ipcRenderer.on('returnDragFile', (event, arg) => {
    try {
        (Array.isArray(arg[0])) ? dragFileContent = arg[0] : dragFileContent = JSON.parse(arg[0])
        if (arg[1]) displayFileInformations(arg[1])
    } catch (error) {w
        alert("Erreur : " + error)
    }
})

$('.convert #cancel-button').on("click", (e) => {
    displayDragAndDropInformation()
})

//Call when the user click on the convert button
$('#convert-button').on("click", (e) => {
    var fromProfile = $('#profile-from-select option:selected').val()
    if ($('.elt .selected')[0]) {
        var toProfile = $('.elt .selected')[0].dataset.desc
        if (dragFileContent != null /*&& fromProfile != toProfile*/
/*) {
            try {
                (fromProfile != toProfile) ? convertProfile(fromProfile, toProfile): toast('error', 'Both bots can\'t be the same')
            } catch (error) {
                toast('error', 'An error has occurred, details : ' + error)
            }
        } else {
            return toast('error', 'Please add a profile before converting')
        }
    } else
        return toast('error', 'Please select a second bot to convert your profile')
})

//Convert profile(s) Function
convertProfile : async function(fromProfile, toProfile) {

    var profileTemplate;
    var fileFinal;
    //get the template profile fill 
    switch (fromProfile) {
        case "Adept":
            break;
        case "AIOMoji":
            profileTemplate = fromAIOMoji()
            break;
        case "ANB":
            profileTemplate = fromANB();
            break;
        case "ArcAIO":
            profileTemplate = fromArc();
            break;
        case "Balko":
            profileTemplate = fromBalko()
            break;
        case "Cybersole":
            profileTemplate = fromCybersole()
            break;
        case "Eve":
            break;
        case "ECB":
            profileTemplate = fromECB();
            break;
        case "F3ather":
            profileTemplate = fromF3ather();
            break;
        case "FlareAIO":
            profileTemplate = fromFlareAIO();
            break;
        case "FleekFramework":
            profileTemplate = fromFleek();
            break;
        case "Ganesh":
            profileTemplate = fromGanesh();
            break;
        case "Hawk":
            profileTemplate = fromHawk();
            break;
        case "Kodai":
            profileTemplate = fromKodai();
            break;
        case "Kylin":
            profileTemplate = fromKylin();
            break;
        case "MangoPreme":
            profileTemplate = fromMangoPreme();
            break;
        case "Mek":
            profileTemplate = fromMek()
            break;
        case "Nova":
            profileTemplate = fromNova()
            break;
        case "NSB":
            profileTemplate = fromNsb()
            break;
        case "Phantom":
            profileTemplate = fromPhantom()
            break;
        case "Phasma":
            profileTemplate = fromPhasma();
            break;
        case "Polaris":
            profileTemplate = fromPolaris();
            break;
        case "Prism":
            profileTemplate = fromPrism();
            break;
        case "Project Destroyer":
            profileTemplate = fromProjectDestroyer()
            break;
        case "QBot":
            profileTemplate = fromQBot()
            break;
        case "Sole":
            profileTemplate = fromSole()
            break;
        case "SoleSneakers":
            profileTemplate = fromSoleSneakers()
            break;
        case "SplashForce":
            profileTemplate = fromSplashForce();
            break;
        case "Tohru":
            profileTemplate = fromTohru()
            break;
        case "TKS":
            profileTemplate = fromTks()
            break;
        case "TSB":
            profileTemplate = fromTsb()
            break;
        case "Velox":
            profileTemplate = fromVelox()
            break;
        case "ZephyrAIO" :
            profileTemplate = fromZephyr();
            break;
        default:
            break;
    }

    switch (toProfile) {
        case "Adept":
            break;
        case "AIOMoji":
            fileFinal = toAIOMoji(await profileTemplate)
            break;
        case "ANB":
            break;
        case "ArcAIO":
            fileFinal = toArc(await profileTemplate)
            break;
        case "Balko":
            fileFinal = toBalko(await profileTemplate)
            break;
        case "Cybersole":
            fileFinal = toCybersole(await profileTemplate)
            break;
        case "Eve":
            break;
        case "ECB":
            fileFinal = toECB(await profileTemplate)
            break;
        case "F3ather":
            fileFinal = toF3ather(await profileTemplate)
            break;
        case "FlareAIO":
            fileFinal = toFlareAIO(await profileTemplate)
            break;
        case "FleekFramework":
            fileFinal = toFleek(await profileTemplate)
            break;
        case "Ganesh":
            fileFinal = toGanesh(await profileTemplate)
            break;
        case "Hawk":
            fileFinal = toHawk(await profileTemplate)
            break;
        case "Kodai":
            fileFinal = toKodai(await profileTemplate)
            break;
        case "Kylin":
            fileFinal = toKylin(await profileTemplate)
            break;
        case "MangoPreme":
            fileFinal = toMangoPreme(await profileTemplate)
            break;
        case "Mek":
            fileFinal = toMek(await profileTemplate)
            break;
        case "Nova":
            fileFinal = toNova(await profileTemplate)
            break;
        case "NSB":
            fileFinal = toNsb(await profileTemplate)
            break;
        case "Phantom":
            fileFinal = toPhantom(await profileTemplate)
            break;
        case "Phasma":
            fileFinal = toPhasma(await profileTemplate)
            break;
        case "Polaris":
            fileFinal = toPolaris(await profileTemplate)
            break;
        case "Prism":
            fileFinal = toPrism(await profileTemplate)
            break;
        case "Project Destroyer":
            fileFinal = toProjectDestroyer(await profileTemplate)
            break;
        case "QBot":
            fileFinal = toQBot(await profileTemplate)
            break
        case "Sole":
            fileFinal = toSole(await profileTemplate)
            break;
        case "SoleSneakers":
            fileFinal = toSoleSneakers(await profileTemplate)
            break;
        case "SplashForce":
            fileFinal = toSplashForce(await profileTemplate)
            break;
        case "TKS":
            fileFinal = toTks(await profileTemplate)
            break;
        case "Tohru":
            fileFinal = toTohru(await profileTemplate)
            break;
        case "TSB":
            fileFinal = toTsb(await profileTemplate)
            break;
        case "Velox":
            fileFinal = toVelox(await profileTemplate)
            break;
        case "ZephyrAIO" :
            fileFinal = toZephyr(await profileTemplate);
            break;
        default:
            break;
    }
    ipcRenderer.sendSync('saveProfileConverter', [await fileFinal, isCSV(toProfile)])
    displayDragAndDropInformation();
}*/


module.exports = {

    isCSV: function (profileName) {
        return ["AIOMoji", "Ganesh", "ANB", "Hawk", "ECB"].includes(profileName)
    },
    /**
     * return a card type for a credit card number given
     * @param {number of the credit card} number 
     */
    getCardType: function (number) {
        if (number) {
            // visa
            var re = new RegExp("^4");
            if (number.match(re) != null)
                return "visa";

            // Mastercard 
            // Updated for Mastercard 2017 BINs expansion
            if (/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(number))
                return "mastercard";

            // AMEX
            re = new RegExp("^3[47]");
            if (number.match(re) != null)
                return "amex";

            // Visa Electron
            re = new RegExp("^(4026|417500|4508|4844|491(3|7))");
            if (number.match(re) != null)
                return "visa";
            return null;
        } else
            return null;
    },


    genPolarisID: function () {
        return Math.floor(Math.random() * (9999999999999 - 1000000000000 + 1)) + 1000000000000;
    },

    getCountryCode: function (country) {
        try {
            return (lookup.byCountry(country).iso2) ? lookup.byCountry(country).iso2 : null
        } catch (e) {
            return null;
        }

    },

    getCountryByCode: function (country_code) {
        try {
            return (lookup.byIso(country_code).country) ? lookup.byIso(country_code).country : null
        } catch (e) {
            return null;
        }

    },

    /**
     * BOTS FUNCTIONS PART.
     * EACH BOT HAS A "FROM" AND "TO" FUNCTION,
     * TO CONVERT A PROFILE FROM THE BOT OR TO THE BOT 
     * EACH FUNCTION IS UNIQUE
     */

    fromCybersole: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].name,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i].phone,
                    "email": file[i].email,
                    "first_name": file[i].delivery.firstName,
                    "last_name": file[i].delivery.lastName,
                    "address": file[i].delivery.address1,
                    "address_2": file[i].delivery.address2,
                    "address_3": null,
                    "zip": file[i].delivery.zip,
                    "city": file[i].delivery.city,
                    "province": null,
                    "state": file[i].delivery.state,
                    "state_code": null,
                    "country": file[i].delivery.country,
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].delivery.firstName + " " + file[i].delivery.lastName,
                    "card_number": file[i].card.number,
                    "expiration_month": file[i].card.expiryMonth,
                    "expiration_year": file[i].card.expiryYear,
                    "card_cvv": file[i].card.cvv,
                    "card_type": null
                },
                "paypal": {
                    "email": file[i].paypal.email,
                    "password": file[i].paypal.password
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": file[i].singleCheckout
                }
            }
        }
        return profile
    },

    toCybersole: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "name": file[i].profile_settings.profile_name,
                "email": file[i].billing.email,
                "phone": file[i].billing.phone,
                "sizes": ["Random"],
                "modes": ["Fast"],
                "taskAmount": 1,
                "singleCheckout": file[i].options.one_checkout,
                "billingDifferent": false,
                "favorite": false,
                "card": {
                    "number": file[i].payment.card_number,
                    "expiryMonth": file[i].payment.expiration_month,
                    "expiryYear": (file[i].payment.expiration_year.length == 2) ? `20${file[i].payment.expiration_year}` : file[i].payment.expiration_year,
                    "cvv": file[i].payment.card_cvv
                },
                "paypal": {
                    "email": file[i].paypal.email,
                    "password": file[i].paypal.password
                },
                "delivery": {
                    "firstName": file[i].billing.first_name,
                    "lastName": file[i].billing.last_name,
                    "address1": file[i].billing.address,
                    "address2": file[i].billing.address_2,
                    "zip": file[i].billing.zip,
                    "city": file[i].billing.city,
                    "country": file[i].billing.country,
                    "state": file[i].billing.state
                },
                "billing": {
                    "firstName": file[i].billing.first_name,
                    "lastName": file[i].billing.last_name,
                    "address1": file[i].billing.address,
                    "address2": file[i].billing.address_2,
                    "zip": file[i].billing.zip,
                    "city": file[i].billing.city,
                    "country": file[i].billing.country,
                    "state": file[i].billing.state
                }
            }
        }
        console.log(await profile)
        return profile;
    },

    fromMek: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].profile_name,
                    "profile_id": file[i].id
                },
                "billing": {
                    "phone": file[i].order_tel,
                    "email": file[i].order_email,
                    "first_name": file[i].billing_name,
                    "last_name": file[i].billing_name,
                    "address": file[i].order_address,
                    "address_2": file[i].order_address_2,
                    "address_3": null,
                    "zip": file[i].order_billing_zip,
                    "city": file[i].order_billing_city,
                    "province": null,
                    "state": file[i].order_billing_state,
                    "state_code": null,
                    "country": null,
                    "country_code": file[i].order_billing_country,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].billing_name,
                    "card_number": file[i].cnb,
                    "expiration_month": file[i].month,
                    "expiration_year": file[i].year,
                    "card_cvv": file[i].vval,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile
    },

    toMek: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "id": "profile_1",
                "profile_name": file[i].profile_settings.profile_name,
                "billing_name": file[i].billing.first_name + " " + file[i].billing.last_name,
                "order_email": file[i].billing.email,
                "order_address": file[i].billing.address,
                "order_address_2": file[i].billing.address_2,
                "order_tel": file[i].billing.phone,
                "order_billing_zip": file[i].billing.zip,
                "order_billing_city": file[i].billing.city,
                "area": null,
                "order_billing_state": file[i].billing.state,
                "order_billing_country": file[i].billing.country,
                "card_type": file[i].payment.card_type,
                "cnb": file[i].payment.card_number,
                "month": file[i].payment.expiration_month,
                "year": file[i].payment.expiration_year,
                "vval": file[i].payment.card_cvv
            }
        }
        return profile
    },

    fromBalko: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": null,
                    "profile_id": file[i].id
                },
                "billing": {
                    "phone": file[i].phone,
                    "email": file[i].email,
                    "first_name": file[i].firstname,
                    "last_name": file[i].lastname,
                    "address": file[i].add1,
                    "address_2": file[i].add2,
                    "address_3": null,
                    "zip": file[i].zip,
                    "city": file[i].city,
                    "province": null,
                    "state": file[i].state,
                    "state_code": null,
                    "country": file[i].country,
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].ccfirst + " " + file[i].cclast,
                    "card_number": file[i].cc,
                    "expiration_month": file[i].expm,
                    "expiration_year": file[i].expy,
                    "card_cvv": file[i].ccv,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": file[i].oneCheckout
                }
            }
        }
        return profile;
    },

    toBalko: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "id": file[i].profile_settings.profile_id,
                "firstname": file[i].billing.first_name,
                "lastname": file[i].billing.last_name,
                "email": file[i].billing.email,
                "phone": file[i].billing.phone,
                "add1": file[i].billing.address,
                "add2": file[i].billing.address_2,
                "state": file[i].billing.state,
                "zip": file[i].billing.zip,
                "country": file[i].billing.country,
                "city": file[i].billing.city,
                "ccfirst": file[i].payment.card_holder,
                "cclast": file[i].payment.card_holder,
                "cc": file[i].payment.card_number,
                "expm": file[i].payment.expiration_month,
                "expy": file[i].payment.expiration_year,
                "ccv": file[i].payment.card_cvv,
                "oneCheckout": file[i].options.one_checkout,
                "bfirstname": file[i].billing.first_name,
                "blastname": file[i].billing.last_name,
                "badd1": file[i].billing.address,
                "badd2": file[i].billing.address_2,
                "bstate": file[i].billing.state,
                "bzip": file[i].billing.zip,
                "bcountry": file[i].billing.country,
                "bcity": file[i].billing.city
            }
        }
        return profile;
    },

    fromProjectDestroyer: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].title,
                    "profile_id": file[i].id
                },
                "billing": {
                    "phone": file[i].billing.phone,
                    "email": file[i].email,
                    "first_name": file[i].billing.firstName,
                    "last_name": file[i].billing.lastName,
                    "address": file[i].billing.address1,
                    "address_2": file[i].billing.address2,
                    "address_3": null,
                    "zip": file[i].billing.zipcode,
                    "city": file[i].billing.city,
                    "province": null,
                    "state": file[i].billing.state,
                    "state_code": null,
                    "country": file[i].billing.country,
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].billing.firstName + " " + file[i].billing.lastName,
                    "card_number": file[i].card.number,
                    "expiration_month": file[i].card.expire,
                    "expiration_year": file[i].card.expire,
                    "card_cvv": file[i].card.code,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": (file[i].limit > 1) ? false : true
                }
            }
        }
        return profile;
    },

    toProjectDestroyer: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "billing": {
                    "address1": file[i].billing.address,
                    "address2": file[i].billing.address_2,
                    "city": file[i].billing.city,
                    "country": file[i].billing.country,
                    "firstName": file[i].billing.first_name,
                    "lastName": file[i].billing.last_name,
                    "phone": file[i].billing.phone,
                    "state": file[i].billing.state,
                    "zipcode": file[i].billing.zip
                },
                "card": {
                    "code": file[i].payment.card_cvv,
                    "expire": file[i].payment.expiration_month + "/" + file[i].payment.expiration_year.substring(2, 4),
                    "name": file[i].card_holder,
                    "number": file[i].payment.card_number
                },
                "cashOnDelivery": false,
                "dotTrick": false,
                "email": file[i].billing.email,
                "id": "PRIME00" + i,
                "jigAddress": false,
                "jigPhone": false,
                "limit": file[i].options.one_checkout,
                "limitCount": "",
                "match": false,
                "shipping": {
                    "address1": file[i].billing.address,
                    "address2": file[i].billing.address_2,
                    "city": file[i].billing.city,
                    "country": file[i].billing.country,
                    "firstName": file[i].billing.first_name,
                    "lastName": file[i].billing.last_name,
                    "phone": file[i].billing.phone,
                    "state": file[i].billing.state,
                    "zipcode": file[i].billing.zip
                },
                "title": file[i].profile_settings.profile_name
            }
        }
        return profile;
    },

    /*fromSole: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].ProfileName,
                    "profile_id": file[i].ID
                },
                "billing": {
                    "phone": file[i].Phone,
                    "email": file[i].Email,
                    "first_name": file[i].ShippingFirstName,
                    "last_name": file[i].ShippingLastName,
                    "address": file[i].ShippingAddress1,
                    "address_2": file[i].ShippingAddress2,
                    "address_3": null,
                    "zip": file[i].ShippingZip,
                    "city": file[i].ShippingCity,
                    "province": null,
                    "state": file[i].ShippingState,
                    "state_code": null,
                    "country": file[i].ShippingCountry,
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].CardName,
                    "card_number": file[i].CardNumber,
                    "expiration_month": file[i].CardExpiryMonth,
                    "expiration_year": file[i].CardExpiryYear,
                    "card_cvv": file[i].CardCvv,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": file[i].CheckoutLimit,
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },

    toSole: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "ID": i,
                "ProfileName": file[i].profile_settings.profile_name,
                "Email": file[i].billing.email,
                "Phone": file[i].billing.phone,
                "ShippingFirstName": file[i].billing.first_name,
                "ShippingLastName": file[i].billing.last_name,
                "ShippingAddress1": file[i].billing.address,
                "ShippingAddress2": file[i].billing.address_2,
                "ShippingCity": file[i].billing.city,
                "ShippingZip": file[i].billing.zip,
                "ShippingCountry": file[i].billing.country,
                "ShippingState": file[i].billing.state,
                "UseBilling": false,
                "BillingFirstName": "",
                "BillingLastName": "",
                "BillingAddress1": "",
                "BillingAddress2": "",
                "BillingCity": "",
                "BillingZip": "",
                "BillingCountry": "",
                "BillingState": "",
                "CardNumber": file[i].payment.card_number,
                "CardName": file[i].payment.card_holder,
                "CardCvv": file[i].payment.card_cvv,
                "CardExpiryMonth": file[i].payment.expiration_month,
                "CardExpiryYear": file[i].payment.expiration_year,
                "CardType": file[i].payment.card_type,
                "CheckoutLimit": file[i].options.checkout_limit
            }
        }
        return profile;
    },*/

    fromTks: async function (file) {
        var profile = []
        for (var i = 0; i < file.Profiles.length; i++) {
            var currentProfile = file.Profiles[i]
            profile[i] = {
                "profile_settings": {
                    "profile_name": currentProfile.Name,
                    "profile_id": currentProfile.Id
                },
                "billing": {
                    "phone": currentProfile.Billing.phone,
                    "email": currentProfile.Billing.Email,
                    "first_name": currentProfile.Billing.FirstName,
                    "last_name": currentProfile.Billing.LastName,
                    "address": currentProfile.Billing.AddressLine1,
                    "address_2": currentProfile.Billing.AddressLine2,
                    "address_3": null,
                    "zip": currentProfile.Billing.Zip,
                    "city": currentProfile.Billing.City,
                    "province": null,
                    "state": null,
                    "state_code": currentProfile.Billing.StateCode,
                    "country": null,
                    "country_code": currentProfile.Billing.CountryCode,
                    "area": null
                },
                "payment": {
                    "card_holder": currentProfile.Payment.CardHolder,
                    "card_number": currentProfile.Payment.CardNumber,
                    "expiration_month": currentProfile.Payment.ExpirationMonth,
                    "expiration_year": currentProfile.Payment.ExpirationYear,
                    "card_cvv": currentProfile.Payment.SecurityCode,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": currentProfile.Options.OneItemPerWebsite,
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },

    toTks: async function (file) {
        var profile = {
            "Locale": "EN",
            "Tasks": [],
            "Profiles": [],
            "Proxies": [],
            "CaptchaSolvers": [],
            "RemoteTaskSettings": [],
            "ShopifyStores": [],
            "SizingGroups": [],
            "ShippingRates": [],
            "CheckoutBankUrls": [],
            "MonitorUserDefinedWebsites": [],
            "Logins": {},
            "DiscordWebhook": null,
            "TwoCaptchaApiKeys": null,
            "SendCheckoutToGroupDiscord": false,
            "TaskToastNotifications": false,
            "ShopifyDiscordWebhook": null,
            "AkamaiCookies": []
        }
        for (var i = 0; i < file.length; i++) {
            profile.Profiles[i] = {
                "Id": deviceID,
                "Name": file[i].profile_settings.profile_name,
                "Billing": {
                    "Pccc": null,
                    "Email": file[i].billing.email,
                    "FirstName": file[i].billing.first_name,
                    "Lastname": file[i].billing.last_name,
                    "AddressLine1": file[i].billing.address,
                    "AddressLine2": file[i].billing.address_2,
                    "Zip": file[i].billing.zip,
                    "City": file[i].billing.city,
                    "CountryCode": file[i].billing.country_code,
                    "StateCode": file[i].billing.state_code,
                    "Phone": file[i].billing.phone
                },
                "Shipping": {
                    "Pccc": null,
                    "Email": file[i].billing.email,
                    "FirstName": file[i].billing.first_name,
                    "Lastname": file[i].billing.last_name,
                    "AddressLine1": file[i].billing.address,
                    "AddressLine2": file[i].billing.address_2,
                    "Zip": file[i].billing.zip,
                    "City": file[i].billing.city,
                    "CountryCode": file[i].billing.country_code,
                    "StateCode": file[i].billing.state_code,
                    "Phone": file[i].billing.phone
                },
                "Payment": {
                    "CardHolder": file[i].payment.card_holder,
                    "CardNumber": file[i].payment.card_number,
                    "ExpirationMonth": file[i].payment.expiration_month,
                    "ExpirationYear": file[i].payment.expiration_year,
                    "SecurityCode": file[i].payment.card_cvv,
                    "CardType": this.getCardType(file[i].payment.card_number) == "visa" ? 0 : 1
                },
                "Options": {
                    "UseBillingForShipping": true,
                    "OneItemPerWebsite": file[i].options.one_checkout
                }
            }
        }
        return profile;
    },

    fromNova: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].profilename,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i].phone,
                    "email": file[i].email,
                    "first_name": file[i].firstname,
                    "last_name": file[i].lastname,
                    "address": file[i].shipping.address,
                    "address_2": file[i].shipping.apt,
                    "address_3": null,
                    "zip": file[i].shipping.zip,
                    "city": file[i].shipping.city,
                    "province": null,
                    "state": file[i].shipping.state,
                    "state_code": null,
                    "country": file[i].shipping.country,
                    "country_code": file[i].shipping.countrycode,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].cardholdername,
                    "card_number": file[i].cardnumber,
                    "expiration_month": file[i].expdate,
                    "expiration_year": file[i].expdate,
                    "card_cvv": file[i].cvv,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },


    toNova: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profilename": file[i].profile_settings.profile_name,
                "email": file[i].billing.email,
                "phone": file[i].billing.phone,
                "firstname": file[i].billing.first_name,
                "lastname": file[i].billing.last_name,
                "shipping": {
                    "address": file[i].billing.address,
                    "apt": file[i].billing.address_2,
                    "city": file[i].billing.city,
                    "zip": file[i].billing.zip,
                    "country": file[i].billing.country,
                    "countrycode": file[i].billing.country_code,
                    "state": file[i].billing.state
                },
                "usebilling": false,
                "billing": {
                    "address": file[i].billing.address,
                    "apt": file[i].billing.address_2,
                    "city": file[i].billing.city,
                    "zip": file[i].billing.zip,
                    "country": file[i].billing.country,
                    "countrycode": file[i].billing.country_code,
                    "state": file[i].billing.state
                },
                "cardholdername": file[i].payment.card_holder,
                "cardnumber": file[i].payment.card_number,
                "expdate": `${file[i].payment.expiration_month}/${file[i].payment.expiration_year}`,
                "cvv": file[i].payment.card_cvv
            }
        }
        return profile;
    },

    fromNsb: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].name,
                    "profile_id": i
                },
                "billing": {
                    "phone": file[i].shipping.phone,
                    "email": file[i].email,
                    "first_name": file[i].shipping.firstname,
                    "last_name": file[i].shipping.lastname,
                    "address": file[i].shipping.address,
                    "address_2": file[i].shipping.address2,
                    "address_3": null,
                    "zip": file[i].shipping.zip,
                    "city": file[i].shipping.city,
                    "province": null,
                    "state": file[i].shipping.state,
                    "state_code": null,
                    "country": null,
                    "country_code": file[i].shipping.country,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].cc.name,
                    "card_number": file[i].cc.number,
                    "expiration_month": file[i].cc.expiry,
                    "expiration_year": file[i].cc.expiry,
                    "card_cvv": file[i].cc.cvc,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": Number(file[i].checkoutLimit),
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },

    toNsb: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "shipping": {
                    "firstname": file[i].billing.first_name,
                    "lastname": file[i].billing.last_name,
                    "country": file[i].billing.country,
                    "city": file[i].billing.city,
                    "address": file[i].billing.address,
                    "address2": file[i].billing.address_2,
                    "address3": file[i].billing.address_3,
                    "address4": null,
                    "state": file[i].billing.state_code,
                    "zip": file[i].billing.zip,
                    "phone": file[i].billing.phone
                },
                "name": file[i].profile_settings.profile_name,
                "cc": {
                    "number": file[i].payment.card_number.match(/.{4}/g).join(" "),
                    "expiry": `${file[i].payment.expiration_month}/${file[i].payment.expiration_year}`,
                    "cvc": file[i].payment.card_cvv,
                    "name": file[i].payment.card_holder
                },
                "email": file[i].billing.email,
                "checkoutLimit": (file[i].options.one_checkout) ? "1" : "2",
                "billingSame": true,
                "date": Math.round((new Date()).getTime() / 1000),
                "id": i
            }
        }
        return profile;
    },

    fromTsb: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].cc.profileName,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i].cc.phone,
                    "email": null,
                    "first_name": file[i].shipping.firstName,
                    "last_name": file[i].shipping.lastName,
                    "address": file[i].shipping.address,
                    "address_2": file[i].shipping.address2,
                    "address_3": file[i].shipping.address3,
                    "zip": file[i].shipping.zip,
                    "city": file[i].shipping.city,
                    "province": null,
                    "state": null,
                    "state_code": file[i].shipping.state,
                    "country": null,
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": `${file[i].shipping.firstName} ${file[i].shipping.lastName} `,
                    "card_number": file[i].cc.ccNumber,
                    "expiration_month": file[i].cc.ccExpiry,
                    "expiration_year": file[i].cc.ccExpiry,
                    "card_cvv": file[i].cc.ccCvc,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },

    toTsb: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "cc": {
                    "profileName": file[i].profile_settings.profile_name,
                    "phone": file[i].billing.phone,
                    "ccNumber": file[i].payment.card_number,
                    "ccExpiry": `${file[i].payment.expiration_month} / ${file[i].payment.expiration_year}`,
                    "ccCvc": file[i].payment.card_cvv
                },
                "shipping": {
                    "address": file[i].billing.address,
                    "address2": file[i].billing.address_2,
                    "country": file[i].billing.country,
                    "city": file[i].billing.city,
                    "zip": file[i].billing.zip,
                    "state": file[i].billing.state_code,
                    "firstName": file[i].billing.first_name,
                    "lastName": file[i].billing.last_name
                },
                "billing": {
                    "billingSameAsShipping": true
                },
                "isJapaneseAddress": null,
                "isRussianAddress": null,
                "isMexicanAddress": null,
                "isPhilippinesAddress": null,
                "date": Math.round((new Date()).getTime() / 1000)
            }
        }
        return profile;
    },


    fromPhantom: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].Name,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i].Phone,
                    "email": file[i].Email,
                    "first_name": file[i].Billing.FirstName,
                    "last_name": file[i].Billing.LastName,
                    "address": file[i].Billing.Address,
                    "address_2": file[i].Billing.Apt,
                    "address_3": null,
                    "zip": file[i].Billing.Zip,
                    "city": file[i].Billing.City,
                    "province": null,
                    "state": file[i].Billing.State,
                    "state_code": null,
                    "country": null,
                    "country_code": file[i].Country,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].Billing.FirstName + file[i].Billing.LastName,
                    "card_number": file[i].CCNumber,
                    "expiration_month": file[i].ExpMonth,
                    "expiration_year": file[i].ExpYear,
                    "card_cvv": file[i].CVV,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": 1,
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },

    toPhantom: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "Billing": {
                    "Address": file[i].billing.address,
                    "Apt": file[i].billing.address_2,
                    "City": file[i].billing.city,
                    "FirstName": file[i].billing.first_name,
                    "LastName": file[i].billing.last_name,
                    "State": file[i].billing.state,
                    "Zip": file[i].billing.zip
                },
                "CCNumber": file[i].payment.card_number,
                "CVV": file[i].payment.card_cvv,
                "CardType": file[i].payment.card_type,
                "Country": file[i].billing.country,
                "Email": file[i].billing.email,
                "ExpMonth": file[i].payment.expiration_month,
                "ExpYear": file[i].payment.expiration_year,
                "Name": file[i].profile_settings.profile_name,
                "Phone": file[i].billing.phone,
                "Same": true,
                "Shipping": {
                    "Address": file[i].billing.address,
                    "Apt": file[i].billing.address_2,
                    "City": file[i].billing.city,
                    "FirstName": file[i].billing.first_name,
                    "LastName": file[i].billing.last_name,
                    "State": file[i].billing.state,
                    "Zip": file[i].billing.zip
                }
            }
        }
        return profile;
    },


    fromPrism: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].name,
                    "profile_id": file[i].id
                },
                "billing": {
                    "phone": file[i].shipping.phone,
                    "email": file[i].email,
                    "first_name": file[i].shipping.firstName,
                    "last_name": file[i].shipping.lastName,
                    "address": file[i].shipping.address1,
                    "address_2": file[i].shipping.address2,
                    "address_3": null,
                    "zip": file[i].shipping.postalCode,
                    "city": file[i].shipping.city,
                    "province": file[i].shipping.province,
                    "state": null,
                    "state_code": null,
                    "country": file[i].shipping.country,
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].payment.name,
                    "card_number": file[i].payment.num,
                    "expiration_month": file[i].payment.month,
                    "expiration_year": file[i].payment.year,
                    "card_cvv": file[i].payment.cvv,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": 1,
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },


    toPrism: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "id": deviceID,
                "createdAt": 0,
                "updatedAt": 1600900453951,
                "name": file[i].profile_settings.profile_name,
                "email": "vivien@nyrres.work",
                "oneTimeUse": false,
                "shipping": {
                    "firstName": file[i].billing.first_name,
                    "lastName": file[i].billing.last_name,
                    "address1": file[i].billing.address,
                    "address2": file[i].billing.address_2,
                    "city": file[i].billing.city,
                    "province": file[i].billing.province,
                    "postalCode": file[i].billing.zip,
                    "country": file[i].billing.country,
                    "phone": file[i].billing.phone
                },
                "billing": {
                    "sameAsShipping": true,
                    "firstName": "",
                    "lastName": "",
                    "address1": "",
                    "address2": "",
                    "city": "",
                    "province": null,
                    "postalCode": "",
                    "country": null,
                    "phone": ""
                },
                "payment": {
                    "name": file[i].payment.card_holder,
                    "num": file[i].payment.card_number,
                    "year": file[i].payment.expiration_year,
                    "month": file[i].payment.expiration_month,
                    "cvv": file[i].payment.card_cvv
                }
            }
        }
        return profile;
    },

    fromSplashForce: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].profileName,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i].billingAddress.phone,
                    "email": file[i].email,
                    "first_name": file[i].billingAddress.firstName,
                    "last_name": file[i].billingAddress.lastName,
                    "address": file[i].billingAddress.addressOne,
                    "address_2": file[i].billingAddress.addressTwo,
                    "address_3": null,
                    "zip": file[i].billingAddress.zip,
                    "city": file[i].billingAddress.city,
                    "province": null,
                    "state": file[i].billingAddress.state,
                    "state_code": null,
                    "country": file[i].billingAddress.country,
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].card.cardHolderName,
                    "card_number": file[i].card.cardNumber,
                    "expiration_month": file[i].card.cardExpiryMonth,
                    "expiration_year": file[i].card.cardExpiryYear,
                    "card_cvv": file[i].card.cardCVV,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": file[i].oneCheckout
                }
            }
        }
        return profile
    },

    toSplashForce: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profileName": file[i].profile_settings.profile_name,
                "email": file[i].billing.email,
                "billingAddress": {
                    "firstName": file[i].billing.first_name,
                    "lastName": file[i].billing.last_name,
                    "addressOne": file[i].billing.address,
                    "addressTwo": file[i].billing.address_2,
                    "zip": file[i].billing.zip,
                    "city": file[i].billing.city,
                    "state": file[i].billing.state,
                    "country": file[i].billing.country,
                    "phone": file[i].billing.phone
                },
                "shippingAddress": {
                    "firstName": file[i].billing.first_name,
                    "lastName": file[i].billing.last_name,
                    "addressOne": file[i].billing.address,
                    "addressTwo": file[i].billing.address_2,
                    "zip": file[i].billing.zip,
                    "city": file[i].billing.city,
                    "state": file[i].billing.state,
                    "country": file[i].billing.country,
                    "phone": file[i].billing.phone
                },
                "card": {
                    "cardHolderName": file[i].payment.card_holder,
                    "cardNumber": file[i].payment.card_number,
                    "cardExpiryMonth": file[i].payment.expiration_month,
                    "cardExpiryYear": file[i].payment.expiration_year,
                    "cardCVV": file[i].payment.card_cvv
                },
                "jigAddress": false,
                "oneCheckout": file[i].options.one_checkout,
                "shipToBill": false,
                "useThreeD": false
            }
        }
        return profile;
    },

    fromPhasma: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": null,
                    "profile_id": null
                },
                "billing": {
                    "phone": file["main" + i].phone,
                    "email": file["main" + i].email,
                    "first_name": file["main" + i].surname,
                    "last_name": file["main" + i].name,
                    "address": file["main" + i]["street-1"],
                    "address_2": file["main" + i]["street-2"],
                    "address_3": file["main" + i]["street-3"],
                    "zip": file["main" + i].zip,
                    "city": file["main" + i].city,
                    "province": file["main" + i].province,
                    "state": file["main" + i].state,
                    "state_code": null,
                    "country": file["main" + i].country,
                    "country_code": file["main" + i].country_id,
                    "area": null
                },
                "payment": {
                    "card_holder": file["main" + i].name,
                    "card_number": file["main" + i].credit_card.number,
                    "expiration_month": file["main" + i].credit_card.expiry,
                    "expiration_year": file["main" + i].credit_card.expiry,
                    "card_cvv": file["main" + i].credit_card.cvc,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": Number(file["main" + i].checkoutLimit),
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },


    toPhasma: async function (file) {
        var profile = {}
        for (var i = 0; i < file.length; i++) {
            profile["main" + i] = {
                "birthday": "18/08/2001",
                "city": file[i].billing.city,
                "country": file[i].billing.country,
                "country_id": file[i].billing.country_code,
                "credit_card": {
                    "cvv": file[i].payment.card_cvv,
                    "expiry": `${file[i].payment.expiration_month / file[i].payment.expiration_year}`,
                    "number": file[i].payment.card_number
                },
                "email": file[i].billing.email,
                "name": file[i].billing.last_name,
                "phone": file[i].billing.phone,
                "province": file[i].billing.province,
                "state": file[i].billing.state,
                "street-1": file[i].billing.address,
                "street-2": file[i].billing.address_2,
                "street-3": file[i].billing.address_3,
                "surname": file[i].billing.first_name,
                "zipcode": file[i].billing.zip
            }
        }
        return profile;
    },

    fromFlareAIO: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].profileName,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i].shippingAddress.phone,
                    "email": file[i].email,
                    "first_name": file[i].shippingAddress.firstName,
                    "last_name": file[i].shippingAddress.lastName,
                    "address": file[i].shippingAddress.address1,
                    "address_2": file[i].shippingAddress.address2,
                    "address_3": null,
                    "zip": file[i].shippingAddress.postalCode,
                    "city": file[i].shippingAddress.city,
                    "province": null,
                    "state": file[i].shippingAddress.state,
                    "state_code": null,
                    "country": file[i].shippingAddress.countryName,
                    "country_code": file[i].shippingAddress.country,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].shippingAddress.firstName + " " + file[i].shippingAddress.lastName,
                    "card_number": file[i].paymentInformation.cardNumber,
                    "expiration_month": file[i].paymentInformation.expiryMonth,
                    "expiration_year": file[i].paymentInformation.expiryYear,
                    "card_cvv": file[i].paymentInformation.cvv,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile
    },

    toFlareAIO: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profileName": file[i].profile_settings.profile_name,
                "email": file[i],
                "shippingAddress": {
                    "firstName": file[i].billing.first_name,
                    "lastName": file[i].billing.last_name,
                    "phone": file[i].billing.phone,
                    "houseNumber": null,
                    "address1": file[i].billing.address_1,
                    "address2": file[i].billing.address_2,
                    "postalCode": file[i].billing.zip,
                    "city": file[i].billing.city,
                    "state": file[i].billing.state,
                    "allikeStateID": null,
                    "consortiumStateName": null,
                    "consortiumStateID": null,
                    "grosbasketStateID": null,
                    "overkillStateID": null,
                    "titoloStateID": null,
                    "slamJamStateID": null,
                    "prodirectStateID": null,
                    "bstnCountryID": null,
                    "43einhalbCountryID": null,
                    "prodirectCountryID": null,
                    "shinzoCountryID": null,
                    "footshopCountryID": null,
                    "awLabStateID": null,
                    "sneakAvenueCountryID": null,
                    "country": file[i].billing.country_code,
                    "countryName": file[i].billing.country
                },
                "isBillingSame": true,
                "billingAddress": {
                    "firstName": file[i].billing.first_name,
                    "lastName": file[i].billing.last_name,
                    "phone": file[i].billing.phone,
                    "houseNumber": null,
                    "address1": file[i].billing.address_1,
                    "address2": file[i].billing.address_2,
                    "postalCode": file[i].billing.zip,
                    "city": file[i].billing.city,
                    "state": file[i].billing.state,
                    "allikeStateID": null,
                    "consortiumStateName": null,
                    "consortiumStateID": null,
                    "grosbasketStateID": null,
                    "overkillStateID": null,
                    "titoloStateID": null,
                    "slamJamStateID": null,
                    "prodirectStateID": null,
                    "bstnCountryID": null,
                    "43einhalbCountryID": null,
                    "prodirectCountryID": null,
                    "shinzoCountryID": null,
                    "footshopCountryID": null,
                    "awLabStateID": null,
                    "sneakAvenueCountryID": null,
                    "country": file[i].billing.country_code,
                    "countryName": file[i].billing.country
                },
                "paymentInformation": {
                    "cardType": file[i].payment.card_type,
                    "cardNumber": file[i].payment.card_number,
                    "expiryMonth": file[i].payment.expiration_month,
                    "expiryYear": file[i].payment.expiration_year,
                    "cvv": file[i].payment.card_cvv
                }
            }
        }
        return profile;
    },

    fromFleek: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": "profile_" + i,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i]["PHONE NUMBER"],
                    "email": file[i]["EMAIL"],
                    "first_name": file[i]["FIRST NAME"],
                    "last_name": file[i]["LAST NAME"],
                    "address": file[i]["ADDRESS LINE 1"],
                    "address_2": file[i]["ADDRESS LINE 2"],
                    "address_3": null,
                    "zip": file[i]["POSTCODE / ZIP"],
                    "city": file[i]["CITY"],
                    "province": null,
                    "state": file[i]["STATE"],
                    "state_code": null,
                    "country": null,
                    "country_code": file[i]["COUNTRY"],
                    "area": null
                },
                "payment": {
                    "card_holder": file[i]["FIRST NAME"] + " " + file[i]["LAST NAME"],
                    "card_number": file[i]["CARD NUMBER"],
                    "expiration_month": file[i]["EXPIRE MONTH"],
                    "expiration_year": file[i]["EXPIRE YEAR"],
                    "card_cvv": file[i]["CARD CVC"],
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile
    },

    toFleek: async function (file) {
        var profile = {}
        for (var i = 0; i < file.length; i++) {
            profile["profile_" + i] = {
                "FIRST NAME": file[i].billing.first_name,
                "LAST NAME": file[i].billing.last_name,
                "EMAIL": file[i].billing.email,
                "PHONE NUMBER": file[i].billing.phone,
                "HOUSE NUMBER": file[i].billing.address,
                "ADDRESS LINE 1": file[i].billing.address,
                "ADDRESS LINE 2": file[i].billing.address_2,
                "STATE": file[i].billing.state,
                "CITY": file[i].billing.city,
                "POSTCODE / ZIP": file[i].billing.zip,
                "COUNTRY": file[i].billing.country,
                "CARD NUMBER": file[i].payment.card_number,
                "EXPIRE MONTH": file[i].payment.expiration_month,
                "EXPIRE YEAR": file[i].payment.expiration_year,
                "CARD CVC": file[i].payment.card_cvv
            }
        }
        return profile;
    },

    fromQBot: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].profileName,
                    "profile_id": file[i]._id
                },
                "billing": {
                    "phone": file[i].phone,
                    "email": null,
                    "first_name": file[i].firstName,
                    "last_name": file[i].lastName,
                    "address": file[i].address1,
                    "address_2": file[i].address2,
                    "address_3": null,
                    "zip": file[i].zipCode,
                    "city": file[i].city,
                    "province": null,
                    "state": file[i].state,
                    "state_code": null,
                    "country": null,
                    "country_code": file[i].country,
                    "area": null
                },
                "payment": {
                    "card_holder": `${file[i].firstName} ${file[i].lastName}`,
                    "card_number": file[i].cc.Number,
                    "expiration_month": file[i].cc.ccExpiry,
                    "expiration_year": file[i].cc.ccExpiry,
                    "card_cvv": file[i].cc.ccCvc,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": false,
                    "isRussianAddress": false,
                    "isMexicanAddress": false,
                    "isPhilippinesAddress": false,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": file[i].oneCheckoutPerProfile
                }
            }
        }
        return profile;
    },

    toQBot: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profileName": file[i].profile_settings.profile_name,
                "firstName": file[i].billing.first_name,
                "lastName": file[i].billing.last_name,
                "email": file[i].billing.email,
                "phoneNumber": file[i].billing.phone,
                "address1": file[i].billing.address,
                "address2": file[i].billing.address_2,
                "city": file[i].billing.city,
                "state": file[i].billing.state,
                "zipCode": file[i].billing.zip,
                "province": file[i].billing.province,
                "country": file[i].billing.country,
                "billingAddress1": file[i].billing.address,
                "billingAddress2": file[i].billing.address_2,
                "billingCity": file[i].billing.city,
                "billingState": file[i].billing.state,
                "billingZipCode": file[i].billing.zip,
                "billingprovince": file[i].billing.province,
                "billingCountry": file[i].billing.country,
                "ccNumber": file[i].payment.card_number,
                "cvv": file[i].payment.card_cvv,
                "ccMonth": file[i].payment.expiration_month,
                "ccYear": file[i].payment.expiration_year,
                "cardType": file[i].payment.card_type,
                "billingSameAsShipping": true,
                "oneCheckoutPerProfile": file[i].options.one_checkout,
                "_id": file[i].profile_settings.profile_id
            }
        }
        return profile;
    },

    fromArc: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].nickname,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i].delivery.telephone,
                    "email": file[i].delivery.email,
                    "first_name": file[i].delivery.firstName,
                    "last_name": file[i].delivery.lastName,
                    "address": file[i].delivery.address1,
                    "address_2": file[i].delivery.address2,
                    "address_3": null,
                    "zip": file[i].delivery.postcode,
                    "city": file[i].delivery.city,
                    "province": null,
                    "state": file[i].delivery.state,
                    "state_code": null,
                    "country": null,
                    "country_code": file[i].delivery.country,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].payment.cardHolderName,
                    "card_number": file[i].payment.cardNumber,
                    "expiration_month": file[i].payment.cardExpirationMonth,
                    "expiration_year": file[i].payment.cardExpirationYear,
                    "card_cvv": file[i].cardCVV,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": false,
                    "isRussianAddress": false,
                    "isMexicanAddress": false,
                    "isPhilippinesAddress": false,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },

    toArc: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "nickname": file[i].profile_settings.profile_name,
                "delivery": {
                    "firstName": file[i].billing.first_name,
                    "lastName": file[i].billing.last_name,
                    "telephone": file[i].billing.phone,
                    "email": file[i].billing.email,
                    "address1": file[i].billing.address,
                    "address2": file[i].billing.address_2,
                    "city": file[i].billing.city,
                    "postcode": file[i].billing.zip,
                    "state": file[i].billing.state,
                    "country": file[i].billing.country
                },
                "payment": {
                    "cardType": file[i].payment.card_type,
                    "cardHolderName": file[i].payment.card_holder,
                    "cardNumber": file[i].payment.card_number,
                    "cardExpirationMonth": file[i].payment.expiration_month,
                    "cardExpirationYear": file[i].payment.expiration_year,
                    "cardCVV": file[i].payment.card_cvv
                }
            }
        }
        return profile;
    },

    fromF3ather: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].nickname,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i].phone,
                    "email": file[i].email,
                    "first_name": file[i].name.split(" ")[0],
                    "last_name": file[i].name.split(" ")[1],
                    "address": file[i].address,
                    "address_2": file[i].address_2,
                    "address_3": file[i].address_3,
                    "zip": file[i].zip,
                    "city": file[i].city,
                    "province": null,
                    "state": file[i].state,
                    "state_code": null,
                    "country": null,
                    "country_code": file[i].country,
                    "area": file[i].region
                },
                "payment": {
                    "card_holder": file[i].name,
                    "card_number": file[i].card,
                    "expiration_month": file[i].month,
                    "expiration_year": file[i].year,
                    "card_cvv": file[i].cvc,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },

    toF3ather: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "nickname": file[i].profile_settings.profile_name,
                "name": `${file[i].billing.first_name} ${file[i].billing.last_name} `,
                "email": file[i].billing.email,
                "phone": file[i].billing.phone,
                "address": file[i].billing.address,
                "address2": file[i].billing.address_2,
                "address3": file[i].billing.address_3,
                "city": file[i].billing.city,
                "zip": file[i].billing.zip,
                "country": file[i].billing.country_code,
                "state": null,
                "cardType": file[i].payment.card_type,
                "card": file[i].payment.card_number,
                "month": file[i].payment.expiration_month,
                "year": file[i].payment.expiration_year,
                "cvc": file[i].payment.card_cvv,
                "region": file[i].billing.area
            }
        }
        return profile;
    },
    /*
    fromVelox: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].name,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i].shipping.phone,
                    "email": file[i].shipping.email,
                    "first_name": file[i].shipping.firstName,
                    "last_name": file[i].shipping.lastName,
                    "address": file[i].shipping.address,
                    "address_2": file[i].shipping.address2,
                    "address_3": "",
                    "zip": file[i].shipping.zip,
                    "city": file[i].shipping.city,
                    "province": null,
                    "state": file[i].shipping.state,
                    "state_code": null,
                    "country": file[i].shipping.country,
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": `${file[i].shipping.firstName} ${file[i].shipping.lastName} `,
                    "card_number": file[i].card.number,
                    "expiration_month": file[i].card.expiry,
                    "expiration_year": file[i].card.expiry,
                    "card_cvv": file[i].card.cvv,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },

    toVelox: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "name": file[i].profile_settings.profile_name,
                "shipping": {
                    "firstName": file[i].billing.first_name,
                    "lastName": file[i].billing.last_name,
                    "email": file[i].billing.email,
                    "phone": file[i].billing.phone,
                    "address": file[i].billing.address,
                    "address2": file[i].billing.address_2,
                    "city": file[i].billing.city,
                    "zipcode": file[i].billing.zip,
                    "country": (file[i].billing.country_code) ? file[i].billing.country_code : "USA",
                    "state": file[i].billing.state_code ? file[i].billing.state_code : "AL"
                },
                "card": {
                    "type": file[i].payment.card_type,
                    "number": file[i].payment.card_number,
                    "expiry": file[i].payment.expiration_month + "/" + file[i].payment.expiration_year.substring(2,4),
                    "cvv": file[i].payment.card_cvv
                }
            }
        }
        return profile;
    },*/

    fromKodai: async function (file) {
        var profile = []
        for (var i = 0; i < Object.keys(file).length; i++) {
            var currentProfile = Object.values(file)[i]
            profile[i] = {
                "profile_settings": {
                    "profile_name": currentProfile.profileName,
                    "profile_id": null
                },
                "billing": {
                    "phone": currentProfile.billingAddress.phoneNumber,
                    "email": currentProfile.paymentDetails.emailAddress,
                    "first_name": currentProfile.billingAddress.firstName,
                    "last_name": currentProfile.billingAddress.lastName,
                    "address": currentProfile.billingAddress.address,
                    "address_2": currentProfile.billingAddress.apt,
                    "address_3": "",
                    "zip": currentProfile.billingAddress.zipCode,
                    "city": currentProfile.billingAddress.city,
                    "province": null,
                    "state": currentProfile.billingAddress.state,
                    "state_code": null,
                    "country": currentProfile.region,
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": `${currentProfile.billingAddress.firstName} ${currentProfile.billingAddress.lastName} `,
                    "card_number": currentProfile.paymentDetails.cardNumber,
                    "expiration_month": currentProfile.paymentDetails.expirationDate,
                    "expiration_year": currentProfile.paymentDetails.expirationDate,
                    "card_cvv": currentProfile.paymentDetails.cvv,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },

    toKodai: async function (file) {
        var profile = {}
        for (var i = 0; i < file.length; i++) {
            profile[file[i].profile_settings.profile_name] = {
                "billingAddress": {
                    "address": file[i].billing.address,
                    "apt": file[i].billing.address_2,
                    "city": file[i].billing.city,
                    "firstName": file[i].billing.first_name,
                    "lastName": file[i].billing.last_name,
                    "phoneNumber": file[i].billing.phone,
                    "state": file[i].billing.state,
                    "zipCode": file[i].billing.zip
                },
                "deliveryAddress": {
                    "address": file[i].billing.address,
                    "apt": file[i].billing.address_2,
                    "city": file[i].billing.city,
                    "firstName": file[i].billing.first_name,
                    "lastName": file[i].billing.last_name,
                    "phoneNumber": file[i].billing.phone,
                    "state": file[i].billing.state,
                    "zipCode": file[i].billing.zip
                },
                "miscellaneousInformation": {
                    "deliverySameAsBilling": true
                },
                "paymentDetails": {
                    "cardHolder": file[i].payment.card_holder,
                    "cardNumber": file[i].payment.card_number,
                    "cvv": file[i].payment.card_cvv,
                    "emailAddress": file[i].billing.email,
                    "expirationDate": file[i].payment.expiration_month + "/" + file[i].payment.expiration_year.substring(2, 4)
                },
                "profileName": file[i].profile_settings.profile_name,
                "region": file[i].billing.country
            }
        }
        return profile;
    },

    /*
    fromSoleSneakers: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].DisplayName,
                    "profile_id": file[i].Id
                },
                "billing": {
                    "phone": null,
                    "email": null,
                    "first_name": file[i].ShippingAddress.FirstName,
                    "last_name": file[i].ShippingAddress.LastName,
                    "address": file[i].ShippingAddress.Address1,
                    "address_2": file[i].ShippingAddress.Address2,
                    "address_3": "",
                    "zip": file[i].ShippingAddress.Zip,
                    "city": file[i].ShippingAddress.City,
                    "province": null,
                    "state": file[i].ShippingAddress.State,
                    "state_code": null,
                    "country": file[i].ShippingAddress.Country,
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].Card.HolderName,
                    "card_number": file[i].Card.Number,
                    "expiration_month": file[i].Card.ExpiryMonth,
                    "expiration_year": file[i].Card.ExpiryYear,
                    "card_cvv": file[i].Card.Cvv,
                    "card_type": null
                },
                "paypal": {
                    "email": file[i].Paypal.Email,
                    "password": file[i].Paypal.Password
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },


    toSoleSneakers: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "Id": i + 1,
                "Uuid": deviceID,
                "DisplayName": file[i].profile_settings.profile_name,
                "BillingSameAsShipping": true,
                "ShippingAddress": {
                    "FirstName": file[i].billing.first_name,
                    "LastName": file[i].billing.last_name,
                    "Address1": file[i].billing.address,
                    "Address2": file[i].billing.address_2,
                    "City": file[i].billing.city,
                    "Zip": file[i].billing.zip,
                    "State": file[i].billing.state,
                    "Country": file[i].billing.country
                },
                "BillingAddress": {
                    "FirstName": file[i].billing.first_name,
                    "LastName": file[i].billing.last_name,
                    "Address1": file[i].billing.address,
                    "Address2": file[i].billing.address_2,
                    "City": file[i].billing.city,
                    "Zip": file[i].billing.zip,
                    "State": file[i].billing.state,
                    "Country": file[i].billing.country
                },
                "Card": {
                    "Type": file[i].payment.card_type,
                    "HolderName": file[i].payment.card_holder,
                    "Number": file[i].payment.card_number,
                    "Cvv": file[i].payment.card_cvv,
                    "ExpiryMonth": file[i].payment.expiration_month,
                    "ExpiryYear": file[i].payment.expiration_year,
                    "NationalId": null
                },
                "PayPal": {
                    "Email": file[i].paypal.email,
                    "Password": file[i].paypal.password,
                    "NationalId": null
                },
                "UsePayPal": (file[i].paypal.email) ? true : false
            }
        }
        return profile;
    },*/

    fromKylin: async function (file) {
        var profile = []
        for (var i = 0; i < file.profileList.length; i++) {
            var currentProfile = file.profileList[i]
            profile[i] = {
                "profile_settings": {
                    "profile_name": currentProfile.profile_name,
                    "profile_id": null
                },
                "billing": {
                    "phone": currentProfile.billing_phone,
                    "email": currentProfile.billing_email,
                    "first_name": currentProfile.billing_fname,
                    "last_name": currentProfile.billing_lname,
                    "address": currentProfile.billing_address1,
                    "address_2": currentProfile.billing_address2,
                    "address_3": null,
                    "zip": currentProfile.billing_zip,
                    "city": currentProfile.billing_city,
                    "province": null,
                    "state": currentProfile.billing_state,
                    "state_code": null,
                    "country": currentProfile.billing_country,
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": currentProfile.card_name,
                    "card_number": currentProfile.card_number,
                    "expiration_month": currentProfile.card_exp,
                    "expiration_year": currentProfile.card_exp,
                    "card_cvv": currentProfile.card_csc,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },

    toKylin: async function (file) {
        var profile = {
            "version": "1.1.33",
            "profileList": []
        }
        for (var i = 0; i < file.length; i++) {
            profile.profileList[i] = {
                "group": "",
                "delivery_fname": file[i].billing.first_name,
                "delivery_lname": file[i].billing.last_name,
                "delivery_email": file[i].billing.email,
                "delivery_phone": file[i].billing.phone,
                "delivery_address1": file[i].billing.address,
                "delivery_address2": file[i].billing.address_2,
                "delivery_house_number": "",
                "delivery_city": file[i].billing.city,
                "delivery_state": file[i].billing.state_code,
                "delivery_country": file[i].billing.country_code,
                "delivery_zip": file[i].billing.zip,
                "billing_fname": file[i].billing.first_name,
                "billing_lname": file[i].billing.last_name,
                "billing_email": file[i].billing.email,
                "billing_phone": file[i].billing.phone,
                "billing_address1": file[i].billing.address,
                "billing_address2": file[i].billing.address_2,
                "billing_house_number": "",
                "billing_city": file[i].billing.city,
                "billing_state": file[i].billing.state_code,
                "billing_country": file[i].billing.country_code,
                "billing_zip": file[i].billing.zip,
                "card_type": file[i].payment.card_type,
                "card_number": file[i].payment.card_number,
                "card_name": file[i].payment.card_holder,
                "card_exp": `${file[i].payment.expiration_month}/${file[i].payment.expiration_year}`,
                "card_csc": file[i].payment.card_cvv,
                "delivery_info_as_billing_info": true,
                "billing_name": `${file[i].billing.first_name} ${file[i].billing.last_name}`,
                "card_expiry_month": file[i].payment.expiration_month,
                "card_expiry_year": file[i].payment.expiration_year,
                "card_expiry_full_year": `20${file[i].payment.expiration_year}`,
                "delivery_name": `${file[i].billing.first_name} ${file[i].billing.last_name}`,
                "template": false,
                "profile_name": file[i].profile_settings.profile_name,
                "profile_id": deviceID
            }
        }
        return profile;
    },

    fromMangoPreme: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].profileName,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i].telephone,
                    "email": file[i].email,
                    "first_name": file[i].name,
                    "last_name": file[i].name,
                    "address": file[i].address1,
                    "address_2": file[i].address2,
                    "address_3": file[i].address3,
                    "zip": file[i].zip,
                    "city": file[i].city,
                    "province": null,
                    "state": file[i].state,
                    "state_code": file[i].state,
                    "country": file[i].country,
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].name,
                    "card_number": file[i].cc,
                    "expiration_month": file[i].ccMonth,
                    "expiration_year": file[i].ccYear,
                    "card_cvv": file[i].cvv,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },

    toMangoPreme: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "id": file[i].profile_settings.profile_name,
                "profileName": file[i].profile_settings.profile_name,
                "name": `${file[i].billing.first_name} ${file[i].billing.last_name}`,
                "email": file[i].billing.email,
                "address1": file[i].billing.address,
                "address2": file[i].billing.address_2,
                "address3": file[i].billing.address_3,
                "zip": file[i].billing.zip,
                "city": file[i].billing.city,
                "country": file[i].billing.country,
                "state": file[i].billing.state,
                "telephone": file[i].billing.phone,
                "billing": {
                    "paypal": false,
                    "cc": file[i].payment.card_number,
                    "cvv": file[i].payment.card_cvv,
                    "ccMonth": file[i].payment.expiration_month,
                    "ccYear": file[i].payment.expiration_year,
                    "ccType": file[i].payment.card_type
                }
            }
        }
        return profile;
    },

    fromPolaris: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].name,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i].shipping.phone,
                    "email": file[i].email,
                    "first_name": file[i].shipping.first_name,
                    "last_name": file[i].shipping.last_name,
                    "address": file[i].shipping.address_line_1,
                    "address_2": file[i].shipping.address_line_2,
                    "address_3": file[i].shipping.company,
                    "zip": file[i].shipping.zipcode,
                    "city": file[i].shipping.city,
                    "province": null,
                    "state": file[i].shipping.state.label,
                    "state_code": file[i].shipping.state.value,
                    "country": file[i].shipping.country.label,
                    "country_code": file[i].shipping.country.value,
                    "area": null
                },
                "payment": {
                    "card_holder": `${file[i].shipping.first_name} ${file[i].shipping.last_name}`,
                    "card_number": file[i].card.number,
                    "expiration_month": file[i].card.expiry.month.label,
                    "expiration_year": file[i].card.expiry.year.label,
                    "card_cvv": file[i].card.cvv,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },

    toPolaris: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "name": file[i].profile_settings.profile_name,
                "uuid": deviceID,
                "email": file[i].billing.email,
                "shipping": {
                    "first_name": file[i].billing.first_name,
                    "last_name": file[i].billing.last_name,
                    "address_line_1": file[i].billing.address,
                    "address_line_2": file[i].billing.address_2,
                    "company": file[i].billing.address_3,
                    "state": {
                        "label": file[i].billing.state,
                        "value": file[i].billing.state_code
                    },
                    "country": {
                        "label": file[i].billing.state,
                        "value": file[i].billing.state_code
                    },
                    "phone": file[i].billing.phone,
                    "city": file[i].billing.city,
                    "zipcode": file[i].billing.zip
                },
                "billing": {
                    "first_name": file[i].billing.first_name,
                    "last_name": file[i].billing.last_name,
                    "address_line_1": file[i].billing.address,
                    "address_line_2": file[i].billing.address_2,
                    "company": file[i].billing.address_3,
                    "state": {
                        "label": file[i].billing.state,
                        "value": file[i].billing.state_code
                    },
                    "country": {
                        "label": file[i].billing.state,
                        "value": file[i].billing.state_code
                    },
                    "phone": file[i].billing.phone,
                    "city": file[i].billing.city,
                    "zipcode": file[i].billing.zip
                },
                "card": {
                    "number": file[i].payment.card_number,
                    "expiry": {
                        "month": {
                            "label": file[i].payment.expiration_month,
                            "value": Number(file[i].payment.expiration_month)
                        },
                        "year": {
                            "label": file[i].payment.expiration_year,
                            "value": file[i].payment.expiration_year
                        }
                    },
                    "cvv": file[i].payment.cvv
                },
                "sameAddress": true,
                "id": genPolarisID()
            }
        }
        return profile;
    },

    fromTohru: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].profileName,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i].phone,
                    "email": file[i].email,
                    "first_name": file[i].shippingFirstName,
                    "last_name": file[i].shippingLastName,
                    "address": file[i].shippingAddress1,
                    "address_2": file[i].shippingAddress2,
                    "address_3": null,
                    "zip": file[i].shippingZip,
                    "city": file[i].shippingCity,
                    "province": null,
                    "state": file[i].ShippingState,
                    "state_code": null,
                    "country": file[i].shippingCountry,
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].cardHolder,
                    "card_number": file[i].cardNumber,
                    "expiration_month": file[i].expiryMonth,
                    "expiration_year": file[i].expiryYear,
                    "card_cvv": file[i].cardCVV,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": file[i].oneCheckoutPer
                }
            }
        }
        return profile;
    },

    toTohru: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profileName": file[i].profile_settings.profile_name,
                "phone": file[i].billing.phone,
                "cardHolder": file[i].payment.card_holder,
                "cardNumber": file[i].payment.card_number,
                "expiryMonth": file[i].payment.expiration_month,
                "expiryYear": file[i].payment.expiration_year,
                "cardCVV": file[i].payment.card_cvv,
                "email": file[i].billing.email,
                "billingFirstName": file[i].billing.first_name,
                "billingLastName": file[i].billing.last_name,
                "billingAddress1": file[i].billing.address,
                "billingAddress2": file[i].billing.address2,
                "billingCountry": file[i].billing.country,
                "billingCity": file[i].billing.city,
                "billingState": file[i].billing.state,
                "billingZip": file[i].billing.zip,
                "shippingFirstName": file[i].billing.first_name,
                "shippingLastName": file[i].billing.last_name,
                "shippingAddress1": file[i].billing.address,
                "shippingAddress2": file[i].billing.address2,
                "shippingCountry": file[i].billing.country,
                "shippingCity": file[i].billing.city,
                "shippingState": file[i].billing.state,
                "shippingZip": file[i].billing.zip,
                "oneCheckoutPer": file[i].options.one_checkout
            }
        }
        return profile;
    },

    fromZephyr: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i].profile_name,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i].phone,
                    "email": file[i].email,
                    "first_name": file[i].first_name,
                    "last_name": file[i].last_name,
                    "address": file[i].address,
                    "address_2": file[i].address2,
                    "address_3": null,
                    "zip": file[i].zip,
                    "city": file[i].city,
                    "province": null,
                    "state": null,
                    "state_code": file[i].state,
                    "country": null,
                    "country_code": file[i].country,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i].cardHolder,
                    "card_number": file[i].card.number,
                    "expiration_month": (file[i].card.month.length == 1) ? "0" + file[i].card.month : file[i].card.month,
                    "expiration_year": file[i].card.year.substring(2, 4),
                    "card_cvv": file[i].card.cvv,
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": file[i].oneCheckoutPer
                }
            }
        }
        return profile;
    },


    toZephyr: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "zip": file[i].billing.zip,
                "country": file[i].billing.country_code,
                "address": file[i].billing.address,
                "city": file[i].billing.city,
                "address2": file[i].billing.address_2,
                "last_name": file[i].billing.last_name,
                "profile_name": file[i].profile_settings.profile_name,
                "phone": file[i].billing.phone,
                "state": file[i].billing.state_code,
                "sameShipping": true,
                "first_name": file[i].billing.first_name,
                "email": file[i].billing.email,
                "card": {
                    "zip": "",
                    "number": file[i].payment.card_number,
                    "country": file[i].billing.country,
                    "cvv": file[i].payment.card_cvv,
                    "address": "",
                    "month": (file[i].payment.expiry_month.charAt(0) == "0") ? file[i].payment.card_expiry_month.charAt(1) : file[i].payment.card_expiry_month,
                    "year": (file[i].payment.expiry_year.length == 2) ? "20" + file[i].payment.expiration_year : file[i].payment.expiration_year,
                    "city": "",
                    "last_name": "",
                    "state": file[i].billing.state_code,
                    "type": file[i].payment.card_type,
                    "first_name": ""
                }
            }
        }
        return profile;
    },

    /**
     * 
     * BOTS WITH CSV FILES
     * 
     */

    fromAIOMoji: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i]["Profile Name"],
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i]["Billing Phone"],
                    "email": file[i]["Email Address"],
                    "first_name": file[i]["Billing First Name"],
                    "last_name": file[i]["Billing Last Name"],
                    "address": file[i]["Billing Address"],
                    "address_2": file[i]["Billing Address Two"],
                    "address_3": null,
                    "zip": file[i]["Billing Postal"],
                    "city": file[i]["Billing City"],
                    "province": null,
                    "state": file[i]["Billing State"],
                    "state_code": null,
                    "country": null,
                    "country_code": file[i]["Billing Country"],
                    "area": null
                },
                "payment": {
                    "card_holder": `${file[i]["Billing First Name"]} ${file[i]["Billing Last Name"]}`,
                    "card_number": file[i]["Card Number"],
                    "expiration_month": file[i]["Expire Month"],
                    "expiration_year": file[i]["Expire Year"],
                    "card_cvv": file[i]["Card CVV"],
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },

    toAIOMoji: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                'Profile Name': file[i].profile_settings.profile_name,
                'Email Address': file[i].billing.email,
                'Shipping First Name': file[i].billing.first_name,
                'Shipping Last Name': file[i].billing.last_name,
                'Shipping Country': file[i].billing.country,
                'Shipping State': file[i].billing.state,
                'Shipping Address': file[i].billing.address,
                'Shipping Address Two': file[i].billing.address_2,
                'Shipping City': file[i].billing.city,
                'Shipping Postal': file[i].billing.zip,
                'Shipping Phone': file[i].billing.phone,
                'Same Billing': true,
                'Billing First Name': file[i].billing.first_name,
                'Billing Last Name': file[i].billing.last_name,
                'Billing Country': file[i].billing.country,
                'Billing State': file[i].billing.state,
                'Billing Address': file[i].billing.address,
                'Billing Address Two': file[i].billing.address_2,
                'Billing City': file[i].billing.city,
                'Billing Postal': file[i].billing.zip,
                'Billing Phone': file[i].billing.phone,
                'Card Number': file[i].payment.card_number,
                'Card CVV': file[i].payment.card_cvv,
                'Expire Month': file[i].payment.expiration_month,
                'Expire Year': file[i].payment.expiration_year,
                'Card Type': file[i].payment.card_type,
                'Custom State': ''
            }
        }
        return profile;
    },

    fromHawk: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i]["profile name"],
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i]["phone"],
                    "email": file[i]["email"],
                    "first_name": file[i]["first name"],
                    "last_name": file[i]["last name"],
                    "address": file[i]["address 1"],
                    "address_2": file[i]["address 2"],
                    "address_3": null,
                    "zip": file[i]["post code"],
                    "city": file[i]["city"],
                    "province": null,
                    "state": "",
                    "state_code": null,
                    "country": file[i]["country"],
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": file[i]["name on credit card(leave blank if paypal/manual)"],
                    "card_number": file[i]["credit card number(leave credit card fields blank if paypal/manual)"],
                    "expiration_month": file[i]["credit card month expiry"],
                    "expiration_year": file[i]["credit card year expiry"],
                    "card_cvv": file[i]["credit card cvv"],
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": file[i]["one checkout profile(true/false)"]
                }
            }
        }
        return profile;
    },

    toHawk: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                'profile name': file[i].profile_settings.profile_name,
                'email': file[i].billing.email,
                'first name': file[i].billing.first_name,
                'last name': file[i].billing.last_name,
                'address 1': file[i].billing.address,
                'address 2': file[i].billing.address_2,
                'city': file[i].billing.city,
                'post code': file[i].billing.zip,
                'country': file[i].billing.country,
                'phone': file[i].billing.phone,
                'name on credit card(leave blank if paypal/manual)': file[i].payment.card_holder,
                'credit card number(leave credit card fields blank if paypal/manual)': file[i].payment.card_number,
                'credit card month expiry': file[i].payment.expiration_month,
                'credit card year expiry': file[i].payment.expiration_year,
                'credit card cvv': file[i].payment.card_cvv,
                'paypal (true/false)': false,
                'manual checkout(true/false)': false,
                'one checkout profile(true/false)': file[i].options.one_checkout,
                'house number': ''
            }
        }
        return profile;
    },





    fromGanesh: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": `${file[i]["STORE"]}_profile`,
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i]["PHONE NUMBER"],
                    "email": file[i]["EMAIL"],
                    "first_name": file[i]["FIRST NAME"],
                    "last_name": file[i]["LAST NAME"],
                    "address": file[i]["ADDRESS LINE 1"],
                    "address_2": file[i]["ADDRESS LINE 2"],
                    "address_3": null,
                    "zip": file[i]["POSTCODE / ZIP"],
                    "city": file[i]["CITY"],
                    "province": null,
                    "state": file[i]["STATE"],
                    "state_code": null,
                    "country": null,
                    "country_code": file[i]["COUNTRY"],
                    "area": null
                },
                "payment": {
                    "card_holder": `${file[i]["FIRST NAME"]} ${file[i]["LAST NAME"]}`,
                    "card_number": file[i]["CARD NUMBER"],
                    "expiration_month": file[i]["EXPIRE MONTH"],
                    "expiration_year": file[i]["EXPIRE YEAR"],
                    "card_cvv": file[i]["CARD CVC"],
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": true
                }
            }
        }
        return profile;
    },

    toGanesh: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                'STORE': '',
                'MODE': '',
                'PRODUCT': 1,
                'SIZE': "ANY",
                'TIMER': '',
                'FIRST NAME': file[i].billing.first_name,
                'LAST NAME': file[i].billing.last_name,
                'EMAIL': file[i].billing.email,
                'PHONE NUMBER': file[i].billing.phone,
                'ADDRESS LINE 1': file[i].billing.address,
                'ADDRESS LINE 2': file[i].billing.address_2,
                'CITY': file[i].billing.city,
                'STATE': file[i].billing.state_code,
                'POSTCODE / ZIP': file[i].billing.zip,
                'COUNTRY': file[i].billing.country_code,
                'CARD NUMBER': file[i].payment.card_number,
                'EXPIRE MONTH': file[i].payment.expiration_month,
                'EXPIRE YEAR': file[i].payment.expiration_year,
                'CARD CVC': file[i].payment.card_cvv,
                'BILLING ADDRESS LINE 1': file[i].billing.address,
                'BILLING ADDRESS LINE 2': file[i].billing.address_2,
                'BILLING CITY': file[i].billing.city,
                'BILLING STATE': file[i].billing.state_code,
                'BILLING POSTCODE / ZIP': file[i].billing.zip,
                'BILLING COUNTRY': file[i].billing.country_code,
                'LIMIT': ''
            }
        }
        return profile;
    },


    fromECB: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                "profile_settings": {
                    "profile_name": file[i]["name"],
                    "profile_id": null
                },
                "billing": {
                    "phone": file[i]["phone"],
                    "email": file[i]["email"],
                    "first_name": file[i]["delivery__firstName"],
                    "last_name": file[i]["delivery__lastName"],
                    "address": file[i]["delivery__address1"],
                    "address_2": file[i]["delivery__address2"],
                    "address_3": null,
                    "zip": file[i]["delivery__zip"],
                    "city": file[i]["delivery__city"],
                    "province": null,
                    "state": null,
                    "state_code": file[i]["delivery__state"],
                    "country": file[i]["delivery__country"],
                    "country_code": null,
                    "area": null
                },
                "payment": {
                    "card_holder": `${file[i]["delivery__firstName"]} ${file[i]["delivery__lastName"]}`,
                    "card_number": file[i]["card__number"],
                    "expiration_month": file[i]["EXPIRE MONTH"],
                    "expiration_year": file[i]["card__expiryYear"],
                    "card_cvv": file[i]["card__cvv"],
                    "card_type": null
                },
                "paypal": {
                    "email": null,
                    "password": null
                },
                "options": {
                    "billing_same": true,
                    "isJapaneseAddress": null,
                    "isRussianAddress": null,
                    "isMexicanAddress": null,
                    "isPhilippinesAddress": null,
                    "date": null,
                    "checkout_limit": "No checkout limit",
                    "sizes": ["Random"],
                    "modes": ["Fast"],
                    "one_checkout": (file[i]["checkoutFreq"] == "ONCEPERSITE") ? true : false
                }
            }
        }
        return profile;
    },

    toECB: async function (file) {
        var profile = []
        for (var i = 0; i < file.length; i++) {
            profile[i] = {
                'name': file[i].profile_settings.profile_name,
                'email': file[i].billing.email,
                'phone': file[i].billing.phone,
                'billingDifferent': false,
                'checkoutFreq': "ONCEPERSITE",
                'card__number': file[i].payment.card_number,
                'card__expiryMonth': file[i].payment.expiration_month,
                'card__expiryYear': file[i].payment.expiration_year,
                'card__cvv': file[i].payment.card_cvv,
                'delivery__firstName': file[i].billing.first_name,
                'delivery__lastName': file[i].billing.last_name,
                'delivery__address1': file[i].billing.address,
                'delivery__address2': file[i].billing.address_2,
                'delivery__zip': file[i].billing.zip,
                'delivery__city': file[i].billing.city,
                'delivery__country': file[i].billing.country,
                'delivery__state': file[i].billing.state_code,
                'billing__firstName': file[i].billing.first_name,
                'billing__lastName': file[i].billing.last_name,
                'billing__address1': file[i].billing.address,
                'billing__address2': file[i].billing.address_2,
                'billing__zip': file[i].billing.zip,
                'billing__city': file[i].billing.city,
                'billing__country': file[i].billing.country,
                'billing__state': file[i].billing.state_code,
            }
        }
        return profile;
    },
}