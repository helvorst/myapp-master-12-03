/**
 * Created by Hel on 13.10.2015.
 */
tstApp.controller('MainController', function ($scope, $rootScope, ServiceExport, ngToast) {

  //expose service
  $scope.$ServiceExport= ServiceExport;

//***********************SORTABLE***************************
//**********************************************************
  $scope.sortableOptions = {
    //update: function(e, ui) { ... },
    axis: 'y, x',
    disabled: true
    //start: function(e, ui) {
    //  console.log('sort: ' + ui.item.sortable.model.sorting);
    //  //if (ui.item.sortable.model.sorting != true) {
    //    ui.item.sortable.cancel();
    //  //}
    //}
  };

  //Включение/отключение возможности таскания боксов
  $scope.allowSorting = function (id){
    $scope.sortableOptions.disabled = !$scope.sortableOptions.disabled;
    if(!$scope.sortableOptions.disabled)
      ngToast.danger('Сортировка включена: чтобы переместить чарт, перетащите его контейнер в нужное место');
    else
      ngToast.info('Сортировка включена: Вы больше не можете перемещать чарты');

  }

//***********************THEME***************************
//**********************************************************
  $scope.changeTheme = function (theme) {
    $rootScope.theme = theme;
    //Запомнить
    localStorage.setItem('theme', JSON.stringify(theme));
  }

})
