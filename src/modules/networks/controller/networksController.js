(function (root) {
  const styles = root.AsusRouterNetworksStyles || {};
  const { createNetworkDataStore } = root.AsusRouterNetworksData;
  const { createNetworksUi } = root.AsusRouterNetworksUi;

  const config = {
    id: 'networkModal',
    title: 'Network total / speed',
    inrevalSec: 2,
    intervalCode: null,
    container: null,
    request: (origin) => [`${origin}/update.cgi?_=${new Date() * 1}`, {
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
      },
      body: 'output=netdev',
      method: 'POST',
    }],
    network: {
      type: {
        INTERNET: 'INTERNET',
        WIRED: 'LAN',
        WIRELESS0: '2.4GHz',
        WIRELESS1: '5GHz',
      },
    },
  };

  const networkDataStore = createNetworkDataStore({
    requestBuilder: config.request,
    networkTypes: config.network.type,
  });

  let currentState = null;
  let ui = null;

  initModal();

  function getData() {
    networkDataStore.fetchNetworkData(window.location.origin)
      .then((obj) => {
        const previousState = currentState;
        const nextState = networkDataStore.transformResponse(obj, previousState);
        currentState = nextState;
        if (previousState == null) return null;
        return nextState;
      })
      .then((result) => {
        if (!result) return;
        const container = config.container;
        while (container.firstChild) {
          container.removeChild(container.lastChild);
        }
        container.appendChild(ui.getHTML(result));
      });
  }

  function newModal() {
    const dialog = document.createElement('dialog');
    dialog.setAttribute('id', config.id);
    document.body.appendChild(dialog);
    addHead(dialog, config.title);

    const container = document.createElement('div');
    container.className = 'networks-content';
    dialog.appendChild(container);
    dialog.className = styles.modal;
    container.innerHTML = '<div class="networks-loading">Loading…</div>';
    dialog.showModal();
    config.container = container;
  }

  function addHead(dialog, title) {
    const container = document.createElement('div');
    container.className = 'networks-header-wrap';
    dialog.appendChild(container);

    const row = document.createElement('div');
    row.className = styles.headerRow;
    container.appendChild(row);

    const titleCol = document.createElement('div');
    titleCol.innerHTML = title;
    titleCol.className = styles.headerTitle;
    row.appendChild(titleCol);

    const actionsCol = document.createElement('div');
    actionsCol.className = styles.headerActions;
    row.appendChild(actionsCol);

    const closeButton = document.createElement('button');
    closeButton.setAttribute('id', `${config.id}Button`);
    closeButton.className = 'btn-close networks-close-button';
    closeButton.setAttribute('type', 'button');
    closeButton.addEventListener('click', () => {
      dialog.close();
      clearInterval(config.intervalCode);
      dialog.remove();
    });
    actionsCol.appendChild(closeButton);
  }

  function initModal() {
    const btn = document.getElementById(`${config.id}Button`);
    if (btn) btn.click();
    currentState = null;
    newModal();
    getData();
    config.intervalCode = setInterval(getData, config.inrevalSec * 1000);
  }

  function cnvrtMbps(value, noSpase) {
    const resultNumber = Math.round(value / 1024 / 1024 * 8 * 100) / 100;
    let result = `${resultNumber.toLocaleString()} Mbps`;
    result = (noSpase ? '' : getSpase(15 - result.length)) + result;
    return result;
  }

  function cnvrtMb(value, noSpase) {
    const resultNumber = Math.round(value / 1024 / 1024);
    let result = `${resultNumber.toLocaleString()} MB`;
    result = (noSpase ? '' : getSpase(15 - result.length)) + result;
    return result;
  }

  function getSpase(count) {
    if (count < 1) return '';
    return '&nbsp;'.repeat(count);
  }

  function getVector(vector) {
    const color = vector === 'inc' ? styles.vectorPositive : styles.vectorNegative;
    const icon = vector === 'inc' ? '&#9660' : '&#9650';
    return `<span class="${color}">${icon}</span>`;
  }

  ui = createNetworksUi(config, {
    styles,
    Diagram: root.Diagram,
    cnvrtMbps,
    cnvrtMb,
    getVector,
  });

  root.AsusRouterNetworksController = {
    init: initModal,
  };
}(typeof globalThis !== 'undefined' ? globalThis : this));
