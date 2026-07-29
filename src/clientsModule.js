(function (root) {
  function createClientsModule() {
    return {
      name: 'clients',
      dependencies: ['src/Diagram.js', 'src/extensionHelpers.js', 'src/clientData.js', 'src/clientsTemplates.js', 'src/clientsStyles.js', 'src/clientsUi.js'],
    };
  }

  root.AsusRouterClientsModule = {
    createClientsModule,
  };
}(typeof globalThis !== 'undefined' ? globalThis : this));
