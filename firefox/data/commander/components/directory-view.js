/* global engine */
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
          color: #a0a0a0;
          text-shadow: 1px 1px #fcffff;
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
    // focus the list-view element
    this.addEventListener('click', () => this.listView.focus());
  }
  emit(name, detail) {
    return this.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail
    }));
  }
  async hierarchy(id) {
    const cache = [];
    if (engine.bookmarks.isSearch(id)) {
      cache.push({
        title: 'Search: ' + id.query,
        id
      });
    }
    else {
      while (this.isRoot(id) === false) {
        const node = await engine.bookmarks.parent(id);
        id = node.parentId;
        cache.unshift(node);
      }
      cache.unshift({
        title: '/',
        id: engine.bookmarks.rootID
      });
    }

    return cache;
  }
  async buildPathView(id, arr) {
    // store path only if it is needed
    if (!arr) {
      arr = await this.hierarchy(id);
      this.emit('directory-view:path', {
        id,
        arr
      });
    }
    this.arr = arr;
    this.pathView.build(arr);
  }
  // if update, then selected elements are persistent
  async buildListView(id, update = false) {
    const method = update ? 'update' : 'build';
    try {
      const nodes = await engine.bookmarks.children(id);
      this.count = this.CountElement.textContent = nodes.length;
      if (this.isRoot(id) === false && this.isSearch(id) === false) {
        const parent = await engine.bookmarks.parent(id);
        nodes.unshift({
          title: '[..]',
          id: parent.parentId,
          index: -1,
          readonly: true
        });
      }
      this.listView[method](nodes);
    }
    catch (e) {
      this.listView.build(undefined, e);
      window.setTimeout(() => this.build(''), 2000);
    }
  }
  build(id, arr) {
    id = id || engine.bookmarks.rootID;
    this.buildListView(id);
    this.buildPathView(id, arr);
    this._id = id;
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
