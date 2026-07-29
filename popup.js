
const buttonDiv = document.getElementById('btnGroup');
const buttonScripts = [
  { name: 'clients', file: 'src/clients.js' },
  { name: 'networks', file: 'src/networks.js' }
];

createScriptButtons(buttonScripts);

function createScriptButtons(buttonScripts) {
  buttonScripts.forEach(({ name, file }) => {
    const button = document.createElement('button');
    button.innerText = name;
    button.setAttribute('value', file);
    button.addEventListener('click', onButtonClick);
    buttonDiv.appendChild(button);
  });
}

function onButtonClick(event) {
  const script = event.currentTarget.value;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;

    insertCSS(tabId)
      .then(() => ensureGlobalScript(tabId, 'src/Diagram.js', 'Diagram'))
      .then(() => ensureGlobalScript(tabId, 'src/extensionHelpers.js', 'AsusRouterHelpers'))
      .then(() => ensureGlobalScript(tabId, 'src/clientData.js', 'AsusRouterClientData'))
      .then(() => ensureGlobalScript(tabId, 'src/clientsTemplates.js', 'AsusRouterClientsTemplates'))
      .then(() => ensureGlobalScript(tabId, 'src/clientsStyles.js', 'AsusRouterClientsStyles'))
      .then(() => ensureGlobalScript(tabId, 'src/clientsUi.js', 'AsusRouterClientsUi'))
      .then(() => ensureGlobalScript(tabId, 'src/clientsModule.js', 'AsusRouterClientsModule'))
      .then(() => executeJSScript(tabId, script))
      .then(() => window.close());
  });
}

function insertCSS(tabId) {
  return chrome.scripting.insertCSS({
    target: { tabId },
    files: ['src/bootstrap.css'],
  });
}

function ensureGlobalScript(tabId, file, globalName) {
  return chrome.scripting.executeScript({
    target: { tabId },
    func: (name) => typeof globalThis[name] !== 'undefined',
    args: [globalName],
  }).then((results) => {
    const alreadyLoaded = results?.[0]?.result;
    if (alreadyLoaded) return null;
    return chrome.scripting.executeScript({
      target: { tabId },
      files: [file],
    });
  });
}

function executeJSScript(tabId, script) {
  return chrome.scripting.executeScript({
    target: { tabId },
    files: [script],
  });
}

