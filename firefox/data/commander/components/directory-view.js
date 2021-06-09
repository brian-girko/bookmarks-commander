/* global engine */
class DirectoryView extends HTMLElement {
  constructor() {
    super();

    this.history = [];
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
        }
      </style>
      <path-view>
        <span id="count">-</span>
      </path-view>
      <list-view></list-view>
    `;
    this.pathView = shadow.querySelector('path-view');
    this.listView = shadow.querySelector('list-view');
    this.CountElement = shadow.getElementById('count');

    // events
    const onsubmit = e => this.emit('directory-view:submit', e.detail);
    this.pathView.addEventListener('submit', onsubmit);
    this.listView.addEventListener('submit', onsubmit);
    this.listView.addEventListener('selection-changed', () => this.emit('directory-view:selection-changed'));
    this.listView.addEventListener('drop-request', e => this.emit('directory-view:drop-request', e.detail));
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
        const length = this.history.length;
        nodes.unshift({
          title: '[..]',
          id: length ? this.history[length - 1] : '',
          openerId: id,
          index: -1,
          readonly: true
        });
      }
      else if (this.isRoot(id) === false) {
        const parent = await engine.bookmarks.parent(id);
        nodes.unshift({
          title: '[..]',
          id: parent.parentId,
          openerId: id,
          index: -1,
          readonly: true
        });
      }
      if (method === 'build') {
        this.listView.build(nodes, undefined, selectedIDs);
      }
      else {
        this.listView.update(nodes);
      }
      this.listView.mode({
        path: this.isSearch(id)
      });

      this.history.push(id);
    }
    catch (e) {
      this.listView.build(undefined, e);
      console.warn(e);
      window.setTimeout(() => this.build(''), 2000);
    }
  }
  build(id, arr, selectedIDs = []) {
    id = id || engine.bookmarks.rootID;
    this.buildListView(id, false, selectedIDs);
    this.buildPathView(id, arr);
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
  update(id) {
    this.buildListView(id, true);
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
    this.listView[direction === 'forward' ? 'next' : 'previous']();
  }
  owner(name) {
    this.setAttribute('owner', name);
    this.listView.setAttribute('owner', name);
    this.pathView.setAttribute('owner', name);
  }
  static get observedAttributes() {
    return ['path'];
  }
  async attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'path') {
      this.build(newValue);
    }
  }
}
window.customElements.define('directory-view', DirectoryView);
