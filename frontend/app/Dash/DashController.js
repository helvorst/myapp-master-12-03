/**
 * Created by Hel on 28.09.2015.
 */
tstApp.controller('DashController', function ($scope, $rootScope, appConstants, $stateParams, ServiceResize) {

  //Раскопать имя текущего дэшборда из параметров стейта
  $rootScope.dashId = $stateParams.dashID;
  $scope.dashName = $stateParams.dashName;

  ///////////////////////////////////////////////////////////////////////////////////////
  //RESIZING//////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////
  $rootScope.resizeCalculations = function (args) {

    //console.log(args);
    var thisBoxID = args.id.substring(3);
    var whoIsActive = $rootScope.mycharts[thisBoxID].whoIsActive;
    //Refresh
    ServiceResize.renderChartDependingOnItsType(whoIsActive, '#fuckenSingleChartID' + thisBoxID);
    if ($rootScope.mycharts[thisBoxID].settings.tableConfig.table == 'pivot')
      ServiceResize.renderChartDependingOnItsType('pivot', '#fuckenPivotTableID' + thisBoxID);
    if ($rootScope.mycharts[thisBoxID].settings.tableConfig.table == 'simple')
      ServiceResize.renderChartDependingOnItsType('simple', '#fuckenTableID' + thisBoxID);


  }

  $scope.$on("angular-resizable.resizing", function (event, args) {
    $rootScope.resizeCalculations(args);
  });


  $scope.$on("angular-resizable.resizeEnd", function (event, args) {
    $rootScope.resizeCalculations(args);
  });


  //Сигнализировать, что отрисовка бокса закончена и переменные ангуляра инициализированы - можно рисовать чарт
  $scope.renderFinished = function (chartID) {
    $rootScope.mycharts[chartID].rendered = true;
    console.log(chartID + " rendered box")

  }

})

