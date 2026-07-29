(function (root) {
  function createClientsUi(config, helpers) {
    const { isWLConfig, rssiConfig, icon, cnvrtMbps, cnvrtMb, getVector, getCheckbox, getStateView, getInternetState, getWifiRssiView, getRssiEthernetView, getConectionTypeView, getCheckboxWrapper, getTypeView, getTitleView, convertRSSI, getDiagram, getTruncatedValue } = helpers;

    function getHTML(obj, state) {
      const table = document.createElement('table');
      table.setAttribute('class', 'table text-end table-hover table-dark table-sm');
      const tbody = document.createElement('tbody');
      table.appendChild(tbody);

      config.cols.forEach((col) => {
        if (config.colsDontShow.includes(col)) return;
        const tr = document.createElement('tr');
        tbody.appendChild(tr);
        const tdTitle = document.createElement('td');
        tdTitle.setAttribute('class', 'text-start');
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

    return {
      getHTML,
      displayValue,
    };
  }

  root.AsusRouterClientsUi = {
    createClientsUi,
  };
}(typeof globalThis !== 'undefined' ? globalThis : this));
