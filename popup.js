
const buttonDiv = document.getElementById('btnGroup');
const buttonScripts = {
  clients: "src/clients.js",
  networks: "src/networks.js"
};

createScriptButtons(buttonScripts);

function createScriptButtons(buttonScripts) {
  for(item in buttonScripts) {
    const button = document.createElement('button');
    button.innerText = item;
    button.setAttribute('value', buttonScripts[item]);
    button.addEventListener('click', onButtonClick);
    buttonDiv.appendChild(button);
  };
};

function onButtonClick(event) {
  const script = event.target.value;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    insertCSS(tabs[0].id)
    .then(() => executeJSScript(tabs[0].id, "src/Diagram.js"))
    .then(() => executeJSScript(tabs[0].id, script))
    .then(() => window.close())
  });
}

function insertCSS(tab) {
  return chrome.scripting.insertCSS({
    target: { tabId:  tab},
    files: ["src/bootstrap.css"],
  });
}

function executeJSScript(tab, script) {
  return chrome.scripting.executeScript({
    target: { tabId: tab },
    files: [script]
  });
}

