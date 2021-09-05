/* global engine */

class ListView extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({
      mode: 'open'
    });
    shadow.innerHTML = `
      <style>
        :host {
          border: solid 1px var(--border, #cacaca);
          user-select: none;
        }
        :host(.active) {
          background-color: var(--bg-active, #fff);
        }
        #content {
          outline: none;
          height: 100%;
          overflow: auto;
        }
        div.entry {
          padding: 5px 0;
          display: grid;
          grid-template-columns: 32px minmax(32px, var(--name-width, 200px)) minmax(32px, 1fr) minmax(32px, var(--added-width, 90px)) minmax(32px, var(--modified-width, 90px));
        }
        #content[data-path=true] div.entry {
          grid-template-columns: 32px minmax(32px, 200px) minmax(32px, 1fr) minmax(32px, 1fr);
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
          border-bottom: solid 1px var(--border-alt, #e8e3e9);
          position: sticky;
          top: 0;
          background: var(--bg-header, #f5f5f5);
        }
        div.entry.hr span {
          pointer-events: none;
          width: 100%;
        }
        div.entry.hr > div {
          display: flex;
          align-items: center;
        }
        div.entry.hr i {
          width: 2px;
          background-color: var(--border-alt, #e8e3e9);
          display: inline-block;
          height: 12px;
          cursor: col-resize;
        }
        div.entry:not(.hr):nth-child(even) {
          background-color: var(--bg-even-row, #f5f5f5);
        }
        div.entry[data-selected=true] {
          background-color: var(--bg-selected-row, #c0e7ff) !important;
        }
        #content[data-path=true] div.entry [data-id=added],
        #content[data-path=true] div.entry [data-id=modified] {
          display: none;
        }
        #content:not([data-path=true]) div.entry [data-id=path] {
          display: none;
        }
        div.entry [data-id="icon"] {
          background-size: 16px;
          background-repeat: no-repeat;
          background-position: center center;
        }
        div.entry[data-type="DIRECTORY"] [data-id="icon"] {
          background-image: url('/data/commander/images/directory.svg');
        }
        div.entry[data-type="DIRECTORY"][data-readonly="true"] [data-id="icon"] {
          background-image: url('/data/commander/images/directory-readonly.svg');
        }
        div.entry[data-type="ERROR"] [data-id="icon"] {
          background-image: url('/data/commander/images/error.svg');
        }
        div.entry [data-id="added"],
        div.entry [data-id="modified"] {
          text-align: center;
        }
        #menu {
          position: absolute;
          background-color: var(--bg-active, #fff);
          border: solid 1px var(--border, #cacaca);
          z-index: 1;
          list-style: none;
          margin: 0;
          padding: 0;
          white-space: nowrap;
          outline: none;
        }
        #menu hr {
          border: none;
          border-top: solid 1px var(--border, #cacaca);
        }
        #menu li {
          padding: 5px 10px;
          cursor: pointer;
        }
        #menu li.disabled {
          opacity: 0.5;
          pointer-events: none;
        }
        #menu li:hover {
          background-color: var(--bg-header, #f5f5f5);
        }
        .hidden {
          display: none;
        }
      </style>
      <style id="styles"></style>
      <template>
        <div class="entry" contextmenu="menu">
          <span data-id="icon"></span>
          <span data-id="name"></span>
          <span data-id="path"></span>
          <span data-id="href"></span>
          <span data-id="added"></span>
          <span data-id="modified"></span>
        </div>
      </template>
      <ul id="menu" tabindex="1" class="hidden">
        <li data-id="open-in-new-tab">Open Link in New Tab</li>
        <li data-id="open-in-new-window">Open Link in New Window</li>
        <li data-id="open-folder">Open Path Folder</li>
        <li data-id="open-folder-other-pane">Open Path Folder in Opposite Pane</li>
        <hr/>
        <li data-id="copy-title">Copy Title</li>
        <li data-id="copy-link">Copy Link</li>
        <li data-id="copy-id">Copy Bookmark ID</li>
        <li data-id="copy-details">Copy Details</li>
        <hr/>
        <li data-id="move-top">Move First</li>
        <li data-id="move-up">Move UP</li>
        <li data-id="move-down">Move Down</li>
        <li data-id="move-bottom">Move Last</li>
        <hr/>
        <li data-id="import-tree">Import as JSON</li>
        <li data-id="export-tree">Export as JSON</li>
        <hr/>
        <li data-id="trash">Delete</li>
      </ul>

      <div id="content" tabindex="-1">
        <div class="entry hr">
          <div data-id="icon"><span></span></div>
          <div data-id="name"><i></i><span>Name</span></div>
          <div data-id="path"><i></i><span>Path</span></div>
          <div data-id="href"><i></i><span>Link</span></div>
          <div data-id="added"><i></i><span>Added</span></div>
          <div data-id="modified"><i></i><span>Modified</span></div>
        </div>
      </div>
    `;

    this.template = shadow.querySelector('template');
    this.content = shadow.getElementById('content');

    this.content.addEventListener('focus', () => this.classList.add('active'));
    this.content.addEventListener('blur', () => {
      const active = this.shadowRoot.activeElement;
      // if document is not focused, keep the active view
      if (active === null) {
        this.classList.remove('active');
      }
    });

    // context menu
    this.content.addEventListener('contextmenu', e => {
      const {target} = e;
      if (target.classList.contains('entry') && target.dataset.index !== '-1') {
        e.preventDefault();
        this.emit('selection-changed');
        // is this entry selected?
        if (target.dataset.selected === 'false') {
          this.select(target);
        }

        const m = this.shadowRoot.getElementById('menu');
        const directory = target.dataset.type === 'DIRECTORY';
        m.querySelector('[data-id="open-in-new-tab"]').classList[directory ? 'add' : 'remove']('disabled');
        m.querySelector('[data-id="open-in-new-window"]').classList[directory ? 'add' : 'remove']('disabled');
        m.querySelector('[data-id="open-folder"]').classList[
          this?.extra?.origin === 'other' && directory === false ? 'add' : 'remove'
        ]('disabled');

        m.style.left = (e.clientX - 10) + 'px';
        m.style.top = (e.clientY - 10) + 'px';
        m.classList.remove('hidden');
        m.focus();
      }
    });
    this.shadowRoot.getElementById('menu').onblur = e => e.target.classList.add('hidden');

    this.config = {
      remote: false
    };

    shadow.addEventListener('click', e => {
      const {target} = e;
      if (target.classList.contains('entry') && target.classList.contains('hr') === false) {
        // single-click => toggle selection
        if (e.detail === 1 || e.detail === 0) {
          if (e.ctrlKey === false && e.metaKey === false && e.shiftKey === false) {
            this.items().forEach(e => e.dataset.selected = false);
          }
          // multiple select
          if (e.shiftKey) {
            const e = this.content.querySelector('.entry[data-last-selected=true]');
            const es = [...this.content.querySelectorAll('.entry')];
            if (e) {
              const i = es.indexOf(e);
              const j = es.indexOf(target);

              for (let k = Math.min(i, j); k < Math.max(i, j); k += 1) {
                es[k].dataset.selected = true;
              }
            }
          }
          // select / deselect on meta
          if (e.ctrlKey || e.metaKey) {
            target.dataset.selected = target.dataset.selected !== 'true';
          }
          else {
            target.dataset.selected = true;
          }
          for (const e of [...this.content.querySelectorAll('.entry[data-last-selected=true]')]) {
            e.dataset.lastSelected = false;
          }
          target.dataset.lastSelected = true;

          // scroll (only when e.isTrusted === false)
          if (e.isTrusted === false) {
            this.scroll(target);
          }
          this.emit('selection-changed');
        }
        // double-click => submit selection
        else {
          const entries = [];
          if (target.dataset.selected === 'true') {
            entries.push(...this.entries(true));
          }
          else {
            const entry = Object.assign({}, target.node, target.dataset);
            if (entry.id.startsWith('{')) {
              entry.id = JSON.parse(entry.id);
            }
            entries.push(entry);
          }
          this.emit('submit', {
            shiftKey: e.shiftKey,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey,
            entries
          });
        }
      }
      else if (target.dataset.id === 'open-in-new-tab') {
        shadow.dispatchEvent(new KeyboardEvent('keydown', {
          code: 'Enter',
          metaKey: true
        }));
      }
      else if (target.dataset.id === 'open-in-new-window') {
        shadow.dispatchEvent(new KeyboardEvent('keydown', {
          code: 'Enter',
          shiftKey: true
        }));
      }
      else if (target.dataset.id === 'open-folder') {
        this.emit('command', {
          command: 'open-folder'
        });
      }
      else if (target.dataset.id === 'open-folder-other-pane') {
        this.emit('command', {
          command: 'mirror',
          altKey: true
        });
      }
      else if (
        ['copy-link', 'copy-id', 'copy-title', 'copy-details'].indexOf(target.dataset.id) !== -1 ||
        ['move-top', 'move-up', 'move-down', 'move-bottom'].indexOf(target.dataset.id) !== -1 ||
        ['import-tree', 'export-tree'].indexOf(target.dataset.id) !== -1 ||
        ['trash'].indexOf(target.dataset.id) !== -1
      ) {
        if (target.dataset.id === 'trash' && confirm('Are you sure?') === false) {
          return;
        }
        this.emit('command', {
          command: target.dataset.id,
          shiftKey: e.shiftKey
        });
      }
    });
    // to prevent conflict with command access
    shadow.addEventListener('keyup', e => {
      if (e.code.startsWith('Key') || e.code.startsWith('Digit')) {
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
      else if (
        e.code === 'Backspace' &&
        e.shiftKey === false && e.altKey === false && e.metaKey === false && e.ctrlKey === false
      ) {
        const d = this.content.querySelector('.entry[data-index="-1"]');
        if (d) {
          this.dbclick(d);
        }
        else {
          engine.notify('beep');
        }
      }
    });
    shadow.addEventListener('keydown', e => {
      const meta = e.metaKey || e.ctrlKey || e.shiftKey;
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
      // select all
      else if (e.code === 'KeyA' && meta) {
        const [e, ...es] = [...this.content.querySelectorAll('.entry[data-readonly=false]')];
        this.select(e);
        for (const e of es) {
          this.select(e, true);
        }
      }
    });
    // keyboard navigation
    shadow.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (e.altKey === false) {
          e.preventDefault();
          const meta = e.metaKey || e.ctrlKey || e.shiftKey;
          const reverse = (e.metaKey && e.shiftKey) || (e.ctrlKey && e.shiftKey);
          this[e.key === 'ArrowUp' ? 'previous' : 'next'](meta, reverse);
        }
      }
    });
    // drag and drop
    shadow.addEventListener('drop', e => {
      e.preventDefault();
      const j = e.dataTransfer.getData('application/bc.bookmark');
      try {
        this.emit('drop-request', {
          ...JSON.parse(j),
          destination: e.target.getRootNode().host.getAttribute('owner')
        });
      }
      catch (e) {}
    });
    shadow.addEventListener('dragover', e => e.preventDefault());
    shadow.addEventListener('dragstart', e => {
      const ids = [];
      const types = [];
      const selected = [];
      if (e.target.dataset.selected === 'true') {
        const es = [...this.content.querySelectorAll('.entry[data-selected=true]')];
        ids.push(...es.map(e => e.dataset.id));
        types.push(...es.map(e => e.dataset.type));
        selected.push(...es.map(e => e.dataset.selected));
      }
      else {
        ids.push(e.target.dataset.id);
        types.push(e.target.dataset.type);
        selected.push(e.target.dataset.selected);
      }

      e.dataTransfer.setData('application/bc.bookmark', JSON.stringify({
        ids,
        types,
        selected,
        source: e.target.getRootNode().host.getAttribute('owner')
      }));
      e.dataTransfer.setData('text/uri-list', e.target.querySelector('[data-id="href"]').textContent);
      e.dataTransfer.setData('text/plain', e.target.querySelector('[data-id="name"]').textContent);
    });
  }
  query(q) {
    return this.content.querySelector(q);
  }
  select(e, metaKey = false) {
    const event = document.createEvent('MouseEvent');
    event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, metaKey, false, false, metaKey, 0, null);
    e.dispatchEvent(event);
  }
  first(metaKey = false) {
    const e = this.content.querySelector('.entry[data-index]');
    if (e) {
      this.select(e, metaKey);
    }
  }
  last(metaKey = false) {
    const e = this.content.querySelector('.entry[data-index]:last-child');
    if (e) {
      this.select(e, metaKey);
    }
  }
  previous(metaKey = false, reverse = false) {
    if (reverse) {
      const es = this.content.querySelectorAll('.entry[data-selected=true]');
      if (es.length > 1) {
        es[0].dataset.selected = false;
      }
    }
    else {
      const e = this.content.querySelector('.entry:not(.hr) + .entry[data-selected=true]');
      if (e) {
        this.select(e.previousElementSibling, metaKey);
      }
    }
  }
  next(metaKey = false, reverse = false) {
    if (reverse) {
      const es = this.content.querySelectorAll('.entry[data-selected=true]');
      if (es.length > 1) {
        es[es.length - 1].dataset.selected = false;
      }
    }
    else {
      const e = [...this.content.querySelectorAll('.entry[data-selected=true] + .entry')].pop();
      if (e) {
        this.select(e, metaKey);
      }
    }
  }
  items(selected = true) {
    if (selected) {
      return [...this.content.querySelectorAll('.entry[data-selected=true]')];
    }
    return [...this.content.querySelectorAll('.entry[data-index]:not([data-index="-1"])')];
  }
  entries(selected = true) {
    return this.items(selected).map(target => {
      const o = Object.assign({}, target.node, target.dataset);
      // id is from search
      if (target.dataset.id.startsWith('{')) {
        o.id = JSON.parse(target.dataset.id);
      }
      return o;
    });
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
  build(nodes, err, ids = [], extra) { // extra = {origin: ['root', 'search', 'extra']}
    this.clean();
    this.extra = extra;

    // remove unknown ids
    ids = ids.filter(id => nodes.some(n => n.id === id));

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
        clone.querySelector('[data-id="path"]').textContent = node.relativePath;
        clone.querySelector('[data-id="added"]').textContent = this.date(node.dateAdded);
        clone.querySelector('[data-id="modified"]').textContent = this.date(node.dateGroupModified);
        const type = node.url ? 'FILE' : 'DIRECTORY';
        const div = clone.querySelector('div');
        Object.assign(div.dataset, {
          key: node.title ? node.title[0].toLowerCase() : '',
          type,
          index: node.index,
          id: typeof node.id === 'string' ? node.id : JSON.stringify(node.id),
          readonly: node.readonly || false
        });
        div.title = `${node.title}
${node.url}
${node.relativePath}`;

        if (node.readonly !== true) {
          div.setAttribute('draggable', 'true');
        }
        div.node = node;
        div.dataset.selected = ids.length ? ids.indexOf(node.id) !== -1 : node === nodes[0];
        if (type === 'FILE') {
          clone.querySelector('[data-id="icon"]').style['background-image'] = `url(${this.favicon(node.url)})`;
        }
        f.appendChild(clone);
      }
    }
    this.content.appendChild(f);
    // scroll the first selected index into the view
    if (ids.length) {
      const e = this.content.querySelector(`[data-id="${ids[0]}"`);
      if (e) {
        this.scroll(e);
      }
    }
  }
  mode(o) {
    this.content.dataset.path = Boolean(o.path);
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
  scroll(target) {
    const hr = this.content.querySelector('.hr').getBoundingClientRect();
    const bounding = target.getBoundingClientRect();
    // do we need scroll from top
    if (bounding.top < hr.top + hr.height) {
      target.scrollIntoView({
        block: 'start'
      });
      this.content.scrollTop -= bounding.height;
    }
    if (bounding.bottom > hr.top + this.content.clientHeight) {
      target.scrollIntoView({
        block: 'end'
      });
    }
  }
  state(command, enabled) {
    const m = this.shadowRoot.getElementById('menu');
    const e = m.querySelector(`[data-id="${command}"]`);
    console.log(e, command);
    if (e) {
      e.classList[enabled ? 'remove' : 'add']('disabled');
    }
  }
  connectedCallback() {
    const hr = this.content.querySelector('div.entry.hr');
    const entries = [...hr.querySelectorAll('div')];
    entries.forEach((entry, index) => {
      const drag = entry.querySelector('i');
      if (!drag) {
        return;
      }
      drag.onmousedown = () => {
        const resize = e => {
          const widths = entries.map(e => e.getBoundingClientRect().width);
          const total = widths.reduce((p, c) => c + p, 0);

          widths[index] -= e.movementX;
          if (widths[index] < 32) {
            return;
          }
          for (let j = index - 1; j >= 0; j -= 1) {
            if (widths[j] !== 0) {
              widths[j] += e.movementX;
              if (widths[j] < 32) {
                return;
              }
              break;
            }
          }
          this.shadowRoot.getElementById('styles').textContent = `
            #content[data-path=${this.content.dataset.path}] div.entry {
              grid-template-columns: ${widths.filter(w => w).map(w => (w / total * 100) + '%').join(' ')};
            }
          `;
        };
        document.addEventListener('mousemove', resize);
        document.onmouseup = () => {
          document.removeEventListener('mousemove', resize);
        };
      };
    });
  }
}
window.customElements.define('list-view', ListView);
