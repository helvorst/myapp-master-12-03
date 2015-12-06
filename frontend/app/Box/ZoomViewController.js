/**
 * Created by Hel on 03.11.2015.
 */
tstApp.controller("ZoomViewController", function ($scope, $uibModalInstance, DataToPassInModal,
                                                  ServiceDraw, ServiceExport, ServiceResize, ServiceTable,
                                                  ServiceAnalysis, $rootScope, $timeout, $window, ServiceToast) {

    $scope.chartInfo = DataToPassInModal.chartInfo;
    $scope.myData = DataToPassInModal.myData;
    $scope.whoIsActive = DataToPassInModal.whoIsActive;
    $scope.legendOn = true;

    $scope.showLegend = function () {
      //change value to opposite
      $scope.legendOn = !$scope.legendOn;
      //get DX object
      var chart = ServiceDraw.returnDXInstance($scope.whoIsActive, '#chart');
      //fill it with new option
      chart.option({
        legend: {visible: $scope.legendOn}
      });


    };

    //expose service
    $scope.$ServiceExport = ServiceExport;

    $scope.draw = function (whoIsActive) {

      //by default legend is always on
      $scope.legendOn = true;

      ServiceToast.cookToast('Будет нарисован ' + whoIsActive, 'info')

      $scope.whoIsActive = whoIsActive;
      $rootScope.mycharts[$scope.chartInfo.id].whoIsActive = $scope.whoIsActive;

      if (whoIsActive != 'table') {
        var width = $(window).width(), height = $(window).height();
        if (whoIsActive == 'map') { //scale chart for maps only
          $('#zoomViewMainPanelTopContainer').height((height * 0.85) + "px");
        }
        else
          $('#zoomViewMainPanelTopContainer').height((height * 0.65) + "px");
      }

      if ($scope.chartInfo.settings.defaultKind != 'table')
        ServiceDraw.whoToRedraw(whoIsActive, "#chart", $scope.chartInfo, $scope.myData);

      if ($scope.chartInfo.settings.tableConfig.table == 'simple')
        ServiceTable.simpleTable("#simpleTable", $scope.chartInfo.settings.dataConfig, $scope.myData);

      if ($scope.chartInfo.settings.tableConfig.table == 'pivot') {
        try {
          $("#pivotTable").dxPivotGrid('instance');
          if ($scope.chartInfo.settings.defaultKind != 'table')
            $("#chart").dxChart("option", "dataSource", createChartDataSource($("#pivotTable").dxPivotGrid("instance").getDataSource()));
        } catch (e) {
          ServiceTable.pivotTable("#pivotTable", $scope.chartInfo, $scope.myData, whoIsActive, '#chart');
        }
      }
    }

    $scope.ok = function () {

      $uibModalInstance.close($scope.subject);

    };

    $scope.cancel = function () {

      ServiceToast.dismissAll();

      $uibModalInstance.dismiss('cancel');
    };


    $scope.$on("angular-resizable.resizing", function (event, args) {
      ServiceResize.renderChartDependingOnItsType($scope.chartInfo.settings.defaultKind, "#chart");
    });


    $scope.hideSettings = function () {

      //this function wont work if #zoomViewLeftPanel width is changed to smt else from col-md-3
      if ($("#zoomViewLeftPanel").hasClass('col-md-3')) {
        $("#zoomViewLeftPanel").removeClass('col-md-3');
        $("#zoomViewLeftPanel").addClass('underCover');
        $("#zoomViewMainPanel").removeClass('col-md-9');
        $("#zoomViewMainPanel").addClass('col-md-12');
      }
      else {
        $("#zoomViewLeftPanel").removeClass('underCover');
        $("#zoomViewLeftPanel").addClass('col-md-3');
        $("#zoomViewMainPanel").removeClass('col-md-12');
        $("#zoomViewMainPanel").addClass('col-md-9');
      }
      //Refresh
      ServiceResize.renderChartDependingOnItsType($scope.whoIsActive, "#chart");
      if ($scope.chartInfo.settings.tableConfig.table == 'pivot')
        ServiceResize.renderChartDependingOnItsType('pivot', "#pivotTable");
      if ($scope.chartInfo.settings.tableConfig.table == 'simple')
        ServiceResize.renderChartDependingOnItsType('simple', "#simpleTable");

    }

    $scope.showTotalsPivotTable = function () {

      ServiceToast.cookToast('Отображение итогов изменено', 'info')
      $('#pivotTable').dxPivotGrid($scope.chartInfo.settings.tableConfig.pivotConfig);

    }

    $scope.expand = function () {
      ServiceToast.cookToast( '<p>Ряды развернуты: ' + ($scope.chartInfo.settings.tableConfig.pivotConfig.expandRows ? 'да' : 'нет') + '</p><p>Столбцы развернуты: ' + ($scope.chartInfo.settings.tableConfig.pivotConfig.expandColumns ? 'да' : 'нет') + '</p>', 'info')
      ServiceTable.expand($scope.chartInfo.settings.tableConfig.pivotConfig.expandRows, $scope.chartInfo.settings.tableConfig.pivotConfig.expandColumns);
    }

    $scope.totalFunction = function (newType) {

      var dataSource = $('#pivotTable').dxPivotGrid('instance').getDataSource();

      //restorePivot from forcefully added measures
      restorePivot(dataSource, true);
      ServiceToast.cookToast('Анализ пришлось отключить', 'warning')

      ServiceToast.cookToast('Выбрана новая аггрегатная функция: ' + $scope.chartInfo.settings.tableConfig.pivotConfig.summaryType, 'info')


      $scope.chartInfo.settings.tableConfig.pivotConfig.summaryType = newType;

      var datas = dataSource.getAreaFields("data");
      for (var i = 0; i < datas.length; i++) {
        datas[i].summaryType = $scope.chartInfo.settings.tableConfig.pivotConfig.summaryType;

        //example: http://jsfiddle.net/gq4b63oL/40/
        if (newType == 'custom') {
          datas[i].calculateCustomSummary = function (options) {

            if (options.summaryProcess == 'start') {
              // Initializing "totalValue" here
              var deviation = {
                prev: 0,
                total: 0
              }
              options.totalValue = deviation;
              console.log('stage: start, val: ' + options.value);
              //console.log(options);
            }
            if (options.summaryProcess == 'calculate') {
              // Modifying "totalValue" here
              //console.log('stage: calculate ' );
              //console.log(options);
              var deviation = {
                prev: options.value,
                total: options.value - options.totalValue.prev
              }
              options.totalValue = deviation;
              console.log(deviation);
            }
            if (options.summaryProcess == 'finalize') {
              // Assigning the final value to "totalValue" here
              //console.log('stage: finalize ' );
              //console.log(options);
              options.totalValue = options.totalValue.total; //- options.totalValue.prev;
              console.log('fin: ' + options.totalValue)
            }
          };
        }
      }

      $('#pivotTable').dxPivotGrid($scope.chartInfo.settings.tableConfig.pivotConfig);
      $('#pivotTable').dxPivotGrid({dataSource: dataSource});
    }

    $scope.heatmap = function () {

      if ($scope.chartInfo.settings.tableConfig.pivotConfig.heatmap.on)
        ServiceToast.cookToast('Heatmap для области данных включен', 'info')
      else
        ServiceToast.cookToast('Heatmap для области данных выключен', 'info')

      var ds = $('#pivotTable').dxPivotGrid('instance').getDataSource()


      //when main turned off, minor also should be
      //if (!$scope.chartInfo.settings.tableConfig.pivotConfig.heatmap.on)
      //  $scope.chartInfo.settings.tableConfig.pivotConfig.heatmap.onWithTotal = false;

      //Let's find min and max among data
      findMaxAndMinAmongData(ds);


      $('#pivotTable').dxPivotGrid($scope.chartInfo.settings.tableConfig.pivotConfig);
    }

    $scope.dynamicAnalysis = function (isOn) {

      //hide totals in columns
      $scope.chartInfo.settings.tableConfig.pivotConfig.showColumnGrandTotals = false;
      $scope.chartInfo.settings.tableConfig.pivotConfig.showColumnTotals = false;
      $scope.showTotalsPivotTable();

      if (isOn) {
        ServiceToast.cookToast('Показатель включен', 'info')
        ServiceToast.cookToast('Внимание: итоги и подитоги по столбцам были скрыты', 'warning')
      }
      else
        ServiceToast.cookToast('Показатель выключен', 'info')

      var ds = $('#pivotTable').dxPivotGrid('instance').getDataSource();

      //first of all delete everything
      restorePivot(ds, false);
      //add what we need to add again
      addDataField(ds, $scope.chartInfo.settings.tableConfig.pivotConfig);

      //below line initializing pivot with options is purely for purpose of refreshing table so newly added column couls be seen
      $('#pivotTable').dxPivotGrid($scope.chartInfo.settings.tableConfig.pivotConfig);
    }

    //********Does virtual measure exist?***************
    var alreadyExistingVirtualMeasure = function (allMeasures, whoToSearch) {
      //console.log(allMeasures);
      var alreadyExists = false;
      for (var i = 0; i < allMeasures.length; i++)
        if ((allMeasures[i].hasOwnProperty('myVirtualName')) && (allMeasures[i]['myVirtualName'] == whoToSearch))
          alreadyExists = true;
      return alreadyExists;
    }

    //********Add virtual measure************************
    var addDataField = function (ds, pivotConfig) {
      //define last index of  measure
      var allMeasures = ds.getAreaFields('data'),
        reallyExistingMeasures = 0;

      // really existing measures
      for (var i = 0; i < allMeasures.length; i++)
        if (!(allMeasures[i].hasOwnProperty('myVirtualName')))
          reallyExistingMeasures++;

      var myVirtualIndex = allMeasures.length;


      var curFields = ds.fields(),
        prefix = '',
        myVirtualName = '';

      var createNewFld = function (caption, myVirtualIndex, myVirtualName) {
        var newCol = {
          summaryType: 'custom', //to make all values appear empty
          area: 'data',
          isMeasure: false,
          caption: caption,
          myVirtualName: myVirtualName,
          myVirtualIndex: myVirtualIndex,
          calculateCustomSummary: function (options) {

            if (options.summaryProcess == 'start') {
            }
            if (options.summaryProcess == 'calculate') {
            }
            if (options.summaryProcess == 'finalize') {
              //console.log('fin: ' + options.totalValue )
            }
          }
        };
        return newCol;
      };

      if (pivotConfig.absoluteDeviation) {
        if (!(alreadyExistingVirtualMeasure(allMeasures, 'absoluteDeviation'))) {
          var newCol = createNewFld('Δ', myVirtualIndex, 'absoluteDeviation')
          for (var i = 0; i < reallyExistingMeasures; i++)
            curFields.push(newCol);
          myVirtualIndex = myVirtualIndex + reallyExistingMeasures;
        }
      }
      if (pivotConfig.chainGrowthCoefficient) {
        if (!(alreadyExistingVirtualMeasure(allMeasures, 'chainGrowthCoefficient'))) {
          var newCol = createNewFld('Kц', myVirtualIndex, 'chainGrowthCoefficient')
          for (var i = 0; i < reallyExistingMeasures; i++)
            curFields.push(newCol);
          myVirtualIndex = myVirtualIndex + reallyExistingMeasures;

        }
      }
      if (pivotConfig.basisGrowthCoefficient) {
        if (!(alreadyExistingVirtualMeasure(allMeasures, 'basisGrowthCoefficient'))) {
          var newCol = createNewFld('Kб', myVirtualIndex, 'basisGrowthCoefficient')
          for (var i = 0; i < reallyExistingMeasures; i++)
            curFields.push(newCol);
          myVirtualIndex = myVirtualIndex + reallyExistingMeasures;
        }
      }
      if (pivotConfig.basisDeviationGrowthCoefficient) {
        if (!(alreadyExistingVirtualMeasure(allMeasures, 'basisDeviationGrowthCoefficient'))) {
          var newCol = createNewFld('Tб', myVirtualIndex, 'basisDeviationGrowthCoefficient')
          for (var i = 0; i < reallyExistingMeasures; i++)
            curFields.push(newCol);
          myVirtualIndex = myVirtualIndex + reallyExistingMeasures;
        }
      }
      if (pivotConfig.chainDeviationGrowthCoefficient) {
        if (!(alreadyExistingVirtualMeasure(allMeasures, 'chainDeviationGrowthCoefficient'))) {
          var newCol = createNewFld('Tц', myVirtualIndex, 'chainDeviationGrowthCoefficient')
          for (var i = 0; i < reallyExistingMeasures; i++)
            curFields.push(newCol);
          myVirtualIndex = myVirtualIndex + reallyExistingMeasures;
        }
      }

      //insert new measures back to pivot
      ds.fields(curFields);

    }

    //********Restore all analysis settings**************
    var restoreAnalysisSettings = function (pivotSettings) {
      pivotSettings.absoluteDeviation = false;
      pivotSettings.basisGrowthCoefficient = false;
      pivotSettings.chainGrowthCoefficient = false;
      pivotSettings.basisDeviationGrowthCoefficient = false;
      pivotSettings.chainDeviationGrowthCoefficient = false;
      console.log('restoreAnalysisSettings')
      console.log(pivotSettings)
    };

    //********Restore pivot (clear it from virtual measures)**
    var restorePivot = function (ds, deleteAll) {
      var curFields = ds.fields();
      var cleanFields = [];

      for (var i = 0; i < curFields.length; i++) {
        //clean out all virtual measures
        if (!curFields[i].hasOwnProperty('myVirtualIndex'))
          cleanFields.push(curFields[i]);
      }
      //restore all analysis settings
      if (deleteAll)
        restoreAnalysisSettings($scope.chartInfo.settings.tableConfig.pivotConfig);

      //feed cleaned fields  back to datasource
      console.log('clean flds after restore ')
      console.log(cleanFields)
      ds.fields(cleanFields);
    }

    //********Find data MIN and MAX**********************
    var findMaxAndMinAmongData = function (dataSource) {
      //service function to go through data
      var foreachTree = function (items, func, members) {
        members = members || [];
        for (var i = 0; i < items.length; i++) {
          members.unshift(items[i]);
          func(members);
          if (items[i].children) {
            foreachTree(items[i].children, func, members);
          }
          members.shift();
        }
      };

      var data = dataSource.getData(),
        rowLevel = 1,
        columnLevel = 1;

      //find max expanded hierarchy level
      foreachTree(data.rows, function (members) {
        rowLevel = Math.max(rowLevel, members.length);
      });
      foreachTree(data.columns, function (members) {
        columnLevel = Math.max(columnLevel, members.length);
      });

      var rows = data.rows.length ? data.rows : [{index: 0, value: "Grand Total"}];
      var columns = data.columns.length ? data.columns : [{index: 0, value: "Grand Total"}];


      var allMeasures = dataSource.getAreaFields('data');
      //prepare arrays to store min and max
      var minAllMeasures = [], maxAllMeasures = [];
      for (var i = 0; i < allMeasures.length; i++) {
        minAllMeasures[i] = undefined;
        maxAllMeasures[i] = undefined;
      }
      foreachTree(rows, function (rowMembers) {
        if (rowLevel === rowMembers.length) {
          var names = $.map(rowMembers, function (member) {
            return member.value;
          }).reverse();
          foreachTree(columns, function (columnMembers) {
            if (columnLevel === columnMembers.length) {
              var args = $.map(columnMembers, function (member) {
                return member.value;
              }).reverse();
              for (var i = 0; i < allMeasures.length; i++) {
                var value = ((data.values[rowMembers[0].index] || [])[columnMembers[0].index] || [])[i];
                console.log(value)
                //initialize empty arrays
                if (minAllMeasures[i] == undefined) {
                  minAllMeasures[i] = value;
                }
                if (maxAllMeasures[i] == undefined)
                  maxAllMeasures[i] = value;
                //check for min/max
                if (value < minAllMeasures[i])
                  minAllMeasures[i] = value;
                if (value > maxAllMeasures[i])
                  maxAllMeasures[i] = value;
              }
            }
          });
        }
      });

      //save what we found in pivot config
      $scope.chartInfo.settings.tableConfig.pivotConfig.heatmap.minValues = minAllMeasures;
      $scope.chartInfo.settings.tableConfig.pivotConfig.heatmap.maxValues = maxAllMeasures;

    }

  }
)

