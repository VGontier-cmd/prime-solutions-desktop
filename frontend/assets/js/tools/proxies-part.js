//Load proxies of the current view
refreshProxyView();
$("#proxies-list").change(function () {
    refreshProxyView();
});



//Add a new proxy list 
function addProxyList() {
    if (!$('#proxyListName').val()) return;
    else {
        proxyList = ipcRenderer.sendSync('addProxyList', $('#proxyListName').val().replace(/\s+/g, ' ').replace(/\s/g, '_'));
        $('.proxyList option').remove();
        for (var key in proxyList)
            $('.proxyList').append(new Option(key, key));
        addLocalhostList()
        toast('success', `Proxy list "${$('#proxyListName').val()}" has been created !`)
    }
}

//Load proxies from the selected list
async function refreshProxyView() {
    var activeProxyList = $("#proxies-list option:selected").val()
    var proxylist = ipcRenderer.sendSync('getProxyList', null)
    $('.proxyList option').remove();
    if (!jQuery.isEmptyObject(proxylist)) {
        //add other lists
        for (var key in proxylist) {
            console.log(key)
            $('.proxyList').append(new Option(key, key));
            if (activeProxyList == key)
                $("#proxies-list option[value=" + key + "]").prop('selected', true)
        }
        console.log($("#proxies-list option:selected").val())
        var proxies = ipcRenderer.sendSync('getProxies', $("#proxies-list option:selected").val());
        $('#proxies-tbody tr').remove();
        for (var index = 0; index < proxies.length; index++) {
            //get current proxy
            var proxy = proxies[index].split(':');
            //cut display if elements are too long 
            async function asyncForEach(array, callback) {
                for (let index = 0; index < array.length; index++) {
                    await callback(array[index], index, array);
                }
            }

            function checkLength(element) {
                return (element.length <= 20) ? element : `${element.slice(0,20)}...`
            }
            //append tr element
            $('#proxies-tbody').append(`
            <tr id="proxy-id-` + index + `">
                <td>` + index + `</td>
                <td>` + ((await proxy[0]) ? checkLength(proxy[0]) : '/') + `</td>
                <td>` + ((await proxy[1]) ? checkLength(proxy[1]) : '/') + `</td>
                <td>` + ((await proxy[2]) ? checkLength(proxy[2]) : '/') + `</td>
                <td>` + ((await proxy[3]) ? checkLength(proxy[3]) : '/') + `</td>
                <td><p class="status">Idle</p></td>
                <td><img data-index="` + index + `" src="../assets/img/trash.png" onclick="deleteProxy(this)" /></td>
            </tr>
            `);
        }
        //Update the dashboard proxies number 
        var number = ipcRenderer.sendSync('getProxiesNumber', null);
        $('.proxies-loaded .number').text(number);
        addLocalhostList()

    } else {
        addLocalhostList()
        $('#proxies-tbody tr').remove();
    }



}

function addLocalhostList() {
    $('.proxyList').each((index) => {
        if ($('.proxyList')[index].dataset.localhost != "1")
            $('.proxyList')[index].append(new Option("localhost", "localhost"));
    })
}

//Add proxies to the current list 
function addProxies() {
    var proxies = $('#proxies-textarea').val().split("\n");

    var proxyList = $("#proxies-list option:selected").val()
    if (proxies && proxyList) {
        var arg = {
            "proxyList": proxyList,
            "proxies": proxies
        }
        ipcRenderer.sendSync('addProxies', arg);
        refreshProxyView();
    } else
    if (!proxyList)
        toast("error", "You need to create a proxy list before adding proxies")

}

function deleteProxylist() {
    if ($("#proxies-list option:selected").val()) ipcRenderer.sendSync('deleteProxyList', $("#proxies-list option:selected").val());
    const deletedList = $("#proxies-list option:selected").val();
    if (deletedList) {
        toast("success", `Proxy list "${deletedList}"deleted with success!`)
        refreshProxyView();
        addNotification("Proxies", `Your proxy list ${deletedList} has been deleted`, "blue")
    }

}

function deleteProxy(e) {
    console.log(e)
    var arg = {
        "proxyList": $("#proxies-list option:selected").val(),
        "index": e.dataset.index
    }
    ipcRenderer.send('deleteProxy', arg);
    $(`#proxy-id-${e.dataset.index}`).remove();
}

async function testProxies() {
    var proxies = ipcRenderer.sendSync('getProxies', $("#proxies-list option:selected").val());
    var website = $('#website-testing').val();
    var i = 0;
    var urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)
    if (proxies) {
        if (website.length > 0) {
            if (website.match(urlRegex))
                for await (let proxy of proxies) {
                    $("#proxy-id-" + (i) + " .status").text("Idle")
                    proxyPart = proxy.split(':');
                    await sendRequest(i, proxyPart, website)
                    i++;
                }
            else
                toast("error", "Please enter a valid url")
        } else
            toast("error", "Please enter a website before testing your proxies")
    } else
        toast("error", "You need to add proxies before testing them")



}

function sendRequest(index, proxyPart, website) {
    var proxyUrl = (proxyPart[2] && proxyPart[3]) ? "http://" + proxyPart[2] + ":" + proxyPart[3] + "@" + proxyPart[0] + ":" + proxyPart[1] : "http://" + proxyPart[0] + ":" + proxyPart[1]
    var proxiedRequest = request.defaults({
        'proxy': proxyUrl,
        time: true
    });
    try {
        var beforeRequest = performance.now();
        proxiedRequest(website, function (err, res, body) {
            try {
                var display = $("#proxy-id-" + (index) + " p")
                display.removeClass();
                display.addClass('status')
                if (res.statusCode == 200) {
                    // var time = Math.ceil(performance.now() - beforeRequest);
                    const time = res.elapsedTime
                    var displayText = (time > 2000) ? "BAD" : "OK"
                    display.text(displayText + "(" + time + ")ms")
                    display.addClass((time > 2000) ? "error" : "valid");
                } else
                    display.text(`PROXY ERROR (${res.statusCode})`);
                display.addClass('error');
            } catch (e) {
                display.text(`PROXY ERROR ${e}`);
                display.addClass('error');
            }
        })
    } catch (e) {
        display.text(`PROXY ERROR ${e}`);
        display.addClass('error');
    }
    return true;
}