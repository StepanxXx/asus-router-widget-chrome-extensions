(function (root) {
  function createNetworkDataStore(options = {}) {
    const { requestBuilder, networkTypes = {} } = options;

    function normalizeResponse(responseText) {
      return responseText
        .replace('netdev = ', '')
        .replace('INTERNET', 'INTERNET0')
        .replaceAll("'", '"')
        .replaceAll('rx:', '"rx":"')
        .replaceAll(',tx:', '","tx":"')
        .replaceAll('}', '"}')
        .replace('\n"}', '\n}')
        .replace(/\n/g, '\n');
    }

    function fetchNetworkData(origin) {
      return fetch(...requestBuilder(origin))
        .then((response) => response.text())
        .then(normalizeResponse)
        .then(JSON.parse)
        .then((obj) => {
          Object.keys(obj).forEach((key) => {
            if (obj[key] && typeof obj[key].rx !== 'undefined') obj[key].rx = obj[key].rx * 1;
            if (obj[key] && typeof obj[key].tx !== 'undefined') obj[key].tx = obj[key].tx * 1;
          });
          obj.stamp = new Date() * 1;
          return obj;
        });
    }

    function getDirection(item, vector) {
      const isIncInternet = item.startsWith('INTERNET') && vector === 'out';
      const isOutNotInternet = !item.startsWith('INTERNET') && vector === 'inc';
      return isIncInternet || isOutNotInternet ? 'out' : 'inc';
    }

    function transformResponse(cur, prev) {
      const validKey = Object.keys(networkTypes);
      const result = {};
      result.stamp = cur.stamp;
      let allLog = [];

      validKey.forEach((item) => {
        if (!Object.prototype.hasOwnProperty.call(cur, item)) return;

        const inc = getDirection(item, 'inc');
        const out = getDirection(item, 'out');
        const total = {};
        total[inc] = cur[item].rx;
        total[out] = cur[item].tx;

        const speed = {};
        if (prev !== null && prev !== undefined && prev[item]) {
          speed.inc = (total.inc - prev[item].total.inc) / ((cur.stamp - prev.stamp) / 1000);
          speed.out = (total.out - prev[item].total.out) / ((cur.stamp - prev.stamp) / 1000);
          let log = prev[item].speed.log || [];
          log.push({ inc: speed.inc, out: speed.out, stamp: cur.stamp });
          speed.log = log.length <= 30 ? log : log.slice(log.length - 30, log.length);
          allLog = allLog.concat(speed.log.reduce((arr, entry) => [...arr, ...[entry.out, entry.inc]], []));
        }

        result[item] = { speed, total };
      });

      if (allLog.length > 0) {
        result.max = Math.max(...allLog);
        result.min = Math.min(...allLog);
      }

      return result;
    }

    return {
      fetchNetworkData,
      transformResponse,
    };
  }

  root.AsusRouterNetworksData = root.AsusRouterNetworksData || {};
  root.AsusRouterNetworksData.createNetworkDataStore = createNetworkDataStore;
}(typeof globalThis !== 'undefined' ? globalThis : this));
