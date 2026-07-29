(function () {
  const clientDataStore = AsusRouterClientData.createClientDataStore();
  const { createClientsUi } = AsusRouterClientsUi;
  const templates = AsusRouterClientsTemplates;
  const styles = AsusRouterClientsStyles;
  let ui = null;

  const config = {
    id: 'clientsModal',
    title: 'Clients',
    inrevalSec: 2,
    viwe: {
      intervalCode: null,
      container: null,
      setViwe: () => {
        let obj = transformData();
        if (obj == null) return;
        obj = Object.entries(obj)
          .sort((a, b) => {
            const isLogin = b[1].isLogin * 1 - a[1].isLogin * 1;
            if (isLogin !== 0) return isLogin;
            const isOnline = b[1].isOnline * 1 - a[1].isOnline * 1;
            if (isOnline !== 0) return isOnline;
            return b[1].isWL * 1 - a[1].isWL * 1;
          })
          .reduce((result, item) => {
            result[item[0]] = item[1];
            return result;
          }, {});

        const container = config.viwe.container;
        if (!container) return;
        while (container.firstChild) {
          container.removeChild(container.lastChild);
        }
        container.appendChild(ui.getHTML(obj, { trafficMax: config.entity.traffic.max }));
      },
    },
    entity: {
      client: {
        intervalCode: null,
        data: null,
        getData: () => clientDataStore.fetchClientData(window.location.origin)
          .then((response) => {
            config.entity.client.data = response;
            return response;
          }),
      },
      traffic: {
        intervalCode: null,
        data: null,
        prevData: null,
        log: null,
        max: null,
        min: null,
        getData: () => clientDataStore.fetchTrafficData(window.location.origin)
          .then((response) => {
            config.entity.traffic.data = response;
            return response;
          }),
      },
    },
    colsHideName: ['type', 'log', 'speedInc', 'speedOut', 'inc', 'out'],
    colsDontShow: ['isWL', 'rssi', 'isOnline', 'internetState', 'name'],
    colsMB: ['inc', 'out'],
    colsMbps: ['speedInc', 'speedOut'],
    checkboxCols: ['isOnline', 'isLogin'],
    stateCols: ['internetMode'],
    typeCols: ['type', 'defaultType'],
    diagramCols: ['log'],
    cols: ['type', 'mac', 'nickName', 'ip', 'isWL', 'log', 'speedInc', 'speedOut', 'inc', 'out', 'rssi', 'isLogin', 'internetMode', 'curTx', 'curRx', 'from', 'vendor', 'isGN', 'wlConnectTime', 'ipMethod'],
  };

  const isWLConfig = {
    0: { text: 'Ethernet', type: 'eth', idx: 1 },
    1: { text: '2.4 GHz', type: '2g', idx: 1 },
    2: { text: '5 GHz', type: '5g', idx: 1 },
    3: { text: '5 GHz', type: '5g', idx: 2 },
    4: { text: '6 GHz', type: '6g', idx: 1 },
  };

  const rssiConfig = {
    0: { text: 'Відсутній' },
    1: { text: 'Слабкий' },
    2: { text: 'Хороший' },
    3: { text: 'Надійний' },
    4: { text: 'Дуже надійний' },
  };

  initModal();

  function transformData() {
    const state = clientDataStore.transformData();
    if (state == null) return null;

    config.entity.traffic.max = state.max;
    config.entity.traffic.min = state.min;
    config.entity.traffic.log = state.log;
    config.entity.traffic.prevData = state.prevData;

    return state.obj;
  }

  function newModal() {
    const dialog = document.createElement('dialog');
    dialog.setAttribute('id', config.id);
    document.body.appendChild(dialog);
    addHead(dialog, config.title);

    const container = document.createElement('div');
    container.className = 'clients-modal-body';
    dialog.appendChild(container);
    dialog.className = styles.modal;
    container.innerHTML = '<div class="clients-loading">Loading clients…</div>';
    dialog.showModal();
    config.viwe.container = container;
  }

  function addHead(dialog, title) {
    const container = document.createElement('div');
    container.className = 'clients-header-wrap';
    dialog.appendChild(container);

    const row = document.createElement('div');
    row.className = styles.headerRow;
    container.appendChild(row);

    const colTitle = document.createElement('div');
    colTitle.innerHTML = title;
    colTitle.className = styles.headerTitle;
    row.appendChild(colTitle);

    const colClose = document.createElement('div');
    colClose.className = styles.headerActions;
    row.appendChild(colClose);

    const closeButton = document.createElement('button');
    closeButton.setAttribute('id', `${config.id}Button`);
    closeButton.className = 'btn-close clients-close-button';
    closeButton.setAttribute('type', 'button');
    closeButton.addEventListener('click', () => {
      dialog.close();
      const entity = config.entity;
      for (const item in entity) {
        clearInterval(entity[item].intervalCode);
      }
      clearInterval(config.viwe.intervalCode);
      dialog.remove();
    });
    colClose.appendChild(closeButton);
  }

  function initModal() {
    const btn = document.getElementById(`${config.id}Button`);
    if (btn) btn.click();
    newModal();
    const entity = config.entity;
    for (const item in entity) {
      entity[item].intervalCode = setInterval(entity[item].getData, config.inrevalSec * 1000);
    }
    config.viwe.intervalCode = setInterval(config.viwe.setViwe, config.inrevalSec * 1000);
  }

  ui = createClientsUi(config, {
    isWLConfig,
    rssiConfig,
    templates,
    styles,
    truncateText: AsusRouterHelpers.truncateText,
    Diagram: globalThis.Diagram,
  });
}(typeof globalThis !== 'undefined' ? globalThis : this));
