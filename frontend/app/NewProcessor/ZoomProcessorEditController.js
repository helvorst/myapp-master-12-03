/**
 * Created by hel on 03.12.2015.
 */
tstApp.controller("ZoomProcessorEditController", function ($scope, $uibModalInstance, DataToPassInModal, ServiceDraw,
                                                           ServiceResize, ServiceTable,
                                                           $rootScope, $timeout, $window, ServiceToast, REST, $location, $anchorScroll) {

//---------------------------------------------------
//------------SOMETHING TO EDIT? ---------------
//---------------------------------------------------
  //which table will be default
  $scope.tableOptions = [{fullName: 'Пивот', name: 'pivot'}, {fullName: 'Обычная', name: 'simple'}, {
    fullName: 'Нет',
    name: null
  }]
  $scope.pivotCols = [];
  $scope.pivotRows = [];
  $scope.pivotData = [];
  $scope.simpleFields = [];

  //DEFAULTS FOR CHARTS
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
  //default map
  $scope.mapConfig = {
    //====Что за карта
    mapURL: 'app/ko/ko',
    //====Размеры
    precision: 2, //сколько точек после запятой
    zoom: 65,
    center: [49.64, 58.59],
    //====Маркеры
    markers: {
      enabled: true,
      markerValuesNames: ['Эстерриториальное ТО1', 'Еще херня-2', 'Еще херня-3'],
      mapMarkerType: "bubble",
      sizeGroups: [0, 7000, 10000, 100000, 500000]
    },
    //===Лейблы
    label: {
      enabled: true
    },
    //====Группы значений
    grouping: {
      enabled: true,
      groups: [0, 20, 24, 26, 30, 300],
      palette: 'Ocean', //['blue', 'yellow']
    }

  }

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
    //rewrite chart settings
    if ($scope.whoIsActive == 'text')
      $scope.textConfig = $scope.chartConfig;
    if ($scope.whoIsActive == 'gauge')
      $scope.gaugeConfig = $scope.chartConfig;
    if ($scope.whoIsActive == 'map')
      $scope.mapConfig = $scope.chartConfig;

    //table config
    $scope.tableConfig = DataToPassInModal.processor.settings.tableConfig;
    delete $scope.tableConfig.texts;
    if ($scope.tableConfig.hasOwnProperty('table'))
      $scope.defaultTable = $scope.tableConfig.table;
    else
      $scope.defaultTable = null;


    for (var i = 0; i < $scope.dataConfig.length; i++) {
      //for pivot
      if ($scope.dataConfig[i].hasOwnProperty('pivot')) {
        //row
        if ($scope.dataConfig[i].pivot.role == 'row')
          $scope.pivotRows.push($scope.dataConfig[i]);
        //col
        if ($scope.dataConfig[i].pivot.role == 'column')
          $scope.pivotCols.push($scope.dataConfig[i]);
        //data
        if ($scope.dataConfig[i].pivot.role == 'data')
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


//---------------------------------------------------
//------------OPEN and CLOSE my MODAL ---------------
//---------------------------------------------------
  $scope.ok = function () {
    $uibModalInstance.close($scope.subject);
  };
  $scope.cancel = function () {

    ServiceToast.dismissAll();
    $uibModalInstance.dismiss('cancel');
  };

  $scope.save = function () {

    $scope.collectChanges();

    //download it
    var uri = 'data:application/octet-stream;charset=utf-16le;base64,';
    var s = JSON.stringify($scope.newProcCfg);
    var excel = uri + $window.btoa(unescape(encodeURIComponent(s)));
    var a = document.createElement("a");
    a.download = 'editedproc' + ".txt";
    a.href = excel;
    a.click();
    a.remove();
  };
//---------------------------------------------------
//------------COLLECT CHANGES -----------------------
//---------------------------------------------------
  $scope.collectChanges = function () {
    //collect all settings
    $scope.newProcCfg.name = $scope.newName;
    $scope.newProcCfg.settings = {};
    $scope.newProcCfg.settings.defaultKind = $scope.whoIsActive;
    //CHART
    $scope.newProcCfg.settings.chartConfig = $scope.chartConfig;

    //TABLE
    $scope.newProcCfg.settings.tableConfig = {};
    $scope.newProcCfg.settings.tableConfig.table = $scope.defaultTable;
    if($scope.defaultTable=='pivot')
      $scope.newProcCfg.settings.tableConfig.pivotConfig = $scope.tableConfig.pivotConfig;

    //DATA
    $scope.newProcCfg.settings.dataConfig = [];

    //attach all pivot's belongings
    if($scope.defaultTable=='pivot') {
      for (var i = 0; i < $scope.pivotCols.length; i++) {
        $scope.pivotCols[i].pivot.areaIndex = i;
        $scope.newProcCfg.settings.dataConfig.push($scope.pivotCols[i]);
      }
      for (var i = 0; i < $scope.pivotRows.length; i++) {
        $scope.pivotRows[i].pivot.areaIndex = i;
        $scope.newProcCfg.settings.dataConfig.push($scope.pivotRows[i]);
      }
      for (var i = 0; i < $scope.pivotData.length; i++) {
        $scope.pivotData[i].pivot.areaIndex = i;
        $scope.newProcCfg.settings.dataConfig.push($scope.pivotData[i]);
      }
    }
    //attach all pivot's belongings
    if($scope.defaultTable=='simple') {
      for (var i = 0; i < $scope.simpleFields.length; i++) {
        $scope.simpleFields[i].areaIndex = i;
        $scope.newProcCfg.settings.dataConfig.push($scope.simpleFields[i]);
      }
    }


    console.log($scope.newProcCfg);
  };


//---------------------------------------------------
//------------APPLY CHANGES -------------------------
//---------------------------------------------------
  $scope.apply = function () {

    //it will fill  $scope.newProcCfg with updated values
    $scope.collectChanges();

    var idToastWait = ServiceToast.cookToast('Идет получение данных', 'wait');

    //then  LETS REST OUR DATA
    REST.getChartData(105, $scope.newProcCfg.processor)
      .then(function (chartDatus) {


        //получить  дата
        var chartData = chartDatus.plain();
        console.log('got my data for proc XXXXXXXXXXXXX ' + $scope.newProcCfg.processor);
        $scope.myData = chartData;
        console.log($scope.myData);

        ServiceToast.dismissById(idToastWait);
        ServiceToast.cookToast('Данные получены. Строк: ' + $scope.myData.length, 'success');

        if ($scope.whoIsActive != 'table')
          ServiceDraw.whoToRedraw($scope.whoIsActive, "#chart", $scope.newProcCfg, $scope.myData);

        if ($scope.newProcCfg.settings.tableConfig.table == 'simple') {
          ServiceTable.simpleTable("#simpleTable", $scope.newProcCfg.settings.dataConfig, $scope.myData);
        }

        if ($scope.tableConfig.table == 'pivot') {
          try {
            $("#pivotTable").dxPivotGrid('instance');
            if ($scope.newProcCfg.settings.defaultKind != 'table')
              $("#chart").dxChart("option", "dataSource", createChartDataSource($("#pivotTable").dxPivotGrid("instance").getDataSource()));
          } catch (e) {
            ServiceTable.pivotTable("#pivotTable", $scope.newProcCfg, $scope.myData, $scope.whoIsActive, '#chart');
          }
        }

      }, function (error) {
        console.log("Не удалось получить данные для процессора дэшборда с ИД " + $scope.newProcCfg.processor);
        console.log(error);
        ServiceToast.cookToast('Ошибка получения данных', 'error');
      })


  };


  //sortable opts to move elements
  $scope.sortableOptionsForFields = {
    axis: 'y', //x',
    disabled: false,
    update: function (e, ui) {
    }
  };

  $scope.$on("angular-resizable.resizing", function (event, args) {
    //Refresh
    ServiceResize.renderChartDependingOnItsType($scope.whoIsActive, "#chart");
    if ($scope.defaultTable.table == 'pivot')
      ServiceResize.renderChartDependingOnItsType('pivot', "#pivotTable");
    if ($scope.defaultTable.table == 'simple')
      ServiceResize.renderChartDependingOnItsType('simple', "#simpleTable");

  });

  $scope.scrollToTop = function () {
    $location.hash('zoomProcessorBottomPanel');
    $anchorScroll();
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

    ServiceToast.cookToast('Вы выбрали дефолтный чарт: ' + fullNameOfAChart, 'info')



  };

  //who was selected as default table
  $scope.selectDefaultTable = function (tbl) {
    $scope.defaultTable = tbl;
    for (var i = 0; i < $scope.tableOptions.length; i++)
      if ($scope.defaultTable == $scope.tableOptions[i].name)
        ServiceToast.cookToast('Вы выбрали дефолтную таблицу: ' + $scope.tableOptions[i].fullName, 'info')


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


  //*********************MAP****************************

  $scope.addNewMarker = function () {
    $scope.mapConfig.markers.markerValuesNames.push('Новый маркер');
  }
  $scope.addNewSize = function () {
    $scope.mapConfig.markers.sizeGroups.push('Размер группы маркера');
  }
  $scope.addNewGroup = function () {
    $scope.mapConfig.grouping.groups.push('Размер группы значений');
  }
  $scope.mapAreas = [{location: 'app/ko/ko', name: 'Кировская область'}, {location: 'zzzz', name: 'Что-то еще'}];
  $scope.markerTypes = [{type: 'bubble', name: 'пузырь'}, {type: 'pie', name: 'пирог'}, {
    type: 'image',
    name: 'картинка'
  }];
  $scope.paletteTypes = ['Default', 'Soft Pastel', 'Harmony Light', 'Pastel', 'Bright', 'Soft', 'Ocean', 'Vintage', 'Violet']
  $scope.mapArea = $scope.mapAreas[0].location;


})
