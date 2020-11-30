/* global engine */
'use strict';

const args = new URLSearchParams(location.search);
if (args.has('width')) {
  document.documentElement.style.width = args.get('width') + 'px';
}
if (args.has('height')) {
  document.documentElement.style.height = args.get('height') + 'px';
}

const title = {
  'directory-view-1': '...',
  'directory-view-2': '...'
};

/* events */
// persist last visited paths and update title
document.addEventListener('directory-view:path', e => {
  const {detail} = e;
  const id = e.target.getAttribute('id');
  title[id] = detail.arr[detail.arr.length - 1].title;
  document.title = '[L] ' + title['directory-view-1'] + ' [R] ' + title['directory-view-2'];
  engine.storage.set({
    [id]: detail.id
  });
});
// user-action
document.addEventListener('directory-view:submit', e => {
  const {detail} = e;
  detail.entries.forEach(o => {
    if (o.type === 'DIRECTORY' && detail.entries.length === 1) {
      const {id, openerId} = detail.entries[0];
      if (openerId) {
        e.target.build(id, undefined, [openerId]);
      }
      else {
        e.target.build(id);
      }
    }
    else if (o.type === 'FILE') {
      if (detail.metaKey || detail.ctrlKey) {
        engine.tabs.create({
          url: o.url,
          active: false
        });
      }
      else {
        if (args.get('mode') === 'window') {
          engine.tabs.active().then(tab => engine.tabs.update(tab.id, {
            url: o.url
          })).catch(() => engine.tabs.create({
            url: o.url
          })).finally(() => window.close());
        }
        else {
          engine.tabs.update(undefined, {
            url: o.url
          });
        }
      }
    }
  });
});
document.addEventListener('directory-view:selection-changed', () => views.changed());
document.addEventListener('tools-view:command', e => {
  command(e.detail.command, {
    shiftKey: e.detail.shiftKey
  });
  views.active().click();
});

engine.user.on('blur', () => views.active().click());

/* views */
const views = {
  'parent': document.getElementById('directories'),
  'left': document.getElementById('directory-view-1'),
  'right': document.getElementById('directory-view-2'),
  active(reverse = false) {
    let e = document.querySelector('input:checked + directory-view');
    if (reverse) {
      e = document.querySelector('input:not(:checked) + directory-view');
    }
    return e || views.left;
  },
  changed() {
    const active = views.active();

    const direction = active === views.left ? 'LEFT' : 'RIGHT';
    const entries = active.entries();

    const readonly = entries.some(o => o.readonly === 'true');
    const directory = entries.some(o => o.type === 'DIRECTORY');
    const file = entries.some(o => o.type === 'FILE');

    // move-left or move-right
    if (readonly) {
      toolsView.state('move-left', false);
      toolsView.state('move-right', false);
    }
    else {
      /* move-left or move-right*/
      for (const moveTo of ['left', 'right']) {
        let move = direction !== moveTo.toUpperCase();
        // cannot move to the root directory
        if (move && views[moveTo].isRoot()) {
          move = false;
        }
        // cannot move to a search directory
        if (move && views[moveTo].isSearch()) {
          move = false;
        }
        // cannot move a directory to a child directory
        if (move && directory) {
          const d = views[moveTo].list();
          // if any selected directory is in the path of destination directory, prevent moving
          if (entries.some(e => d.some(de => de.id === e.id))) {
            move = false;
          }
        }
        toolsView.state('move-' + moveTo, move);
      }
    }
    // delete
    toolsView.state('trash', readonly === false);
    // sort
    toolsView.state('sort', active.isRoot() === false && active.count > 1 && active.isSearch() === false);
    // copy-link
    toolsView.state('copy-link', file);
    // edit-link
    toolsView.state('edit-link', readonly === false && file && entries.length === 1);
    // edit-title
    toolsView.state('edit-title', readonly === false && entries.length === 1);
    // new-file
    toolsView.state('new-file', active.isRoot() || active.isSearch() ? false : true);
    // new-directory (test; create directory on [..])
    toolsView.state('new-directory', active.isRoot() || active.isSearch() ? false : true);
  },
  update() {
    views.left.update(views.left.id());
    views.right.update(views.right.id());
  }
};
const toolsView = document.getElementById('tools-view');

/* restore, and active a pane after DOM content is loaded */
Promise.all([
  new Promise(resolve => document.addEventListener('DOMContentLoaded', engine.storage.get({
    'directory-view-1': '',
    'directory-view-2': ''
  }).then(prefs => {
    Object.entries(prefs).forEach(([name, id]) => {
      const e = document.getElementById(name);
      if (e) {
        e.build(id);
      }
    });
    resolve();
  }))),
  new Promise(resolve => window.addEventListener('load', resolve))
]).then(() => views.left.click());

