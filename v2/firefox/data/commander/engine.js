'use strict';

const bookmarks = {
  rootID: /Firefox/.test(navigator.userAgent) ? 'root________' : '0',
  isRoot(id) {
    return id === '' || id === bookmarks.rootID;
  },
  isSearch(id) {
    return Boolean(id.query);
  },
  parent(id) {
    return new Promise((resolve, reject) => {
      chrome.bookmarks.get(id, arr => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          reject(lastError);
        }
        else {
          resolve(arr[0]);
        }
      });
    });
  },
  async hierarchy(id) {
    const cache = [];
    if (bookmarks.isSearch(id)) {
      let title = 'Search: ' + id.query;
      if (id.query.startsWith('duplicates')) {
        const openerId = id.query.replace('duplicates:', '') || bookmarks.rootID;
        title = `Duplicates for "${openerId}"`;
      }
      cache.push({
        title,
        id
      });
    }
    else {
      while (this.isRoot(id) === false) {
        const node = await bookmarks.parent(id);
        id = node.parentId;
        cache.unshift(node);
      }
      cache.unshift({
        title: '/',
        id: bookmarks.rootID
      });
    }

    return cache;
  },
  children(id) {
    // duplicate finder
    if (id.query && id.query.startsWith('duplicates')) {
      let openerId = id.query.replace('duplicates:', '') || bookmarks.rootID;
      if (/Firefox/.test(navigator.userAgent)) {
        if (typeof openerId !== 'string' || openerId.trim() === '') {
          openerId = bookmarks.rootID;
        }
      }
      else if (isNaN(openerId)) { // Chrome
        openerId = bookmarks.rootID;
      }
      return new Promise(resolve => chrome.bookmarks.getSubTree(openerId, children => {
        const links = {};
        const swipe = (root, path = '.') => {
          for (const node of root.children) {
            if ('children' in node) {
              swipe(node, path + '/' + (node.title || ''));
            }
            else if (node.url) {
              links[node.url] = links[node.url] || [];
              node.relativePath = path.replace('.//', '/');
              links[node.url].push(node);
            }
          }
        };
        swipe({
          children
        });
        return resolve(Object.values(links).filter(nodes => nodes.length > 1).flat());
      }));
    }
    else if (id.query) {
      return new Promise(resolve => chrome.bookmarks.search({
        query: id.query
      }, async nodes => {
        for (const node of nodes) {
          const arr = await bookmarks.hierarchy(node.id);
          arr.shift();
          arr.pop();
          node.relativePath = ['', ...arr, ''].map(n => n.title).join('/');
        }
        resolve(nodes);
      }));
    }
    return new Promise((resolve, reject) => {
      chrome.bookmarks.getChildren(id, nodes => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          reject(lastError);
        }
        else {
          // You cannot use this API to add or remove entries in the root folder.
          if (id === '' || id === bookmarks.rootID) {
            nodes.forEach(n => n.readonly = true);
          }
          resolve(nodes);
        }
      });
    });
  },
  tree(id) {
    return new Promise((resolve, reject) => {
      chrome.bookmarks.getSubTree(id, nodes => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          reject(lastError);
        }
        else {
          resolve(nodes);
        }
      });
    });
  },
  update(id, o) {
    return new Promise((resolve, reject) => chrome.bookmarks.update(id, o, nodes => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        reject(lastError);
      }
      else {
        resolve(nodes);
      }
    }));
  },
  move(id, o) {
    return new Promise((resolve, reject) => chrome.bookmarks.move(id, o, node => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        reject(lastError);
      }
      else {
        resolve(node);
      }
    }));
  },
  create(o) {
    return new Promise((resolve, reject) => chrome.bookmarks.create(o, node => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        reject(lastError);
      }
      else {
        resolve(node);
      }
    }));
  },
  remove(id, recursive = false) {
    return new Promise((resolve, reject) => chrome.bookmarks[recursive ? 'removeTree' : 'remove'](id, () => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        reject(lastError);
      }
      else {
        resolve();
      }
    }));
  }
};

const tabs = {
  create(o) {
    return new Promise(resolve => chrome.tabs.create(o, resolve));
  },
  update(id, o) {
    return new Promise(resolve => chrome.tabs.update(id, o, resolve));
  },
  active() {
    return new Promise((resolve, reject) => chrome.tabs.query({
      active: true,
      windowType: 'normal'
    }, tabs => tabs.length ? resolve(tabs[0]) : reject(Error('no active tab'))));
  }
};

const windows = {
  create(o) {
    return new Promise(resolve => chrome.windows.create(o, resolve));
  }
};

const storage = {
  get(o) {
    return new Promise(resolve => chrome.storage.local.get(o, resolve));
  },
  set(o) {
    return new Promise(resolve => chrome.storage.local.set(o, resolve));
  },
  changed(callback) {
    chrome.storage.onChanged.addListener(callback);
  }
};

const ue = document.querySelector('prompt-view');
const user = {
  ask(msg, value) {
    return ue.ask(msg, value);
  },
  on(name, callback) {
    ue.on(name, callback);
  }
};

window.engine = {
  bookmarks,
  tabs,
  windows,
  storage,
  user,
  notify(e) {
    if (e === 'beep') {
      return (new Audio('/data/assets/bell.wav')).play();
    }
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/data/icons/48.png',
      title: chrome.runtime.getManifest().name,
      message: e.message || e
    });
  },
  clipboard: {
    copy(str) {
      return navigator.clipboard.writeText(str).catch(() => new Promise(resolve => {
        document.oncopy = e => {
          e.clipboardData.setData('text/plain', str);
          e.preventDefault();
          resolve();
        };
        document.execCommand('Copy', false, null);
      }));
    },
    read() {
      return navigator.clipboard.readText();
    }
  },
  download(content, name, type) {
    const a = document.createElement('a');
    const b = new Blob([content], {
      type
    });
    a.href = URL.createObjectURL(b);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
};
