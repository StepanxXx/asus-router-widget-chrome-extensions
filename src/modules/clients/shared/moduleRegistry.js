(function (root) {
  root.AsusRouterClientsModule = root.AsusRouterClientsModule || {};
  root.AsusRouterClientsModule.registry = {
    data: 'src/modules/clients/data/clientDataStore.js',
    templates: 'src/modules/clients/templates/clientsTemplates.js',
    styles: 'src/modules/clients/styles/clientsStyles.js',
    ui: 'src/modules/clients/ui/clientsUi.js',
    controller: 'src/modules/clients/controller/clientsController.js',
  };
}(typeof globalThis !== 'undefined' ? globalThis : this));