/* on command */
const command = async (command, e) => {
  const view = views.active();
  if (view) {
    const entries = view.entries();
    // copy-title
    if (command === 'copy-title') {
      engine.clipboard.copy(entries.map(o => o.title).join('\n'));
    }
    // copy-id
    else if (command === 'copy-id') {
      engine.clipboard.copy(entries.map(o => o.id).join('\n'));
    }
    // copy-link
    else if (command === 'copy-link') {
      engine.clipboard.copy(entries.map(o => o.url).filter(a => a).join('\n'));
    }
    // edit-title
    else if (command === 'edit-title' || command === 'edit-link') {
      const entry = entries[0];
      let o = {};
      if (command === 'edit-title') {
        const title = await engine.user.ask('Edit Title', entry.title);
        o = {title};
        if (title === entry.title || title === '') {
          return;
        }
      }
      else {
        const url = await engine.user.ask('Edit Link', entry.url);
        o = {url};
        if (url === entry.url || url === '') {
          return;
        }
      }
      engine.bookmarks.update(entry.id, o).catch(engine.notify).finally(() => {
        // we need to update both views
        views.update();
      });
    }
    else if (command === 'move-left' || command === 'move-right') {
      const s = command === 'move-left' ? views.right : views.left;
      const d = command === 'move-right' ? views.right : views.left;
      const toBeMoved = s.entries();
      s.navigate('previous');
      for (const entry of toBeMoved) {
        await engine.bookmarks.move(entry.id, {
          parentId: d.id(),
          index: Number(d.entries()[0].index) + 1
        }).catch(engine.notify);
      }
      // update both views
      views.update();
    }
    else if (command === 'root') {
      if (e.shiftKey) {
        engine.storage.set({
          [view.getAttribute('id')]: ''
        }).then(() => {
          view.build(engine.bookmarks.rootID);
        });
      }
      else {
        engine.storage.set({
          'directory-view-1': '',
          'directory-view-2': ''
        }).then(() => location.reload());
      }
    }
    else if (command === 'new-file' || command === 'new-directory') {
      const entry = entries[0];
      const o = {
        parentId: view.id(),
        index: Number(entry.index) + 1
      };
      if (command === 'new-file') {
        const title = ((await engine.user.ask('Title of New Bookmark', entry.title)) || '').trim();
        if (!title) {
          return;
        }
        o.title = title;
        const url = ((await engine.user.ask('URL of New Bookmark', entry.url || 'https://www.example.com')) || '').trim();
        if (!url) {
          return;
        }
        o.url = url;
      }
      else {
        const title = ((await engine.user.ask('Title of New Directory', entry.title)) || '').trim();
        if (title) {
          o.title = title;
        }
        else {
          return;
        }
      }
      engine.bookmarks.create(o).then(() => {
        // update both views
        views.update();
      }, engine.notify);
    }
    else if (command === 'trash') {
      view.navigate('previous');
      for (const entry of entries) {
        await engine.bookmarks.remove(entry.id).catch(e => {
          if (entry.type === 'DIRECTORY') {
            if (window.confirm(`"${entry.title}" directory is not empty. Remove anyway?`)) {
              engine.bookmarks.remove(entry.id, true).catch(engine.notify);
            }
          }
          else {
            engine.notify(e);
          }
        });
      }
      views.update();
    }
    else if (command === 'mirror') {
      views[view === views.left ? 'right' : 'left'].build(view.id());
    }
    else if (command === 'search') {
      const id = view.id();
      let value = '';
      if (e.shiftKey) {
        value = 'duplicates';
      }
      else if (id.query) {
        value = id.query;
      }

      engine.user.ask(
        'Search For:\n\nUse "duplicates" keyword to find duplicated bookmarks in the current tree)',
        value
      ).then(query => query && view.build({query}));
    }
    else if (command === 'sort') {
      const entries = view.entries(false);
      const sort = list => {
        return list.sort((a, b) => {
          if (e.shiftKey) {
            return ('' + b.title).localeCompare(a.title + '');
          }
          return ('' + a.title).localeCompare(b.title + '');
        });
      };
      const directories = sort(entries.filter(e => e.readonly === 'false' && e.type === 'DIRECTORY'));
      const files = sort(entries.filter(e => e.readonly === 'false' && e.type === 'FILE'));

      let index = 0;
      for (const directory of directories) {
        await engine.bookmarks.move(directory.id, {
          parentId: view.id(),
          index
        }).then(() => index += 1).catch(engine.notify);
      }
      for (const file of files) {
        await engine.bookmarks.move(file.id, {
          parentId: view.id(),
          index
        }).then(() => index += 1).catch(engine.notify);
      }
      // update both views
      views.update();
    }
  }
};

/* keyboard */
document.addEventListener('keydown', e => {
  // toggle between views by Tab
  if (e.key === 'Tab') {
    const view = views.active(true);
    e.preventDefault();
    if (view) {
      return view.click();
    }
  }
  // move to the left view with arrow key
  else if (e.code === 'ArrowLeft' && e.shiftKey === false && e.ctrlKey === false && e.metaKey === false) {
    views.left.click();
  }
  // move to the left view with arrow key
  else if (e.code === 'ArrowRight' && e.shiftKey === false && e.ctrlKey === false && e.metaKey === false) {
    views.right.click();
  }
  // toggle between views by Ctrl + Digit
  else if (e.code === 'Digit1' && (e.metaKey || e.ctrlKey)) {
    views.left.click();
    e.preventDefault();
  }
  else if (e.code === 'Digit2' && (e.metaKey || e.ctrlKey)) {
    views.right.click();
    e.preventDefault();
  }
  toolsView.command(e, command);
});
// on active view change
views.parent.addEventListener('change', () => {
  views.changed();
});

// select view on tools empty space
toolsView.addEventListener('click', () => views.active().click());

// remember last state
if (args.get('mode') === 'window') {
  chrome.runtime.getBackgroundPage(bg => {
    window.onbeforeunload = () => bg.save({
      'window.left': window.screenX,
      'window.top': window.screenY,
      'window.width': window.outerWidth,
      'window.height': window.outerHeight
    });
  });
}

// styling
const styling = () => engine.storage.get({
  'font-size': 12,
  'font-family': 'Arial, "Helvetica Neue", Helvetica, sans-serif',
  'user-styles': '',
  'views': 2
}).then(prefs => {
  document.body.dataset.views = prefs.views;
  document.getElementById('user-styles').textContent = `
    body {
      font-size: ${prefs['font-size']}px;
      font-family: ${prefs['font-family']};
    }
    ${prefs['user-styles']}
  `;
});
styling();
engine.storage.changed(ps => {
  if (ps['font-size'] || ps['font-family'] || ps['user-styles'] || ps['views']) {
    styling();
  }
});
