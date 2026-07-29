(function () {
    const config = {
        id: "networkModal",
        title: "Network total / speed",
        inrevalSec:2,
        intervalCode: null,
        container: null,
        request:() => [`${window.location.origin}/update.cgi?_=${new Date() * 1}`, {
            "headers": {
                "content-type": "text/plain;charset=UTF-8"
            },
            "body": "output=netdev",
            "method": "POST"
        }],
        network:{
            type: {
                //INTERNET0: "INTERNET0",
                INTERNET: "INTERNET",
                //BRIDGE: "bridg",
                WIRED: "LAN",
                WIRELESS0: "2.4GHz",
                WIRELESS1: "5GHz",
            }
        }
    };
    
    initModal ();

    function getData() {
        fetch(...config.request())
        .then(response => response.text())
        .then(response => response
            .replace("netdev = ", "")
            .replace("INTERNET", "INTERNET0")
            .replaceAll("'", '"')
            .replaceAll("rx:", '"rx":"')
            .replaceAll(",tx:", '","tx":"')
            .replaceAll("}", '"}')
            .replace('\n"}', '\n}')
        ).then(JSON.parse)
        .then(obj => {
            for(item in obj) obj[item].rx = obj[item].rx * 1;
            for(item in obj) obj[item].tx = obj[item].tx * 1;
            return obj;
        }).then(obj => {
            obj.stamp = new Date() * 1;
            prevStat = curStat;
            curStat = transformResponse(obj, prevStat);
            if (prevStat == null) return null;
            return curStat;
        }).then(result => {
            if(!result) return;
            const container = config.container;
            while (container.firstChild)
                container.removeChild(container.lastChild);
            container.appendChild(getHTML(result));
        })
    }

    function getHTML(obj) {
        const table = document.createElement("table");
        table.setAttribute("class", "table table-dastamprk table-sm table-dark")
        const tbody = document.createElement("tbody")
        table.appendChild(tbody);
        const tr = document.createElement("tr");
        tbody.appendChild(tr);
        tr.innerHTML = `<td colspan="4" class="text-end">Max per minute: ${cnvrtMbps(obj.max)}</td>`
        for (item in config.network.type) {
            ["inc", "out"].forEach( (vector, index) => {
                const tr = document.createElement("tr");
                tbody.appendChild(tr);
                if (index == 0){
                    const tdTitle  = document.createElement("td");
                    tdTitle.setAttribute("class", "align-middle");
                    tdTitle.setAttribute("rowspan", "2");
                    tdTitle.innerHTML = config.network.type[item];
                    tr.appendChild(tdTitle);
                }
                ["total", "speed"].forEach( type => {
                    const td = document.createElement("td");
                    tr.appendChild(td);
                    displayValue(td, type, vector, obj[item][type][vector]);
                });
                if (index == 0){
                    const tdTitle  = document.createElement("td");
                    tdTitle.setAttribute("class", "align-middle");
                    tdTitle.setAttribute("rowspan", "2");
                    tdTitle.appendChild(getDiagram(obj[item].speed.log, obj.max));
                    tr.appendChild(tdTitle);
                }
            });
        }
        return table;
    }

    function displayValue(td, type, vector, value) {
        let typedValue = '';
        switch (type) {
            case "speed":
                typedValue = cnvrtMbps(value)
                break;
            case "total":
                typedValue = cnvrtMb(value)
                break;
        }
        td.innerHTML = typedValue + getVector(vector);
    }

    function getDiagram(value, max) {

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
            max: max
        };
        const diagram = new Diagram (diagramConfig);
        diagram.drawDiagram(points, "220, 134, 142")     
        diagram.drawDiagram(points2, "25, 135, 84")
        
        return canvas;
    }

    function transformResponse(cur, prev) {
        const validKey = Object.keys(config.network.type);
        const result = {};
        result.stamp = cur.stamp;
        let allLog = [];
        validKey.forEach( item => {
            if (!Object.hasOwnProperty.call(cur, item)) return;
            const inc = getDirection(item, "inc");
            const out = getDirection(item, "out");
            const total = {};
            total[inc] = cur[item].rx;
            total[out] = cur[item].tx;
            const speed = {};
            if (prevStat !== null) {
                speed.inc = (total.inc - prev[item].total.inc) / ((cur.stamp - prev.stamp) / 1000);
                speed.out = (total.out - prev[item].total.out) / ((cur.stamp - prev.stamp) / 1000);
                let log = prev[item].speed.log || [];
                log.push({ inc: speed.inc, out: speed.out, stamp: cur.stamp});
                speed.log = log.length <= 30 ? log : log.slice(log.length - 30, log.length);
                allLog = allLog.concat(speed.log.reduce((arr, speed) => [...arr, ...[speed.out, speed.inc]], []));
            }
            result[item] = {speed, total}
        });

        if (allLog.length > 0) {
            result.max = Math.max(...allLog);
            result.min = Math.min(...allLog);
        }

        return result;
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
        config.container = container;
    }

    function addHead(dialog, title) {
        const container = document.createElement("div");
        container.setAttribute("style", "margin-bottom: 10px;");
        dialog.appendChild(container);
        const row = document.createElement("div");
        row.className = "row";
        container.appendChild(row);
        const col1 = document.createElement("div");
        col1.innerHTML = title
        col1.className = "col-10";
        row.appendChild(col1);
        const col2 = document.createElement("div");
        col2.className = "col text-end";
        row.appendChild(col2);
        const closeButton = document.createElement("button");
        closeButton.setAttribute("id", config.id + "Button");
        closeButton.className = "btn-close";
        closeButton.setAttribute("type", "button");
        closeButton.setAttribute("style", "filter: var(--bs-btn-close-white-filter);");
        closeButton.addEventListener("click", () => {
            dialog.close();
            clearInterval(config.intervalCode);
            dialog.remove();
        });
        col2.appendChild(closeButton);
    }

    function initModal () {
        const btn = document.getElementById(config.id + "Button");
        if (btn) btn.click();
        curStat = null;
        prevStat = null;
        newModal();
        getData();
        config.intervalCode = setInterval(getData, config.inrevalSec * 1000);
    }
    
    function cnvrtMbps(value, noSpase) {
        const resultNumber = Math.round(value / 1024 / 1024 * 8 * 100) / 100;
        let result = resultNumber.toLocaleString() + " Mbps";
        result = (noSpase ? "" : getSpase(15 - result.length)) + result;
        return  result;
    }

    function cnvrtMb(value, noSpase) {
        const resultNumber = Math.round(value / 1024 / 1024);
        let result = resultNumber.toLocaleString() + " MB";
        result = (noSpase ? "" : getSpase(15 - result.length)) + result;
        return result;
    }

    function getSpase(count) {
        if (count < 1) return "";
        return "&nbsp;".repeat(count);
    }

    function getVector(vector) {
        const color = vector == "inc" ? "text-success" : "text-danger" ;
        const icon = vector == "inc" ?  "&#9660" : "&#9650";
        return `<span class="${color}"> ${icon}</span>`
        /*
        9660 '▼'
        9650 '▲'
        8593 '↑'
        8595 '↓'
        */
    }

    function getDirection(item, vector) {
        const isIncInternet = item.startsWith("INTERNET") &&  ( vector  == "out" );
        const isOutNotInternet = !item.startsWith("INTERNET") &&  ( vector  == "inc" );
        return isIncInternet || isOutNotInternet ? "out" : "inc";
    }

})()