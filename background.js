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
    chrome.tabs.create({
      url: 'data/commander/index.html'
    });
  }
});
