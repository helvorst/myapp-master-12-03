/**
 * Created by hel on 03.12.2015.
 */
tstApp.controller("ZoomProcessorEditController", function ($scope, $uibModalInstance, DataToPassInModal, ServiceDraw,
                                                           ServiceExport, ServiceResize, ServiceTable, ServiceAnalysis,
                                                           $rootScope, $timeout, $window, ngToast) {


//---------------------------------------------------
//------------OPEN and CLOSE my MODAL ---------------
//---------------------------------------------------
  $scope.ok = function () {

    //collect all settings
    $scope.newProcCfg.name = $scope.newName;
    $scope.newProcCfg.settings = {};
    $scope.newProcCfg.settings.defaultKind =  $scope.whoIsActive;
    $scope.newProcCfg.chartConfig = $scope.chartConfig;
    $scope.newProcCfg.tableConfig = $scope.tableConfig;
    $scope.newProcCfg.dataConfig = [];
    for(var i=0; i<$scope.pivotCols.length; i++) {
      $scope.pivotCols[i].pivot.areaIndex = i;
      $scope.newProcCfg.dataConfig.push($scope.pivotCols[i]);
    }
    for(var i=0; i<$scope.pivotRows.length; i++) {
      $scope.pivotRows[i].pivot.areaIndex = i;
      $scope.newProcCfg.dataConfig.push($scope.pivotRows[i]);
    }
    for(var i=0; i<$scope.pivotData.length; i++) {
      $scope.pivotData[i].pivot.areaIndex = i;
      $scope.newProcCfg.dataConfig.push($scope.pivotData[i]);
    }
    for(var i=0; i<$scope.simpleFields.length; i++){
      $scope.simpleFields[i].areaIndex = i;
      $scope.newProcCfg.dataConfig.push($scope.simpleFields[i]);
    }

    //console.log( $scope.newProcCfg);

    //download it
    var uri = 'data:application/octet-stream;charset=utf-16le;base64,';
    var s = JSON.stringify($scope.newProcCfg);
    var excel = uri +  $window.btoa(unescape(encodeURIComponent(s)));
    var a = document.createElement("a");
    a.download = 'editedproc' + ".txt";
    a.href = excel;
    a.click();
    a.remove();


    $uibModalInstance.close($scope.subject);


  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

//---------------------------------------------------
//------------SOMETHING TO EDIT? ---------------
//---------------------------------------------------
  //which table will be default
  $scope.tableOptions = [{fullName: 'Пивот', name: 'pivot'}, {fullName: 'Обычная', name: 'simple'}]
  $scope.pivotCols = [];
  $scope.pivotRows = [];
  $scope.pivotData = [];
  $scope.simpleFields = [];

  //If we are in edit mode, let's get existing config
  if (DataToPassInModal) {

    $scope.newName = DataToPassInModal.processor.name;
    $scope.whoIsActive = DataToPassInModal.processor.settings.defaultKind;
    $scope.newProcCfg = DataToPassInModal.processor;
    $scope.newProcCfg.processor = DataToPassInModal.processor.processor;
    //data config
    $scope.dataConfig = DataToPassInModal.processor.settings.dataConfig;
    //chart config
    $scope.chartConfig = DataToPassInModal.processor.settings.chartConfig;
    //table config
    $scope.tableConfig = DataToPassInModal.processor.settings.tableConfig;
    for(var i=0; i<$scope.tableOptions.length; i++){
      if($scope.tableConfig.table == $scope.tableOptions[i].name )
        $scope.defaultTable = $scope.tableOptions[i];
    }

    for(var i=0; i<$scope.dataConfig.length; i++){
      //for pivot
      if($scope.dataConfig[i].hasOwnProperty('pivot'))
      {
        //row
        if($scope.dataConfig[i].pivot.role=='row')
          $scope.pivotRows.push($scope.dataConfig[i]);
        //col
        if($scope.dataConfig[i].pivot.role=='column')
          $scope.pivotCols.push($scope.dataConfig[i]);
        //data
        if($scope.dataConfig[i].pivot.role=='data')
          $scope.pivotData.push($scope.dataConfig[i]);
      }
      else //simple table fields
        $scope.simpleFields.push($scope.dataConfig[i]);
    }

  }
  else {  //otherwise it will be clean
    $scope.newProcCfg = [];
    $scope.newProcCfg.settings = {};
    $scope.newProcCfg.settings.defaultHeight = 199;
    $scope.newProcCfg.settings.defaultWidth = 299;
    //let default chart be a...
    $scope.whoIsActive = 'bar';
    //data config
    $scope.dataConfig = [];
    //chart config
    $scope.chartConfig = {};
    //table config
    $scope.tableConfig = {
      table: "pivot",
      pivotConfig: {
        summaryType: 'sum',
        expandRows: true,
        expandColumns: true,
        showColumnGrandTotals: true,
        showRowGrandTotals: true,
        showColumnTotals: true,
        showRowTotals: true
      }
    };
    //let default table be  a...
    $scope.defaultTable = $scope.tableOptions[0];

  }

  //sortable opts to move elements
  $scope.sortableOptionsForFields = {
    axis: 'y', //x',
    disabled: false,
    update: function (e, ui) {
    }
  };


  //who was selected as default chart
  $scope.selectDefaultChart = function (selectedChart) {
    $scope.whoIsActive = selectedChart;

    var fullNameOfAChart = '';
    switch (selectedChart) {
      case "pie":
        fullNameOfAChart = 'Пирог';
        break
      case "doughnut":
        fullNameOfAChart = 'Пончик';
        break
      case "map":
        fullNameOfAChart = 'Карта';
        break
      case "gauge":
        fullNameOfAChart = 'Гаудж';
        break
      case "scale":
        fullNameOfAChart = 'Шкала';
        break
      case "text":
        fullNameOfAChart = 'Карточка';
        break
      case "bar":
        fullNameOfAChart = 'Бар';
        break
      case "stackedBar":
        fullNameOfAChart = 'Стэкированный бар';
        break
      case "fullstackedBar":
        fullNameOfAChart = 'Нормированный бар';
        break
      case "line":
        fullNameOfAChart = 'Линия';
        break
      case "stackedLine":
        fullNameOfAChart = 'Стэкированная линия';
        break
      case "fullstackedLine":
        fullNameOfAChart = 'Нормированная линия';
        break
      case "area":
        fullNameOfAChart = 'Область';
        break
      case "stackedArea":
        fullNameOfAChart = 'Стэкированная область';
        break
      case "fullstackedArea":
        fullNameOfAChart = 'Нормированная область';
        break
      case "table":
        fullNameOfAChart = 'Таблица. Внимание! Вместо чарта в окне процессора будет отображаться таблица!';
        break
      default:
        fullNameOfAChart = 'Smth will be drawn... but what? ';
    }
    if ($scope.toDismissOld)
      ngToast.dismiss($scope.toDismissOld);
    $scope.toDismissOld = ngToast.success('Вы выбрали дефолтный чарт: ' + fullNameOfAChart);
  };

  //who was selected as default table
  $scope.selectDefaultTable = function () {
    if ($scope.toDismissOld)
      ngToast.dismiss($scope.toDismissOld);
    $scope.toDismissOld = ngToast.success('Вы выбрали дефолтную таблицу: ' + $scope.defaultTable.fullName);

    //$scope.tableConfig.table = $scope.defaultTable.name;
  };


  //add new field to dataConfig
  $scope.AddNewPivotRow = function () {
    var newRow = {
      fieldName: 'Имя ряда',
      fieldAlias: 'Имя ряда в БД',
      type: 'string',
      pivot: {
        role: 'row',
        areaIndex: $scope.pivotRows.length
      }
    };
    $scope.pivotRows.push(newRow);
  };
  $scope.AddNewPivotColumn = function () {
    var newCol = {
      fieldName: 'Имя колонки',
      fieldAlias: 'Имя колонки в БД',
      type: 'date',
      pivot: {
        role: 'column',
        group: ['year', 'quarter', 'month'],
        areaIndex: $scope.pivotRows.length
      }
    };
    $scope.pivotCols.push(newCol);
  };
  $scope.AddNewPivotData = function () {
    var newData = {
      fieldName: 'Имя поля',
      fieldAlias: 'Имя поля в БД',
      type: 'number',
      pivot: {
        role: 'data',
        format: 'fixedPoint',
        precision: 2
      }
    };
    $scope.pivotData.push(newData);
  };
  //add a field to an ordinary table
  $scope.AddNewSimpleTableField = function () {
    var newFLD = {
      fieldName: 'Имя поля',
      fieldAlias: 'Имя поля в БД',
      isX: 'true'
    };
    $scope.simpleFields.push(newFLD);
  };


  $scope.totalFunction = function (newSummaryType) {
    $scope.tableConfig.pivotConfig.summaryType = newSummaryType;
  };

  //default gauge
  $scope.gaugeConfig = {
    startValue: 10,
    endValue: 400,
    majorTick: 10,
    minorTick: 2.5,

    ranges: [
      {startValue: 10, endValue: 90},
      {startValue: 90, endValue: 130},
      {startValue: 130, endValue: 200},
      {startValue: 200, endValue: 400},
    ],
    valueIndicatorType: 'triangleNeedle',
    valueIndicatorColor: 'black',
    subtitle: 'в сантидлинах',
    orientation: 'horizontal'
  };

  //default text
  $scope.textConfig = {
    caption: 'my text PRIOR',
    importance: 'danger'
  };
})
