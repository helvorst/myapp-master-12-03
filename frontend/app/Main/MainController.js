/**
 * Created by Hel on 13.10.2015.
 */
tstApp.controller('MainController', function ($scope, $rootScope, ServiceExport, ServiceToast) {

  //expose service
  $scope.$ServiceExport = ServiceExport;

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
  $scope.allowSorting = function (id) {
    $scope.sortableOptions.disabled = !$scope.sortableOptions.disabled;
    if (!$scope.sortableOptions.disabled)
      ServiceToast.cookToast('Сортировка включена: чтобы переместить чарт, перетащите его контейнер в нужное место', 'warning')
    else
      ServiceToast.cookToast('Сортировка включена: Вы больше не можете перемещать чарты', 'warning')

  }

//***********************THEME***************************
//**********************************************************
  $scope.changeTheme = function (theme) {
    $rootScope.theme = theme;
    //Запомнить
    localStorage.setItem('theme', JSON.stringify(theme));
  }

  $scope.setMute = function () {

  $rootScope.mute = !$rootScope.mute;
    //Запомнить
    localStorage.setItem('mute', JSON.stringify($rootScope.mute));
    if ($rootScope.mute)
      ServiceToast.cookToast('Звук отключен', 'warning')
    else
      ServiceToast.cookToast('Звук включен', 'warning')

  }
})
