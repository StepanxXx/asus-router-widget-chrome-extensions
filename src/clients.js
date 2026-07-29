(function () {
    const clientDataStore = AsusRouterClientData.createClientDataStore();
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
                container.appendChild(getHTML(obj));
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

    const icon = {
        ethernet: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ethernet" viewBox="0 0 16 16" style="width: 100%; height:100%;">
            <path d="M14 13.5v-7a.5.5 0 0 0-.5-.5H12V4.5a.5.5 0 0 0-.5-.5h-1v-.5A.5.5 0 0 0 10 3H6a.5.5 0 0 0-.5.5V4h-1a.5.5 0 0 0-.5.5V6H2.5a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5M3.75 11h.5a.25.25 0 0 1 .25.25v1.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-1.5a.25.25 0 0 1 .25-.25m2 0h.5a.25.25 0 0 1 .25.25v1.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-1.5a.25.25 0 0 1 .25-.25m1.75.25a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v1.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25zM9.75 11h.5a.25.25 0 0 1 .25.25v1.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-1.5a.25.25 0 0 1 .25-.25m1.75.25a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v1.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25z"/>
            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1z"/>
        </svg>`,
        wifiPower0:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-reception-0" viewBox="0 0 16 16" style="width: 100%; height:100%;">
            <path d="M0 13.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m4 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m4 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m4 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
        </svg>`,
        wifiPower1:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-reception-1" viewBox="0 0 16 16" style="width: 100%; height:100%;">
            <path d="M0 11.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm4 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m4 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m4 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
        </svg>`,
        wifiPower2:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-reception-2" viewBox="0 0 16 16" style="width: 100%; height:100%;">
            <path d="M0 11.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm4 5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m4 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
        </svg>`,
        wifiPower3:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-reception-3" viewBox="0 0 16 16" style="width: 100%; height:100%;">
            <path d="M0 11.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm4 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
        </svg>`,
        wifiPower4:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-reception-4" viewBox="0 0 16 16" style="width: 100%; height:100%;">
            <path d="M0 11.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5z"/>
        </svg>`,
        wifi: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-wifi" viewBox="0 0 16 16" transform="rotate(45)" style="height:100%;width:100%">
            <path d="M15.384 6.115a.485.485 0 0 0-.047-.736A12.44 12.44 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.52.52 0 0 0 .668.05A11.45 11.45 0 0 1 8 4c2.507 0 4.827.802 6.716 2.164.205.148.49.13.668-.049"/>
            <path d="M13.229 8.271a.482.482 0 0 0-.063-.745A9.46 9.46 0 0 0 8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065A8.46 8.46 0 0 1 8 7a8.46 8.46 0 0 1 4.576 1.336c.206.132.48.108.653-.065m-2.183 2.183c.226-.226.185-.605-.1-.75A6.5 6.5 0 0 0 8 9c-1.06 0-2.062.254-2.946.704-.285.145-.326.524-.1.75l.015.015c.16.16.407.19.611.09A5.5 5.5 0 0 1 8 10c.868 0 1.69.201 2.42.56.203.1.45.07.61-.091zM9.06 12.44c.196-.196.198-.52-.04-.66A2 2 0 0 0 8 11.5a2 2 0 0 0-1.02.28c-.238.14-.236.464-.04.66l.706.706a.5.5 0 0 0 .707 0l.707-.707z"/>
        </svg>`
    }


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
        //return "<pre>"+JSON.stringify(obj, null, 2)+"</pre>";
        const table = document.createElement("table");
        table.setAttribute("class", "table text-end table-hover table-dark table-sm")
        const tbody = document.createElement("tbody")
        table.appendChild(tbody);
        config.cols.forEach( col => {
            if(config.colsDontShow.includes(col)) return;
            const tr = document.createElement("tr");
            tbody.appendChild(tr);
            const tdTitle  = document.createElement("td");
            tdTitle.setAttribute("class", "text-start");
            tr.appendChild(tdTitle);
            tdTitle.innerHTML = config.colsHideName.includes(col) ? "" : col;
            const maxSpeed = config.entity.traffic.max
            if(col === "log") tdTitle.innerHTML = maxSpeed ? "Max per minute<div>"+cnvrtMbps(maxSpeed)+"</div>" : "";
            for (item in obj) {
                const td = document.createElement("td");
                tr.appendChild(td);
                displayValue(td, col, obj[item][col], obj[item]);
            }
        });
        return table;
    }

    function newModal() {
        const dialog = document.createElement("dialog");
        dialog.setAttribute("id", config.id);
        document.body.appendChild(dialog);
        addHead(dialog, config.title);
        const container = document.createElement("div");
        dialog.appendChild(container);
        dialog.className 
            = "bg-dark font-monospace text-light text-opacity-75 border border-secondary border-2 rounded";
        container.innerHTML =`<h2><span class="badge bg-secondary">in progres...</span></h2>`
        dialog.showModal();
        config.viwe.container = container;
    }

    function addHead(dialog, title) {
        const container = document.createElement("div");
        container.setAttribute("style", "margin-bottom: 10px;");
        dialog.appendChild(container);
        const row = document.createElement("div");
        row.className = "row";
        container.appendChild(row);
        const colTitle = document.createElement("div");
        colTitle.innerHTML = title
        colTitle.className = "col-10";
        row.appendChild(colTitle);
        const colClose = document.createElement("div");
        colClose.className = "col text-end";
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

    function displayValue(td, col, value, item) {
        const isOnlineWifi = item.isWL !== "0" && item.isOnline === "1";
        const isOnlineEthernet = item.isWL == "0" && item.isOnline === "1";
        switch (true) {
            case config.checkboxCols.includes(col): return td.innerHTML = getCheckbox(value);
            case config.diagramCols.includes(col):  return td.appendChild(getDiagram(value));
            case config.colsMB.includes(col):       return td.innerHTML = cnvrtMb(value) + getVector(col);
            case config.colsMbps.includes(col):     return td.innerHTML = cnvrtMbps(value) + getVector(col);
            case config.stateCols.includes(col):    return td.innerHTML = getStateView(value);
            case config.typeCols.includes(col):     return td.innerHTML = getTypeView(value, item);
            case col === "rssi" && isOnlineWifi:    return td.innerHTML = getWifiRssiView(value);
            case col === "rssi" && isOnlineEthernet:    return td.innerHTML = getRssiEthernetView(value);
            case col === "internetState":           return td.innerHTML = getInternetState(value);
            case col === "nickName":                return td.innerHTML = getTruncatedValue(value, 24);
            default:                                return td.innerHTML = value;
        }
    /*
    <div class="radioIcon radio_2" title="Радіо: Хороший
Tx Rate: 408.3
Rx Rate: 6
Час доступу: 00:14:04"></div>
    */
    }

    function getTruncatedValue(value, maxLength = 24) {
        return AsusRouterHelpers.truncateText(value, maxLength);
    }

    function getWifiRssiView(value) {
        const  rssiLevel = convertRSSI(value);
        classList = `d-inline-block position-absolute radioIcon radio_${rssiLevel}`;
        const style = `width: 70%; height: 18px; background-position-x: right; padding-right: 30px; bottom: 0.5rem; right: 0.5rem;`;
        return `<div style="${style}"  class="${classList}" title="${rssiConfig[rssiLevel].text}">rssi ${value}</div>`
        // +`${value} <span style = "display: inline-block; height: 20px; width: 20px;" class="text-info">${icon["wifiPower"+rssiLevel]}</span>`
    }
    // function getWifiRssiView(value) {
    //     const  rssiLevel = convertRSSI(value);
    //     return `<div style="width: 100%; height: 100%; background-position-x: right; padding-right: 36px;"  class="radioIcon radio_${rssiLevel}" title="${rssiConfig[rssiLevel].text}">${value}</div>`
    //     // +`${value} <span style = "display: inline-block; height: 20px; width: 20px;" class="text-info">${icon["wifiPower"+rssiLevel]}</span>`
    // }

    function getRssiEthernetView() {
        return `<div style="width: 100%;background-position-x: right;padding-right: 36px;height: 19px;background-size: contain;"  class="radioIcon radio_wired" title="Дротове з'єднання"></div>`
    }


    function getConectionTypeView(value, item) {
        if (!isWLConfig[value]) return "";
        const isWifi = item.isWL !== "0";
        const isOnline = item.isOnline === "1";
        const color = isOnline ? "text-info" : "text-secondary" ;
        const classList = `d-inline-block position-absolute fw-bold text-end ${color}`;
        const style = `top: 0.5rem; right: 0.5rem;`;
        if (isWifi) {
            const rssiLevel = convertRSSI(item.rssi);
            const title = isOnline ? rssiConfig[rssiLevel].text + ": rssi " + item.rssi :  "";
            const name = isWLConfig[value].text + ( isWLConfig[value].idx == 1 ? "" : " - " + isWLConfig[value].idx )
            return `<div style="width: 70px; ${style}"  title="${title}" class="${classList}": ">
                <div class="d-inline-block fs-1" style="height: 35px; width: 35px; margin-bottom: -10px;">${icon.wifi}</div>
                <div>${name}</div>
            </div>`;
        }
        return `<div style="height: 35px; width: 35px; ${style}"; " class="${classList}" title="Дротове з'єднання">${icon.ethernet}</div>`
    }

    function getCheckboxWrapper(value, isOnline) {
        const title = isOnline ? "Is online": "Is offline";
        const classList  = `d-inline-block position-absolute text-start`;
        const style = `width: 70%; height: 18px; bottom: 0.5rem; left: 0.5rem;`;
        return `<div style="${style}" class="${classList}" title="${title}">${value}</div>`;
    }

    function getTypeView(value, item) {
        const isOnline = item.isOnline === "1";
        const isOnlineWifi = item.isWL !== "0" && isOnline;
        const rssi = isOnlineWifi ? getWifiRssiView(item.rssi) : "";
        const borderColor = isOnline ? "border-info" : "border-secondary";
        const classList = `rounded border ${borderColor} position-relative p-2 type${value}`;
        const title = isOnline ? "Is online": "Is offline";
        const style = `width: 100%; height: 100px; background-repeat: no-repeat;`;
        const switcCheckbox = getCheckbox(isOnline ? 1 : 0);
        const switcWrapper =  getCheckboxWrapper(switcCheckbox, isOnline);
        return `${getTitleView(item.name, item)}
        <div style="${style}" class="${classList}" title="${title}">
            ${getConectionTypeView(item.isWL, item)}
            ${rssi}
            ${switcWrapper}
            ${getInternetState(item.internetState)}
        </div>`
        
    }

    function getTitleView(value = "", item) {
        const isOnline = item.isOnline === "1";
        const textColor = isOnline ? "text-info" : "text-secondary";
        const classList = `text-center fs-6 font-monospace ${textColor}`;
        const name = value.substring(0, 12) + (value.length > 12 ? "..." : "");
        return `<p class="${classList}" title="name: ${value}" >${name}</p>`
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
    };

    function getDiagram(value) {

        const points = !value ? [] : value.map( speed => speed.out);
        const points2 = !value ? [] : value.map( speed => speed.inc);

        const canvas = document.createElement("canvas");

        const diagramConfig = {
            canvas: canvas,
            width: 150, 
            height: 50,
            maxPoints: 30,
            step: 15,
            corector: 10,
            min: 0,
            max: config.entity.traffic.max
        };
        const diagram = new Diagram (diagramConfig);
        diagram.drawDiagram(points, "220, 134, 142")     
        diagram.drawDiagram(points2, "25, 135, 84")
        
        return canvas;
    }

    function cnvrtMbps(value) {
        if (value === undefined) return "Mbps";
        let resultNumber = Math.round(value / 1024 / 1024 * 8 * 100) / 100;
        resultNumber = resultNumber < 0 ? 0 : resultNumber;
        let result = resultNumber.toLocaleString() + " Mbps";
        result = getSpase(15 - result.length) + result;
        return  result;
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
        const inc =  ["inc", "speedInc"].includes(vector);
        const out =  ["out", "speedOut"].includes(vector);
        const color = inc ? "text-success" : "text-danger" ;
        const icon = out ? "&#9650": "&#9660";
        return `<span class="${color}">${icon}</span>`
        /*
        9660 '▼'
        9650 '▲'
        8593 '↑'
        8595 '↓'
        '🛇' 128711
            String.fromCodePoint(parseInt('1F6C7', 16))
            String.fromCodePoint(128711)
        */
    }

    function getCheckbox(value) {
        if (value >=1) return `
        <span class="form-switch">
            <input class="form-check-input" type="checkbox" checked onclick="return false">
        </span>`
        return `
        <span class="form-switch">
            <input class="form-check-input" type="checkbox" disabled>
        </span>`
    }
    
    function getStateView(value) {
        if (!["block","allow"].includes(value)) return value;
        const color = value == "block" ? "text-danger" : ""
        const icon = value == "block" ? "&#128711" : "&#10003"
        return `<p class="fw-bold text-end ${color}" title="${value}">${icon}</p>`
    }

    function getInternetState(value) {
        if (["1", 1].includes(value)) return "";
        if (!["1", 1, 0].includes(value)) return "InternetState: " + value;
        const color = value == 0 ? "text-danger" : "text-info";
        const icon = value == 0 ? "&#128711" : "&#10003";
        const title = value == 0 ? "internetState = Block Internet access" : "internetState = Allow Internet access";
        // const id = Math.random();
        const classList = `d-inline-block position-absolute fw-bold text-start ${color}`;
        const style = `width: 18%; height: 26px; top: 1.6rem; left: 1.6rem; font-size: 26px;`;
        return `<h4 style="${style}" class="${classList}" title="${title}">${icon}</h4>`
        // if (value >=1) return `
        //     <input type="radio" class="btn-check" name="options${id}" id="optio${id}" autocomplete="off" onclick="return false">
        //     <label  style="${style}" class="btn btn-dark ${color}" title="${title}" for="option${id}">${icon}</label>`
        // return `
        //     <input type="radio" class="btn-check" name="options${id}" id="option${id}" autocomplete="off" onclick="return false">
        //     <label  style="${style}" class="btn btn-dark ${value === 0 ? color : ''}" title="${value === 0 ? title : ''}" for="option${id}">${value === 0 ? icon : value}</label>`
    }

})()