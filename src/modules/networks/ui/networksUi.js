(function (root) {
  function createNetworksUi(config, helpers) {
    const { styles, Diagram, cnvrtMbps, cnvrtMb, getVector } = helpers;

    function getHTML(obj) {
      const table = document.createElement('table');
      table.setAttribute('class', styles?.table || 'networks-table');
      const tbody = document.createElement('tbody');
      table.appendChild(tbody);

      const tr = document.createElement('tr');
      tbody.appendChild(tr);
      const totalCell = document.createElement('td');
      totalCell.setAttribute('colspan', '4');
      totalCell.setAttribute('class', styles?.totalCell || 'networks-total-cell');
      totalCell.innerHTML = `Max per minute: ${cnvrtMbps(obj.max)}`;
      tr.appendChild(totalCell);

      Object.keys(config.network.type).forEach((item) => {
        ['inc', 'out'].forEach((vector, index) => {
          const row = document.createElement('tr');
          tbody.appendChild(row);

          if (index === 0) {
            const titleCell = document.createElement('td');
            titleCell.setAttribute('class', styles?.titleCell || 'networks-title-cell');
            titleCell.setAttribute('rowspan', '2');
            titleCell.innerHTML = config.network.type[item];
            row.appendChild(titleCell);
          }

          ['total', 'speed'].forEach((type) => {
            const cell = document.createElement('td');
            cell.setAttribute('class', styles?.metricCell || 'networks-metric-cell');
            row.appendChild(cell);
            displayValue(cell, type, vector, obj[item][type][vector]);
          });

          if (index === 0) {
            const diagramCell = document.createElement('td');
            diagramCell.setAttribute('class', styles?.diagramCell || 'networks-diagram-cell');
            diagramCell.setAttribute('rowspan', '2');
            diagramCell.appendChild(getDiagram(obj[item].speed.log, obj.max));
            row.appendChild(diagramCell);
          }
        });
      });

      return table;
    }

    function displayValue(td, type, vector, value) {
      let typedValue = '';
      switch (type) {
        case 'speed':
          typedValue = cnvrtMbps(value);
          break;
        case 'total':
          typedValue = cnvrtMb(value);
          break;
      }

      td.innerHTML = typedValue + getVector(vector);
    }

    function getDiagram(value, max) {
      const points = !value ? [] : value.map((speed) => speed.out);
      const points2 = !value ? [] : value.map((speed) => speed.inc);
      const canvas = document.createElement('canvas');
      canvas.className = 'networks-diagram';

      const diagramConfig = {
        canvas,
        width: 150,
        height: 50,
        maxPoints: 30,
        step: 15,
        corector: 10,
        min: 0,
        max,
      };

      const diagram = new Diagram(diagramConfig);
      diagram.drawDiagram(points, '220, 134, 142');
      diagram.drawDiagram(points2, '25, 135, 84');
      return canvas;
    }

    return {
      getHTML,
      displayValue,
    };
  }

  root.AsusRouterNetworksUi = {
    createNetworksUi,
  };
}(typeof globalThis !== 'undefined' ? globalThis : this));
