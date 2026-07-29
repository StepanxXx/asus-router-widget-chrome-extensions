(function (root) {
  const moduleFiles = [
    'src/modules/clients/data/clientDataStore.js',
    'src/modules/clients/templates/clientsTemplates.js',
    'src/modules/clients/styles/clientsStyles.js',
    'src/modules/clients/ui/clientsUi.js',
    'src/modules/clients/controller/clientsController.js',
  ];

  root.AsusRouterClientsModule = root.AsusRouterClientsModule || {};
  root.AsusRouterClientsModule.files = moduleFiles;
}(typeof globalThis !== 'undefined' ? globalThis : this));
