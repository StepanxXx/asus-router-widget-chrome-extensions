(function () {
    const clientDataStore = AsusRouterClientData.createClientDataStore();
    const { createClientsUi } = AsusRouterClientsUi;
    const templates = AsusRouterClientsTemplates;
    const styles = AsusRouterClientsStyles;
    let ui = null;
    const config = {
        id: "clientsModal",
        title: "Clients",
        inrevalSec: 2,
        viwe:{
            intervalCode: null,
            container: null,
            setViwe: () => {
                let obj = transformData();
                if (obj == null) return;
                obj = Object.entries(obj)
                    .sort((a,b) => {
                        const isLogin  = b[1].isLogin * 1 - a[1].isLogin * 1;
                        if (isLogin !== 0) return isLogin;
                        const isOnline = b[1].isOnline * 1 - a[1].isOnline * 1; 
                        if (isOnline !== 0) return isOnline;
                        return isWifi  = b[1].isWL * 1 - a[1].isWL * 1;
                    })
                    .reduce( (result, item) => { result[item[0]]=item[1]; return result; }, {} )    
                const container = config.viwe.container;
                while (container.firstChild) {
                    container.removeChild(container.lastChild);
                }
                container.appendChild(ui.getHTML(obj, { trafficMax: config.entity.traffic.max }));
            }
        },
        entity: {
            client:{
                intervalCode: null,
                data: null,
                getData: () => clientDataStore.fetchClientData(window.location.origin)
                    .then(response => { config.entity.client.data = response; return response; }),
            },
            traffic:{
                intervalCode: null,
                data: null,
                prevData: null,
                log: null,
                max: null,
                min: null,
                getData: () => clientDataStore.fetchTrafficData(window.location.origin)
                    .then(response => { config.entity.traffic.data = response; return response; }),
            }
        },
        colsHideName:[
            "type",
            "log",
            // "internetMode",
            "speedInc",
            "speedOut",
            "inc",
            "out",
        ],
        colsDontShow:[
            "isWL",
            "rssi",
            "isOnline",
            "internetState",
            "name",
        ],
        colsMB:[
            "inc",
            "out",
        ],
        colsMbps:[
            "speedInc",
            "speedOut",
        ],
        checkboxCols:[
            "isOnline",
            "isLogin",
        ],
        stateCols:[
            "internetMode",
        ],
        typeCols:[
            "type",
            "defaultType"
        ],
        diagramCols:[
            "log",
        ],
        cols:[
            "type",
            "mac",
            // "name",
            "nickName",
            "ip",
            "isWL",
            "log",
            "speedInc",
            "speedOut",
            "inc",
            "out",
            "rssi",
            // "defaultType",
            // "isOnline",
            "isLogin",
            "internetMode",
            // "internetState",
            "curTx",
            "curRx",
            "from",
            "vendor",
            "isGN",
            // "totalTx",
            // "totalRx",
            "wlConnectTime",
            "ipMethod",
        ]
    };
    
    const isWLConfig = {
        "0": {
            "text": "Ethernet",
            "type": "eth",
            "idx": 1
        },
        "1": {
            "text": "2.4 GHz",
            "type": "2g",
            "idx": 1
        },
        "2": {
            "text": "5 GHz",
            "type": "5g",
            "idx": 1
        },
        "3": {
            "text": "5 GHz",
            "type": "5g",
            "idx": 2
        },
        "4": {
            "text": "6 GHz",
            "type": "6g",
            "idx": 1
        }
    };

    const rssiConfig = {
        "0": {
            "text": "Відсутній",
        },
        "1": {
            "text": "Слабкий",
        },
        "2": {
            "text": "Хороший",
        },
        "3": {
            "text": "Надійний",
        },
        "4": {
            "text": "Дуже надійний",
        }
    };

    initModal ();
 
    function transformData() {
        const state = clientDataStore.transformData();
        if (state == null) return null;

        config.entity.traffic.max = state.max;
        config.entity.traffic.min = state.min;
        config.entity.traffic.log = state.log;
        config.entity.traffic.prevData = state.prevData;

        return state.obj;
    }


    function getHTML(obj) {
        return ui.getHTML(obj, { trafficMax: config.entity.traffic.max });
    }

    function newModal() {
        const dialog = document.createElement("dialog");
        dialog.setAttribute("id", config.id);
        document.body.appendChild(dialog);
        addHead(dialog, config.title);
        const container = document.createElement("div");
        dialog.appendChild(container);
        dialog.className = styles.modal;
        container.innerHTML =`<h2><span class="badge bg-secondary">in progres...</span></h2>`
        dialog.showModal();
        config.viwe.container = container;
    }

    function addHead(dialog, title) {
        const container = document.createElement("div");
        container.setAttribute("style", "margin-bottom: 10px;");
        dialog.appendChild(container);
        const row = document.createElement("div");
        row.className = styles.headerRow;
        container.appendChild(row);
        const colTitle = document.createElement("div");
        colTitle.innerHTML = title
        colTitle.className = styles.headerTitle;
        row.appendChild(colTitle);
        const colClose = document.createElement("div");
        colClose.className = styles.headerActions;
        row.appendChild(colClose);
        const closeButton = document.createElement("button");
        closeButton.setAttribute("id", config.id + "Button");
        closeButton.className = "btn-close";
        closeButton.setAttribute("type", "button");
        closeButton.setAttribute("style", "filter: var(--bs-btn-close-white-filter);");
        closeButton.addEventListener("click", () => {
            dialog.close();
            const entity = config.entity
            for (const item in entity)
                clearInterval(entity[item].intervalCode);
            clearInterval(config.viwe.intervalCode);
            dialog.remove();
        });
        colClose.appendChild(closeButton);
    }

    function initModal () {
        const btn = document.getElementById(config.id + "Button");
        if (btn) btn.click();
        newModal();
        const entity = config.entity
        for (const item in entity)
            entity[item].intervalCode = setInterval(entity[item].getData, config.inrevalSec * 1000);
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

    function getTruncatedValue(value, maxLength = 18) {
        return AsusRouterHelpers.truncateText(value, maxLength);
    }

    function getWifiRssiView(value) {
        const rssiLevel = convertRSSI(value);
        const classList = `d-inline-block position-absolute radioIcon radio_${rssiLevel}`;
        const style = `width: 70%; height: 18px; background-position-x: right; padding-right: 30px; bottom: 0.5rem; right: 0.5rem;`;
        return `<div style="${style}" class="${classList}" title="${rssiConfig[rssiLevel].text}">rssi ${value}</div>`;
    }

    function getRssiEthernetView() {
        return `<div style="width: 100%;background-position-x: right;padding-right: 36px;height: 19px;background-size: contain;" class="radioIcon radio_wired" title="Дротове з'єднання"></div>`;
    }

    function getConectionTypeView(value, item) {
        if (!isWLConfig[value]) return "";
        const isWifi = item.isWL !== "0";
        const isOnline = item.isOnline === "1";
        const color = isOnline ? "text-info" : "text-secondary";
        const classList = `d-inline-block position-absolute fw-bold text-end ${color}`;
        const style = `top: 0.5rem; right: 0.5rem;`;
        if (isWifi) {
            const rssiLevel = convertRSSI(item.rssi);
            const title = isOnline ? rssiConfig[rssiLevel].text + ": rssi " + item.rssi : "";
            const name = isWLConfig[value].text + (isWLConfig[value].idx == 1 ? "" : " - " + isWLConfig[value].idx);
            return `<div style="width: 70px; ${style}" title="${title}" class="${classList}">
                <div class="d-inline-block fs-1" style="height: 35px; width: 35px; margin-bottom: -10px;">${icon.wifi}</div>
                <div>${name}</div>
            </div>`;
        }
        return `<div style="height: 35px; width: 35px; ${style}" class="${classList}" title="Дротове з'єднання">${icon.ethernet}</div>`;
    }

    function getCheckboxWrapper(value, isOnline) {
        const title = isOnline ? "Is online" : "Is offline";
        const classList = `d-inline-block position-absolute text-start`;
        const style = `width: 70%; height: 18px; bottom: 0.5rem; left: 0.5rem;`;
        return `<div style="${style}" class="${classList}" title="${title}">${value}</div>`;
    }

    function getTypeView(value, item) {
        const isOnline = item.isOnline === "1";
        const isOnlineWifi = item.isWL !== "0" && isOnline;
        const rssi = isOnlineWifi ? getWifiRssiView(item.rssi) : "";
        const borderColor = isOnline ? "border-info" : "border-secondary";
        const classList = `rounded border ${borderColor} position-relative p-2 type${value}`;
        const title = isOnline ? "Is online" : "Is offline";
        const style = `width: 100%; height: 100px; background-repeat: no-repeat;`;
        const switcCheckbox = getCheckbox(isOnline ? 1 : 0);
        const switcWrapper = getCheckboxWrapper(switcCheckbox, isOnline);
        return `${getTitleView(item.name, item)}
        <div style="${style}" class="${classList}" title="${title}">
            ${getConectionTypeView(item.isWL, item)}
            ${rssi}
            ${switcWrapper}
            ${getInternetState(item.internetState)}
        </div>`;
    }

    function getTitleView(value = "", item) {
        const isOnline = item.isOnline === "1";
        const textColor = isOnline ? "text-info" : "text-secondary";
        const classList = `text-center fs-6 font-monospace ${textColor}`;
        const name = value.substring(0, 12) + (value.length > 12 ? "..." : "");
        return `<p class="${classList}" title="name: ${value}">${name}</p>`;
    }

    function convertRSSI(value) {
        let result = 1;
        value = parseInt(value);
        if (value >= -50) result = 4;
        else if (value >= -80) result = Math.ceil((24 + ((value + 80) * 26) / 10) / 25);
        else if (value >= -90) result = Math.ceil((((value + 90) * 26) / 10) / 25);
        else return 1;
        if (result == 0) result = 1;
        return result + "";
    }

    function getDiagram(value) {
        const points = !value ? [] : value.map((speed) => speed.out);
        const points2 = !value ? [] : value.map((speed) => speed.inc);
        const canvas = document.createElement("canvas");

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
        diagram.drawDiagram(points, "220, 134, 142");
        diagram.drawDiagram(points2, "25, 135, 84");
        return canvas;
    }

    function cnvrtMbps(value) {
        if (value === undefined) return "Mbps";
        let resultNumber = Math.round(value / 1024 / 1024 * 8 * 100) / 100;
        resultNumber = resultNumber < 0 ? 0 : resultNumber;
        let result = resultNumber.toLocaleString() + " Mbps";
        result = getSpase(15 - result.length) + result;
        return result;
    }

    function cnvrtMb(value) {
        if (value === undefined) return "MB";
        let resultNumber = Math.round(value / 1024 / 1024);
        resultNumber = resultNumber < 0 ? 0 : resultNumber;
        let result = resultNumber.toLocaleString() + " MB";
        result = getSpase(15 - result.length) + result;
        return result;
    }

    function getSpase(count) {
        if (count < 1) return "";
        return "&nbsp;".repeat(count);
    }

    function getVector(vector) {
        const inc = ["inc", "speedInc"].includes(vector);
        const out = ["out", "speedOut"].includes(vector);
        const color = inc ? "text-success" : "text-danger";
        const icon = out ? "&#9650" : "&#9660";
        return `<span class="${color}">${icon}</span>`;
    }

    function getCheckbox(value) {
        if (value >= 1) return `
        <span class="form-switch">
            <input class="form-check-input" type="checkbox" checked onclick="return false">
        </span>`;
        return `
        <span class="form-switch">
            <input class="form-check-input" type="checkbox" disabled>
        </span>`;
    }

    function getStateView(value) {
        if (!["block", "allow"].includes(value)) return value;
        const color = value == "block" ? "text-danger" : "";
        const icon = value == "block" ? "&#128711" : "&#10003";
        return `<p class="fw-bold text-end ${color}" title="${value}">${icon}</p>`;
    }

    function getInternetState(value) {
        if (["1", 1].includes(value)) return "";
        if (!["1", 1, 0].includes(value)) return "InternetState: " + value;
        const color = value == 0 ? "text-danger" : "text-info";
        const icon = value == 0 ? "&#128711" : "&#10003";
        const title = value == 0 ? "internetState = Block Internet access" : "internetState = Allow Internet access";
        const classList = `d-inline-block position-absolute fw-bold text-start ${color}`;
        const style = `width: 18%; height: 26px; top: 1.6rem; left: 1.6rem; font-size: 26px;`;
        return `<h4 style="${style}" class="${classList}" title="${title}">${icon}</h4>`;
    }

})()