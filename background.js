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
            url: chrome.extension.getURL('data/commander/index.html'),
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
        popup: `data/commander/index.html?width=${prefs['popup.width']}&height=${prefs['popup.height']}`
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
          `data/commander/index.html?width=${prefs['popup.width']}&height=${prefs['popup.height']}` :
          ''
      });
    });
  }
});
