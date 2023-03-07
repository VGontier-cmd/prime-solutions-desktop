function toast(type, message) {
    console.log(message)
    console.log($('#toast').hasClass('show'))
    if ($('#toast').hasClass('show')) return;
    else {
        $('#toast').addClass('show')
        $('#toast').text(message)
        $('#toast').css({
            'color': type == 'success' ? 'rgb(82, 255, 82)' : 'rgb(255, 77, 77)',
            'border-right': type == 'success' ? '10px solid rgb(82, 255, 82)' : '10px solid rgb(255, 77, 77)'
        })
        //Display toast 
        $('#toast').fadeIn("slow")
        setTimeout(() => {
            $('#toast').fadeOut("slow");
            $('#toast').removeClass('show')
        }, 3500);
    }
};

ipcRenderer.on('toast', (e, [type, status]) => toast(type, status))

$('.bell, .close-frame').click((e) => {
    $('.notifications').toggleClass('notifications-active')
    if ($('.notifications').hasClass('notifications-active')) {
        $('.notifications-center .noti-title').animate({
            opacity: 1,
            fontSize: "0.8rem"
        }, 100)
        $('.notifications-center .footer button').animate({
            opacity: 1
        }, 100)
        setTimeout(() => {
            $('.notifications-center .notification').animate({
                opacity: 1,
                fontSize: "0.8rem"
            }, 500)
        }, 600)
        setTimeout(()=>{
            $('.close-frame').animate({
                opacity: 1
            }, 500)
        },600)
    } else {
        $('.notifications-center .noti-title').animate({
            opacity: 0,
            fontSize: "0.2rem"
        }, 100)

        $('.notifications-center .notification').animate({
            opacity: 0,
            fontSize: "0.2rem"
        }, 100)

        $('.notifications-center .footer button').animate({
            opacity: 0
        }, 500)
        
        $('.close-frame').animate({
            opacity: 0
        }, 500)
    }
})
var notificationsList = (localStorage.getItem('notifications')) ? JSON.parse(localStorage.getItem('notifications')) : []

addDeleteEvents();
updateNotificationsDisplay();

function updateNotificationsDisplay() {
    $("#notification-body .notification").remove();
    for (var i = 0; i < notificationsList.length; i++) {
        $("#notification-body").append(`
            <div class="notification">
                <div class="title">${notificationsList[i].title}</div>
                <div data-id="${i}" class="delete-notif">X</div>
                <div class="content">
                    <div class="circle c-${notificationsList[i].color}"></div>
                    <div class="desc">${notificationsList[i].desc}</div>
                    <div class="date">${notificationsList[i].date}</div>
                </div>
            </div>
        `)
    }
    $('.notifications').attr('data-content', notificationsList.length)
    localStorage.setItem('notifications', JSON.stringify(notificationsList));
    addDeleteEvents();
}

function addNotification(title, desc, color) {
    notificationsList.push({
        "title": title,
        "desc": desc,
        "color": color,
        "date": `${(new Date().getHours()).toString().padStart(2, '0')}:${(new Date().getMinutes()).toString().padStart(2, '0')}`
    })
    console.log(notificationsList)
    updateNotificationsDisplay()
}

function removeAllNotifications() {
    notificationsList = []
    updateNotificationsDisplay()
}

function addDeleteEvents() {
    $('.delete-notif').click((e) => {
        console.log(e.target)
        notificationsList == notificationsList.splice(e.target.dataset.id, 1)
        updateNotificationsDisplay();
    })
}

$('.clear-all-notifs').click((e) => {
    notificationsList = []
    updateNotificationsDisplay();
})