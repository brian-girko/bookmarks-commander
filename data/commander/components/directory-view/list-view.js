class ListView extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({
      mode: 'open'
    });
    shadow.innerHTML = `
      <style>
        :host {
          border: solid 1px #848484;
          user-select: none;
        }
        :host(.active) {
          background-color: #fff;
        }
        #content {
          outline: none;
        }
        div.entry {
          display: grid;
          grid-template-columns: 32px minmax(50px, 200px) minmax(50px, 1fr) minmax(50px, 90px) minmax(50px, 90px);
        }
        div.entry span {
          text-indent: 5px;
          padding: 2px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          pointer-events: none;
        }
        div.entry.hr {
          pointer-events: none;
          border-bottom: solid 1px #e8e3e9;
        }
        div.entry.hr span:not(first-child) {
          border-left: solid 1px #e8e3e9;
        }
        div.entry:not(.hr):nth-child(even) {
          background-color: #f5f5f5;
        }
        div.entry[data-selected=true] {
          background-color: #c0e7ff !important;
        }
        div.entry span[data-id="icon"] {
          background-size: 16px;
          background-repeat: no-repeat;
          background-position: center center;
        }
        div.entry[data-type="DIRECTORY"] span[data-id="icon"] {
          background-image: url('/data/commander/images/directory.svg');
        }
        div.entry[data-type="DIRECTORY"][data-readonly="true"] span[data-id="icon"] {
          background-image: url('/data/commander/images/directory-readonly.svg');
        }
        div.entry[data-type="ERROR"] span[data-id="icon"] {
          background-image: url('/data/commander/images/error.svg');
        }
        div.entry span[data-id="added"],
        div.entry span[data-id="modified"] {
          text-align: center;
        }
      </style>
      <template>
        <div class="entry">
          <span data-id="icon"></span>
          <span data-id="name"></span>
          <span data-id="href"></span>
          <span data-id="added"></span>
          <span data-id="modified"></span>
        </div>
      </template>
      <div id="content" tabindex="-1">
        <div class="entry hr">
          <span data-id="icon"></span>
          <span data-id="name">Name</span>
          <span data-id="href">Link</span>
          <span data-id="added">Added</span>
          <span data-id="modified">Modified</span>
        </div>
      </div>
    `;

    this.template = shadow.querySelector('template');
    this.content = shadow.getElementById('content');

    this.content.addEventListener('focus', () => this.classList.add('active'));
    this.content.addEventListener('blur', () => this.classList.remove('active'));

    this.config = {
      remote: false
    };

    shadow.addEventListener('click', e => {
      const {target} = e;
      if (target.classList.contains('entry')) {
        // single-click => toggle selection
        if (e.detail === 1 || e.detail === 0) {
          if (e.ctrlKey === false && e.metaKey === false) {
            this.items().forEach(e => e.dataset.selected = false);
          }
          target.dataset.selected = true;
          this.emit('selection-changed');
        }
        // double-click => submit selection
        else {
          this.emit('submit', {
            shiftKey: e.shiftKey,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey,
            entries: [Object.assign({}, target.node, target.dataset)]
          });
        }
      }
    });
    shadow.addEventListener('keydown', e => {
      if (e.code === 'Enter') {
        const entries = this.entries();
        if (entries.length) {
          this.emit('submit', {
            shiftKey: e.shiftKey,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey,
            entries
          });
        }
      }
      else if (e.code.startsWith('Key')) {
        const d = this.content.querySelector(`.entry[data-selected=true] ~ .entry[data-key="${e.key}"]`);
        if (d) {
          d.click();
        }
        else {
          const d = this.content.querySelector(`.entry[data-key="${e.key}"]`);
          if (d) {
            d.click();
          }
        }
      }
      else if (e.code === 'Backspace') {
        const d = this.content.querySelector('.entry[data-index="-1"]');
        if (d) {
          this.dbclick(d);
        }
      }
    });
    // keyboard navigation
    shadow.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') {
        const e = this.content.querySelector('.entry[data-selected=true] + .entry');
        if (e) {
          e.click();
        }
      }
      else if (e.key === 'ArrowUp') {
        const e = this.content.querySelector('.entry:not(.hr) + .entry[data-selected=true]');
        if (e) {
          e.previousElementSibling.click();
        }
      }
    });
  }
  items() {
    return [...this.content.querySelectorAll('[data-selected=true]')];
  }
  entries() {
    return this.items().map(target => Object.assign({}, target.node, target.dataset));
  }
  emit(name, detail) {
    return this.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail
    }));
  }
  dbclick(e) {
    return e.dispatchEvent(new CustomEvent('click', {
      detail: 2,
      bubbles: true
    }));
  }
  favicon(href) {
    if (typeof InstallTrigger !== 'undefined') {
      if (this.config.remote) {
        return 'http://www.google.com/s2/favicons?domain_url=' + href;
      }
      else {
        return '/data/commander/images/page.svg';
      }
    }
    return 'chrome://favicon/' + href;
  }
  date(ms) {
    if (ms) {
      return (new Date(ms)).toLocaleDateString();
    }
    return '';
  }
  clean() {
    [...this.content.querySelectorAll('.entry:not(.hr)')].forEach(e => e.remove());
  }
  // ids of selected elements
  build(nodes, err, ids = []) {
    this.clean();

    const f = document.createDocumentFragment();
    if (err) {
      const clone = document.importNode(this.template.content, true);
      clone.querySelector('[data-id="name"]').textContent = err.message;
      clone.querySelector('div').dataset.type = 'ERROR';
      f.appendChild(clone);
    }
    else {
      for (const node of nodes) {
        const clone = document.importNode(this.template.content, true);
        clone.querySelector('[data-id="name"]').textContent = node.title;
        clone.querySelector('[data-id="href"]').textContent = node.url;
        clone.querySelector('[data-id="added"]').textContent = this.date(node.dateAdded);
        clone.querySelector('[data-id="modified"]').textContent = this.date(node.dateGroupModified);
        const type = node.url ? 'FILE' : 'DIRECTORY';
        const div = clone.querySelector('div');
        Object.assign(div.dataset, {
          key: node.title[0].toLowerCase(),
          type,
          index: node.index,
          id: node.id,
          readonly: node.readonly || false
        });
        div.node = node;
        div.dataset.selected = ids.length ? ids.indexOf(node.id) !== -1 : node === nodes[0];
        if (type === 'FILE') {
          clone.querySelector('[data-id="icon"]').style['background-image'] = `url(${this.favicon(node.url)})`;
        }
        f.appendChild(clone);
      }
    }
    this.content.appendChild(f);

    this.emit('selection-changed');
  }
  // refresh the list while keeping selections
  update(nodes, err) {
    const ids = [...this.content.querySelectorAll('[data-selected="true"]')]
      .map(e => e.dataset.id)
      // make sure ids are still present
      .filter(id => nodes.some(n => n.id === id));
    return this.build(nodes, err, ids);
  }
  // content is the only focusable element
  focus() {
    this.content.focus();
  }
}
window.customElements.define('list-view', ListView);
