(function (root) {
  function createClientDataStore() {
    const state = {
      clientData: null,
      trafficData: null,
      prevData: null,
      log: null,
      max: null,
      min: null,
    };

    function getClientRequest(origin) {
      return [`${origin}/update_clients.asp?_=${new Date() * 1}`, {
        headers: {
          accept: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
        },
        method: 'GET',
      }];
    }

    function getTrafficRequest(origin) {
      return [`${origin}/getTraffic.asp?_=${new Date() * 1}`, {
        headers: {
          accept: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
        },
        method: 'GET',
      }];
    }

    function normalizeClientResponse(responseText) {
      return responseText
        .replace(/networkmap_fullscan.*/smgi, '')
        .replace(/networkmap_fullscan.*/ismg, '')
        .replace(/.*originData = /ismg, '')
        .replace('fromNetworkmapd', '"fromNetworkmapd"')
        .replace('nmpClient', '"nmpClient"');
    }

    function normalizeTrafficResponse(responseText) {
      return responseText
        .replace(/.* new Array\(\);/ismg, '')
        .replace('array_traffic = ', '{"array_traffic":')
        .replace('router_traffic = ', '"router_traffic":')
        .replace(';', ',')
        .replace(';', '}');
    }

    function fetchClientData(origin) {
      return fetch(...getClientRequest(origin))
        .then((response) => response.text())
        .then(normalizeClientResponse)
        .then(JSON.parse)
        .then((response) => {
          state.clientData = response.fromNetworkmapd[0];
          return state.clientData;
        });
    }

    function fetchTrafficData(origin) {
      return fetch(...getTrafficRequest(origin))
        .then((response) => response.text())
        .then(normalizeTrafficResponse)
        .then(JSON.parse)
        .then((result) => {
          result.stamp = new Date() * 1;
          state.trafficData = result;
          return result;
        });
    }

    function getTrafficDelta(traffic, prevTraffic, item) {
      const itemTraffic = Array.isArray(traffic.array_traffic)
        ? traffic.array_traffic.filter((arr) => arr[0] === item)
        : [];
      const [, out, inc] = itemTraffic[0] ? itemTraffic[0] : new Array(3);
      const hasPrev = prevTraffic !== null && Object.prototype.hasOwnProperty.call(prevTraffic, item);
      const { inc: incPrev, out: outPrev } = hasPrev ? prevTraffic[item] : {};
      const [speedInc, speedOut] = ![incPrev, outPrev, inc, out].includes(undefined)
        ? [
            (inc - incPrev) / ((traffic.stamp - prevTraffic.stamp) / 1000),
            (out - outPrev) / ((traffic.stamp - prevTraffic.stamp) / 1000),
          ]
        : [0, 0];

      return { inc, out, speedInc, speedOut };
    }

    function setNewLog(data, log, traffic, item) {
      let result = log[item] ? log[item] : [];
      if (data.isOnline === '0') {
        log[item] = [];
        return;
      }

      const [speedInc, speedOut] = [data.speedInc, data.speedOut];
      if (speedInc !== undefined && speedOut !== undefined) {
        result.push({ inc: speedInc, out: speedOut, stamp: traffic.stamp });
      }

      const logLength = result.length;
      if (logLength > 30) {
        result = result.slice(logLength - 30, logLength);
      }
      log[item] = result;
    }

    function setTrafficMaxMin(log) {
      let max = null;
      let min = null;
      for (const item in log) {
        max = Math.max(max, ...log[item].map((i) => (i.out && i.out > 0) ? i.out : 0));
        max = Math.max(max, ...log[item].map((i) => (i.inc && i.inc > 0) ? i.inc : 0));
        min = Math.min(min, ...log[item].map((i) => (i.out && i.out > 0) ? i.out : 0));
        min = Math.min(min, ...log[item].map((i) => (i.inc && i.inc > 0) ? i.inc : 0));
      }

      state.max = max ? max : 0;
      state.min = min ? min : 0;
    }

    function transformData() {
      const client = state.clientData;
      const traffic = state.trafficData;
      if (client == null || traffic == null) return null;

      const obj = {};
      const prevTraffic = state.prevData;
      const log = state.log ? state.log : {};
      const curtTraffic = {};
      curtTraffic.stamp = traffic.stamp;

      for (const item in client) {
        if (['maclist', 'ClientAPILevel'].includes(item)) continue;

        const data = getTrafficDelta(traffic, prevTraffic, item);
        for (const key in client[item]) data[key] = client[item][key];
        curtTraffic[item] = { inc: data.inc, out: data.out };
        setNewLog(data, log, traffic, item);
        data.log = log[item];
        obj[item] = data;
      }

      state.log = log;
      state.prevData = curtTraffic;
      setTrafficMaxMin(log);

      return {
        obj,
        log: state.log,
        prevData: state.prevData,
        max: state.max,
        min: state.min,
      };
    }

    return {
      fetchClientData,
      fetchTrafficData,
      transformData,
      getState: () => state,
    };
  }

  root.AsusRouterClientData = root.AsusRouterClientData || {};
  root.AsusRouterClientData.createClientDataStore = createClientDataStore;
}(typeof globalThis !== 'undefined' ? globalThis : this));
