
const buttonDiv = document.getElementById('btnGroup');
const buttonScripts = [
  { name: 'clients', file: 'src/modules/clients/controller/clientsController.js' },
  { name: 'networks', file: 'src/modules/networks/controller/networksController.js' }
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
      .then(() => ensureGlobalScript(tabId, 'src/modules/clients/data/clientDataStore.js', 'AsusRouterClientData'))
      .then(() => ensureGlobalScript(tabId, 'src/modules/clients/templates/clientsTemplates.js', 'AsusRouterClientsTemplates'))
      .then(() => ensureGlobalScript(tabId, 'src/modules/clients/styles/clientsStyles.js', 'AsusRouterClientsStyles'))
      .then(() => ensureGlobalScript(tabId, 'src/modules/clients/ui/clientsUi.js', 'AsusRouterClientsUi'))
      .then(() => ensureGlobalScript(tabId, 'src/modules/networks/data/networkDataStore.js', 'AsusRouterNetworksData'))
      .then(() => ensureGlobalScript(tabId, 'src/modules/networks/styles/networksStyles.js', 'AsusRouterNetworksStyles'))
      .then(() => ensureGlobalScript(tabId, 'src/modules/networks/ui/networksUi.js', 'AsusRouterNetworksUi'))
      .then(() => executeJSScript(tabId, script))
      .then(() => window.close());
  });
}

function insertCSS(tabId) {
  return chrome.scripting.insertCSS({
    target: { tabId },
    files: ['src/bootstrap.css', 'src/modules/clients/styles/clients.css', 'src/modules/networks/styles/networks.css'],
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

