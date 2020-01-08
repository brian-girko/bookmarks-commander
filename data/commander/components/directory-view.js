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
      </style>
      <path-view></path-view>
      <list-view></list-view>
    `;
    this.pathView = shadow.querySelector('path-view');
    this.listView = shadow.querySelector('list-view');
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
    while (engine.bookmarks.isRoot(id) === false) {
      const node = await engine.bookmarks.parent(id);
      id = node.parentId;
      cache.unshift(node);
    }
    cache.unshift({
      title: '/',
      id: engine.bookmarks.rootID
    });

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
  buildListView(id, update = false) {
    return engine.bookmarks.children(id).then(nodes => {
      if (engine.bookmarks.isRoot(id)) {
        this.listView[update ? 'update' : 'build'](nodes);
      }
      else {
        engine.bookmarks.parent(id).then(node => this.listView[update ? 'update' : 'build']([{
          title: '[..]',
          id: node.parentId,
          index: -1,
          readonly: true
        }, ...nodes]));
      }
    }).catch(e => {
      this.listView.build(undefined, e);
      window.setTimeout(() => this.build(''), 2000);
    });
  }
  build(id, arr) {
    id = id || engine.bookmarks.rootID;
    this.buildListView(id);
    this.buildPathView(id, arr);
    this.dataset.id = id;
  }
  update(id) {
    this.buildListView(id, true);
  }
  entries() {
    return this.listView.entries();
  }
  id() {
    return this.dataset.id;
  }
  list() {
    return this.arr;
  }
  isRoot() {
    return engine.bookmarks.isRoot(this.id());
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
