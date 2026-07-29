
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
      .then(() => executeJSScript(tabId, ['src/Diagram.js', 'src/extensionHelpers.js', script]))
      .then(() => window.close());
  });
}

function insertCSS(tabId) {
  return chrome.scripting.insertCSS({
    target: { tabId },
    files: ['src/bootstrap.css'],
  });
}

function executeJSScript(tabId, script) {
  const files = Array.isArray(script) ? script : [script];
  return chrome.scripting.executeScript({
    target: { tabId },
    files
  });
}

