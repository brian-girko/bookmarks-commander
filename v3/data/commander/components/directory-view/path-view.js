class PathView extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({
      mode: 'open'
    });
    shadow.innerHTML = `
      <style>
        :host {
          --height: 24px;
          --gap: 2px;
          --opacity: 0.7;
          --image-size: 10px;
        }
        div {
          display: flex;
          gap: var(--gap);
          white-space: nowrap;
          overflow: auto;
          flex: 1;
        }
        #body {
          height: 100%;
          align-items: center;
        }
        label {
          overflow: hidden;
          text-overflow: ellipsis;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: var(--height); /* we need this to prevent special chars from resizing labels */
          user-select: none;
          min-width: 3ch;
        }
        label:not(:last-of-type) {
          background: url(data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xODQuNyw0MTMuMWwyLjEtMS44bDE1Ni41LTEzNmM1LjMtNC42LDguNi0xMS41LDguNi0xOS4yYzAtNy43LTMuNC0xNC42LTguNi0xOS4yTDE4Ny4xLDEwMWwtMi42LTIuMyAgQzE4Miw5NywxNzksOTYsMTc1LjgsOTZjLTguNywwLTE1LjgsNy40LTE1LjgsMTYuNmgwdjI4Ni44aDBjMCw5LjIsNy4xLDE2LjYsMTUuOCwxNi42QzE3OS4xLDQxNiwxODIuMiw0MTQuOSwxODQuNyw0MTMuMXoiIGZpbGw9IiNjY2MiLz48L3N2Zz4=);
          background-size: var(--image-size);
          background-repeat: no-repeat;
          background-position: center right;
          padding-inline-end: calc(var(--image-size) + var(--gap));
        }
        label span {
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          opacity: var(--opacity);
        }
        input:checked + label {
          max-width: min-content;
          min-width: 40px;
          width: -moz-available;
          width: -webkit-fill-available;
          width: fill-available;
        }
        input:checked + label span {
          opacity: 1;
          font-weight: bold;
        }
        input[type=radio] {
          display: none;
        }
      </style>
      <div id="body">
        <div id="content"></div>
        <slot></slot>
      </div>
    `;
    this.content = shadow.getElementById('content');
    this.entries = new Map();
  }
  connectedCallback() {
    this.content.addEventListener('change', e => {
      if (this.entries.has(e.target)) {
        this.dispatchEvent(new Event('change'));
      }
    });
  }
  build(map = [{title: 'empty'}]) {
    this.content.textContent = '';
    const f = document.createDocumentFragment();

    map.forEach(o => {
      const {title, id = 'pve-' + Math.random(), checked = false} = o;
      const label = document.createElement('label');
      const span = document.createElement('span');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'group';
      input.id = typeof id === 'string' ? id : JSON.stringify(id);
      input.checked = checked;
      f.appendChild(input);
      label.title = span.textContent = title || '';
      label.appendChild(span);
      f.appendChild(label);
      label.setAttribute('for', input.id);

      this.entries.set(input, o);
    });

    // check
    if (!f.querySelector('input:checked')) {
      f.querySelector('input:last-of-type').checked = true;
    }

    this.content.appendChild(f);

    this.content.scrollLeft = this.content.scrollWidth;
  }
  get value() {
    const e = this.content.querySelector('input:checked');
    console.log(e);
    return this.entries.get(e);
  }
}
window.customElements.define('path-view', PathView);
