/* global engine */
// the [..] rows double as navigation controls; Alt+← (the browser's Back
// button) also moves a single pane back, see issues #50/#51
const navigationTip = "Tip: Alt+← or the browser's Back button does the same.";
// the root container has no title in Chrome; the breadcrumb names that spot '/'
const quoted = name => name === '/' ? 'the top level' : '"' + name + '"';
class DirectoryView extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({
      mode: 'open'
    });
    shadow.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
        }
        list-view {
          flex: 1;
          overflow: hidden;
        }
        #count {
          color: var(--disabled-color, #a0a0a0);
          text-shadow: 1px 1px var(--disabled-shadow, #fcffff);
          margin: 0 2px;
          font-size: 80%;
          height: 100%;
        }
      </style>
      <path-view style="--height: 32px">
        <span id="count">-</span>
      </path-view>
      <list-view></list-view>
    `;
    this.listView = shadow.querySelector('list-view');
    this.CountElement = shadow.getElementById('count');

    // events
    const onsubmit = e => this.emit('directory-view:submit', e.detail);
    this.listView.addEventListener('submit', onsubmit);
    this.listView.addEventListener('selection-changed', () => this.emit('directory-view:selection-changed'));
    this.listView.addEventListener('drop-request', e => this.emit('directory-view:drop-request', e.detail));
    this.listView.addEventListener('command', e => this.emit('directory-view:command', e.detail));

    this.pathView = shadow.querySelector('path-view');
    this.pathView.addEventListener('change', e => onsubmit({
      detail: {
        entries: [{
          id: e.target.value.id,
          type: 'DIRECTORY'
        }]
      }
    }));
    // focus the list-view element
    this.addEventListener('click', () => {
      this.listView.focus();
    });
  }
  emit(name, detail) {
    return this.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail
    }));
  }
  // the folder the current search was launched from; undefined when not searching.
  // repeated searches nest: {id: {id: '123', query: 'q1'}, query: 'q2'}
  // note: should not call this.isSearch since its `id || this.id()` fallback
  // cannot match a root folder id ('') and would loop forever while unwrapping
  searchOrigin(id = this.id()) {
    if (engine.bookmarks.isSearch(id) === false) {
      return;
    }
    while (id && engine.bookmarks.isSearch(id)) {
      id = id.id;
    }
    return id || '';
  }
  async buildPathView(id, arr) {
    // store path only if it is needed
    if (!arr) {
      arr = await engine.bookmarks.hierarchy(id);
      this.emit('directory-view:path', {
        id,
        arr
      });
    }
    this.arr = arr;
    this.pathView.build(arr);
  }
  // if update, then selected elements are persistent
  async buildListView(id, update = false, selectedIDs = []) {
    const method = update ? 'update' : 'build';
    // compute it before try so that the catch block below has it as well
    const origin = this.isSearch(id) ? 'search' : (
      this.isRoot(id) ? 'root' : 'other'
    );
    try {
      // add openerId to empty "duplicates" queries
      if (id.query && id.query === 'duplicates') {
        let openerId = this.id();
        if (/Firefox/.test(navigator.userAgent)) {
          if (typeof openerId !== 'string' || openerId.trim() === '') {
            openerId = engine.bookmarks.rootID;
          }
        }
        else if (isNaN(openerId)) { // Chrome
          openerId = engine.bookmarks.rootID;
        }
        id.query += ':' + openerId;
      }
      const nodes = await engine.bookmarks.children(id);
      this.count = this.CountElement.textContent = nodes.length;
      if (this.isSearch(id)) {
        const folder = this.searchOrigin(id);
        const name = await engine.bookmarks.name(folder);
        nodes.unshift({
          title: '← Dismiss Search. Go to ' + quoted(name),
          id: folder,
          index: -1,
          readonly: true,
          hint: 'Dismiss the search results and go back to ' + quoted(name) + '.\n\n' + navigationTip
        });
      }
      else if (this.isRoot(id) === false) {
        const parent = await engine.bookmarks.parent(id);
        // static label; the breadcrumb above already shows where this leads
        nodes.unshift({
          title: '← Go to parent directory',
          id: parent.parentId,
          openerId: id,
          index: -1,
          readonly: true,
          hint: 'Go up one level to the parent directory.\n\n' + navigationTip
        });
      }

      if (method === 'build') {
        this.listView.build(nodes, undefined, selectedIDs, {origin});
      }
      else {
        this.listView.update(nodes);
      }
      this.listView.mode({
        path: this.isSearch(id)
      });
    }
    catch (e) {
      this.listView.build(undefined, e, undefined, {origin});
      console.warn(e);
      window.setTimeout(() => this.build(''), 2000);
    }
  }  build(id, arr, selectedIDs = []) {
    this.emit('directory-view:update-requested');

    id = id || engine.bookmarks.rootID;
    Promise.all([
      this.buildListView(id, false, selectedIDs),
      this.buildPathView(id, arr)
    ]).then(() => {
      this.emit('directory-view:content-updated');
    });
    this._id = id;
  }
  style({
    name = 200,
    added = 90,
    modified = 90
  }) {
    this.listView.style.setProperty('--name-width', name + 'px');
    this.listView.style.setProperty('--added-width', added + 'px');
    this.listView.style.setProperty('--modified-width', modified + 'px');
  }
  // set the visible (and ordered) list of columns, e.g. ['icon', 'name', 'link']
  columns(list) {
    this.listView.columns = list;
  }
  // nested context menu sections, e.g. {open: false, copy: true, move: true, importExport: true}
  groups(prefs) {
    this.listView.groups(prefs);
  }
  update(id) {
    this.buildListView(id, true).then(() => {
      this.emit('directory-view:content-updated');
    });
  }
  entries(...args) {
    return this.listView.entries(...args);
  }
  id() {
    return this._id;
  }
  list() {
    return this.arr;
  }
  isRoot(id) {
    return engine.bookmarks.isRoot(id || this.id());
  }
  isSearch(id) {
    return engine.bookmarks.isSearch(id || this.id());
  }
  navigate(direction = 'forward') {
    if (direction === 'first' || direction === 'last') {
      this.listView[direction]();
    }
    else {
      this.listView[direction === 'forward' ? 'next' : 'previous']();
    }
  }
  simulate(e) {
    this.listView.simulate(e);
  }
  state(command, enabled) {
    this.listView.state(command, enabled);
  }
  owner(name) {
    this.setAttribute('owner', name);
    this.listView.setAttribute('owner', name);
    this.pathView.setAttribute('owner', name);
  }
  static get observedAttributes() {
    return ['path'];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'path') {
      this.build(newValue);
    }
  }
}
window.customElements.define('directory-view', DirectoryView);
