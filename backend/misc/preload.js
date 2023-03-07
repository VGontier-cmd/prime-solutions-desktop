const { ipcRenderer, remote } = require('electron');
require('./stealth')
require('./autoFill')

const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1';
const altAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.165 Safari/537.36';

Object.defineProperty(navigator, 'userAgent', {
    get: () => {
        return userAgent;
    }
});

Object.defineProperty(navigator, 'appVersion', {
    get: () => {
        return userAgent;
    }
});
history.pushState = (f => function pushState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('pushstate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
})(history.pushState);
history.replaceState = (f => function replaceState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('replacestate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
})(history.replaceState);
window.addEventListener('popstate',()=>{
    window.dispatchEvent(new Event('locationchange'))
});

window.addEventListener('locationchange', () => ipcRenderer.send('browser:urlchanged', remote.getCurrentWindow().id, location.href))
