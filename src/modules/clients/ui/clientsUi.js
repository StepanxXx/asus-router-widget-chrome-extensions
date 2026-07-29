(function (root) {
  function createClientsUi(config, helpers) {
    const { isWLConfig, rssiConfig, templates, styles, truncateText, Diagram } = helpers;
    const icon = templates?.icon || {};

    function getHTML(obj, state) {
      const table = document.createElement('table');
      table.setAttribute('class', styles?.table || 'clients-table');
      const tbody = document.createElement('tbody');
      table.appendChild(tbody);

      config.cols.forEach((col) => {
        if (config.colsDontShow.includes(col)) return;
        const tr = document.createElement('tr');
        tbody.appendChild(tr);
        const tdTitle = document.createElement('td');
        tdTitle.setAttribute('class', styles?.titleCell || 'clients-title-cell');
        tr.appendChild(tdTitle);
        tdTitle.innerHTML = config.colsHideName.includes(col) ? '' : col;
        const maxSpeed = state?.trafficMax;
        if (col === 'log') tdTitle.innerHTML = maxSpeed ? `Max per minute<div>${cnvrtMbps(maxSpeed)}</div>` : '';

        for (const itemKey in obj) {
          const td = document.createElement('td');
          tr.appendChild(td);
          displayValue(td, col, obj[itemKey][col], obj[itemKey]);
        }
      });

      return table;
    }

    function displayValue(td, col, value, item) {
      const isOnlineWifi = item.isWL !== '0' && item.isOnline === '1';
      const isOnlineEthernet = item.isWL == '0' && item.isOnline === '1';
      switch (true) {
        case config.checkboxCols.includes(col): return td.innerHTML = getCheckbox(value);
        case config.diagramCols.includes(col): return td.appendChild(getDiagram(value));
        case config.colsMB.includes(col): return td.innerHTML = cnvrtMb(value) + getVector(col);
        case config.colsMbps.includes(col): return td.innerHTML = cnvrtMbps(value) + getVector(col);
        case config.stateCols.includes(col): return td.innerHTML = getStateView(value);
        case config.typeCols.includes(col): return td.innerHTML = getTypeView(value, item);
        case col === 'rssi' && isOnlineWifi: return td.innerHTML = getWifiRssiView(value);
        case col === 'rssi' && isOnlineEthernet: return td.innerHTML = getRssiEthernetView(value);
        case col === 'internetState': return td.innerHTML = getInternetState(value);
        case col === 'nickName': return td.innerHTML = getTruncatedValue(value, 18);
        default: return td.innerHTML = value;
      }
    }

    function getTruncatedValue(value, maxLength = 18) {
      return typeof truncateText === 'function' ? truncateText(value, maxLength) : String(value ?? '');
    }

    function getWifiRssiView(value) {
      const rssiLevel = convertRSSI(value);
      const classList = `clients-rssi clients-rssi--wifi radioIcon radio_${rssiLevel}`;
      return `<div class="${classList}" title="${rssiConfig[rssiLevel].text}">rssi ${value}</div>`;
    }

    function getRssiEthernetView() {
      return '<div class="clients-rssi clients-rssi--wired radioIcon radio_wired" title="Дротове з\'єднання"></div>';
    }

    function getConectionTypeView(value, item) {
      if (!isWLConfig[value]) return '';
      const isWifi = item.isWL !== '0';
      const isOnline = item.isOnline === '1';
      const stateClass = isOnline ? 'is-online' : 'is-offline';
      const title = isOnline ? `${rssiConfig[convertRSSI(item.rssi)].text}: rssi ${item.rssi}` : '';
      const name = isWLConfig[value].text + (isWLConfig[value].idx == 1 ? '' : ` - ${isWLConfig[value].idx}`);

      if (isWifi) {
        return `<div class="clients-connection-type ${stateClass}" title="${title}">
          <div class="clients-connection-icon">${icon.wifi}</div>
          <div class="clients-connection-type-name">${name}</div>
        </div>`;
      }

      return `<div class="clients-connection-type ${stateClass}" title="Дротове з'єднання"><div class="clients-connection-icon">${icon.ethernet}</div></div>`;
    }

    function getCheckboxWrapper(value, isOnline) {
      const title = isOnline ? 'Is online' : 'Is offline';
      return `<div class="clients-checkbox-wrapper ${isOnline ? 'is-online' : 'is-offline'}" title="${title}">${value}</div>`;
    }

    function getTypeView(value, item) {
      const isOnline = item.isOnline === '1';
      const isOnlineWifi = item.isWL !== '0' && isOnline;
      const rssi = isOnlineWifi ? getWifiRssiView(item.rssi) : '';
      const stateClass = isOnline ? 'is-online' : 'is-offline';
      const title = isOnline ? 'Is online' : 'Is offline';
      const switchCheckbox = getCheckbox(isOnline ? 1 : 0);
      const switchWrapper = getCheckboxWrapper(switchCheckbox, isOnline);
      return `${getTitleView(item.name, item)}
      <div class="clients-connection-card ${stateClass} type${value}" title="${title}">
        ${getConectionTypeView(item.isWL, item)}
        ${rssi}
        ${switchWrapper}
        ${getInternetState(item.internetState)}
      </div>`;
    }

    function getTitleView(value = '', item) {
      const isOnline = item.isOnline === '1';
      const stateClass = isOnline ? 'is-online' : 'is-offline';
      const name = value.substring(0, 12) + (value.length > 12 ? '...' : '');
      return `<p class="clients-card-title ${stateClass}" title="name: ${value}">${name}</p>`;
    }

    function convertRSSI(value) {
      let result = 1;
      value = parseInt(value, 10);
      if (value >= -50) result = 4;
      else if (value >= -80) result = Math.ceil((24 + ((value + 80) * 26) / 10) / 25);
      else if (value >= -90) result = Math.ceil((((value + 90) * 26) / 10) / 25);
      else return 1;
      if (result === 0) result = 1;
      return `${result}`;
    }

    function getDiagram(value) {
      const points = !value ? [] : value.map((speed) => speed.out);
      const points2 = !value ? [] : value.map((speed) => speed.inc);
      const canvas = document.createElement('canvas');
      canvas.className = 'clients-diagram';
      const diagramConfig = {
        canvas,
        width: 150,
        height: 50,
        maxPoints: 30,
        step: 15,
        corector: 10,
        min: 0,
        max: config.entity.traffic.max,
      };
      const diagram = new Diagram(diagramConfig);
      diagram.drawDiagram(points, '220, 134, 142');
      diagram.drawDiagram(points2, '25, 135, 84');
      return canvas;
    }

    function cnvrtMbps(value) {
      if (value === undefined) return 'Mbps';
      let resultNumber = Math.round(value / 1024 / 1024 * 8 * 100) / 100;
      resultNumber = resultNumber < 0 ? 0 : resultNumber;
      let result = `${resultNumber.toLocaleString()} Mbps`;
      result = getSpase(15 - result.length) + result;
      return result;
    }

    function cnvrtMb(value) {
      if (value === undefined) return 'MB';
      let resultNumber = Math.round(value / 1024 / 1024);
      resultNumber = resultNumber < 0 ? 0 : resultNumber;
      let result = `${resultNumber.toLocaleString()} MB`;
      result = getSpase(15 - result.length) + result;
      return result;
    }

    function getSpase(count) {
      if (count < 1) return '';
      return '&nbsp;'.repeat(count);
    }

    function getVector(vector) {
      const inc = ['inc', 'speedInc'].includes(vector);
      const out = ['out', 'speedOut'].includes(vector);
      const color = inc ? 'text-success' : 'text-danger';
      const iconValue = out ? '&#9650' : '&#9660';
      return `<span class="${color}">${iconValue}</span>`;
    }

    function getCheckbox(value) {
      if (value >= 1) return `
        <span class="clients-form-switch form-switch">
            <input class="form-check-input" type="checkbox" checked onclick="return false">
        </span>`;
      return `
        <span class="clients-form-switch form-switch">
            <input class="form-check-input" type="checkbox" disabled>
        </span>`;
    }

    function getStateView(value) {
      if (!['block', 'allow'].includes(value)) return value;
      const color = value === 'block' ? 'is-danger' : 'is-muted';
      const iconValue = value === 'block' ? '&#128711' : '&#10003';
      return `<p class="clients-state-badge ${color}" title="${value}">${iconValue}</p>`;
    }

    function getInternetState(value) {
      if (['1', 1].includes(value)) return '';
      if (!['1', 1, 0].includes(value)) return `InternetState: ${value}`;
      const stateClass = value == 0 ? 'is-offline' : 'is-online';
      const iconValue = value == 0 ? '&#128711' : '&#10003';
      const title = value == 0 ? 'internetState = Block Internet access' : 'internetState = Allow Internet access';
      return `<h4 class="clients-internet-state ${stateClass}" title="${title}">${iconValue}</h4>`;
    }

    return {
      getHTML,
      displayValue,
    };
  }

  root.AsusRouterClientsUi = {
    createClientsUi,
  };
}(typeof globalThis !== 'undefined' ? globalThis : this));
