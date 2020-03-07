'use strict';

const ports = [];
chrome.runtime.onConnect.addListener(port => {
  ports.push(port);
  port.onDisconnect.addListener(p => {
    const i = ports.indexOf(p);
    if (i !== -1) {
      ports.splice(i, 1);
    }
  });
});

chrome.browserAction.onClicked.addListener(() => {
  if (ports.length) {
    const tab = ports[0].sender.tab;
    chrome.windows.update(tab.windowId, {
      focused: true
    });
    chrome.tabs.update(tab.id, {
      active: true
    });
  }
  else {
    chrome.storage.local.get({
      mode: 'tab'
    }, ({mode}) => {
      if (mode === 'tab') {
        chrome.tabs.create({
          url: 'data/commander/index.html'
        });
      }
      else if (mode === 'window') {
        chrome.storage.local.get({
          'window.width': 750,
          'window.height': 500,
          'window.left': screen.availLeft + Math.round((screen.availWidth - 700) / 2),
          'window.top': screen.availTop + Math.round((screen.availHeight - 500) / 2)
        }, prefs => {
          chrome.windows.create({
            url: chrome.extension.getURL('data/commander/index.html?mode=window'),
            width: prefs['window.width'],
            height: prefs['window.height'],
            left: prefs['window.left'],
            top: prefs['window.top'],
            type: 'popup'
          });
        });
      }
    });
  }
});

{
  const startup = () => chrome.storage.local.get({
    'mode': 'tab',
    'popup.width': 800,
    'popup.height': 600
  }, prefs => {
    chrome.contextMenus.create({
      id: 'mode-tab',
      title: 'Open in Tab',
      contexts: ['browser_action'],
      type: 'radio',
      checked: prefs.mode === 'tab'
    });
    chrome.contextMenus.create({
      id: 'mode-window',
      title: 'Open in Window',
      contexts: ['browser_action'],
      type: 'radio',
      checked: prefs.mode === 'window'
    });
    chrome.contextMenus.create({
      id: 'mode-popup',
      title: 'Open in Popup',
      contexts: ['browser_action'],
      type: 'radio',
      checked: prefs.mode === 'popup'
    });
    if (prefs.mode === 'popup') {
      chrome.browserAction.setPopup({
        popup: `data/commander/index.html?mode=popup&width=${prefs['popup.width']}&height=${prefs['popup.height']}`
      });
    }
  });
  chrome.runtime.onInstalled.addListener(startup);
  chrome.runtime.onStartup.addListener(startup);
}
chrome.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId.startsWith('mode-')) {
    chrome.storage.local.set({
      mode: info.menuItemId.replace('mode-', '')
    });
  }
});

chrome.storage.onChanged.addListener(ps => {
  if (ps.mode) {
    chrome.storage.local.get({
      'popup.width': 800,
      'popup.height': 600
    }, prefs => {
      chrome.browserAction.setPopup({
        popup: ps.mode.newValue === 'popup' ?
          `data/commander/index.html?mode=popup&width=${prefs['popup.width']}&height=${prefs['popup.height']}` :
          ''
      });
    });
  }
});
/* FAQs & Feedback */
{
  const {onInstalled, setUninstallURL, getManifest} = chrome.runtime;
  const {name, version} = getManifest();
  const page = getManifest().homepage_url;
  if (navigator.webdriver !== true) {
    onInstalled.addListener(({reason, previousVersion}) => {
      chrome.storage.local.get({
        'faqs': true,
        'last-update': 0
      }, prefs => {
        if (reason === 'install' || (prefs.faqs && reason === 'update')) {
          const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
          if (doUpdate && previousVersion !== version) {
            chrome.tabs.create({
              url: page + '?version=' + version +
                (previousVersion ? '&p=' + previousVersion : '') +
                '&type=' + reason,
              active: reason === 'install'
            });
            chrome.storage.local.set({'last-update': Date.now()});
          }
        }
      });
    });
    setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}
