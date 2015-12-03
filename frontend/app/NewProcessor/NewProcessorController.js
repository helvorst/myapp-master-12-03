/**
 * Created by Hel on 14.10.2015.
 */
tstApp.controller('NewProcessorController', function ($scope, $rootScope, REST, $state, ngToast, $uibModal) {

  //imagine we ve got it
  $scope.procsIcanEdit = $rootScope.mycharts;

  console.log($scope.procsIcanEdit)

  $scope.editProcessor = function (procID) {

    /////////////////////////////////////////////////////////////////////////////
    //////////////////////////OPEN MODAL
    /////////////////////////////////////////////////////////////////////////////
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/NewProcessor/ZoomProcessorEdit.html',
      controller: 'ZoomProcessorEditController',
      windowClass: 'zoom-view-modal',
      backdrop: 'static',
      resolve: {
        DataToPassInModal: function () {

          if (procID) {
            for (var i = 0; i < $scope.procsIcanEdit.length; i++)
              if ($scope.procsIcanEdit[i].processor == procID)
                var datus = {
                  processor: $scope.procsIcanEdit[i],
                }
            return datus;
          }
          else
            return null;


        }
      }
    });

    modalInstance.result.then(function (editedSubjectFromModal) {
    })
  };

  $scope.foundProcs = false;
  //filter by proc name
  $scope.filterProcByName = function (item) {
    return (item.name.toLowerCase().search($scope.procNameToLookFor) > -1);
  };


})


////filters in dataConfig
//$scope.myFilterForRow = function (item) {
//  return item.pivot.role === 'row';
//};
//$scope.myFilterForColumn = function (item) {
//  return item.pivot.role === 'column';
//};
//$scope.myFilterForData = function (item) {
//  return item.pivot.role === 'data';
//};
//$scope.myFilterForSimpleTable = function (item) {
//  return !item.hasOwnProperty('pivot');
//};

//
////delete field
//$scope.DeleteField = function (whereToLook, deleteIt) {
//  console.log(whereToLook);
//  console.log(deleteIt);
//  for (var i = 0; i < whereToLook.length; i++)
//    if (whereToLook.tmpIndx == deleteIt)
//      whereToLook.splice(i, 1);
//
//};

////while there is no data yet let's use fake config
//var fakeProcCfg =   {
//  name: "Зависимость удельного удоенавысера-копыта коров от курса евро Зависимость удельного удоенавысера-копыта коров от курса евро Зависимость удельного удоенавысера-копыта коров от курса евро",
//  id: 0,
//  processor: 10,
//  settings: {
//    chartConfig: {},
//    dataConfig: [
//      {
//        fieldName: "Совхоз",
//        fieldAlias: 'sovhoz',
//        type: 'string',
//        pivot: {
//          role: 'row'
//        }
//      },
//      {
//        fieldName: "Корова",
//        fieldAlias: 'x',
//        type: 'string',
//        pivot: {
//          role: 'row'
//        }
//      },
//
//      {
//        fieldName: "Имя показателя",
//        fieldAlias: 'type',
//        type: 'string',
//        pivot: {
//          role: 'row'
//        }
//      },
//      {
//        fieldName: "Период",
//        fieldAlias: 'period',
//        isX: true,
//        type: 'date',
//        pivot: {
//          role: 'column',
//          group: ['year', 'quarter', 'month']
//        }
//      },
//      {
//        fieldName: "Показатель",
//        fieldAlias: 'value',
//        isX: false,
//        type: 'number',
//        pivot: {
//          role: 'data',
//          format: 'fixedPoint',  //http://js.devexpress.com/Documentation/Guide/Data_Visualization/Common/Data_Formatting/?version=15_1#Data_Visualization_Common_Data_Formatting_Available_Formats_Numeric_Formats
//          precision: 2
//        }
//      },
//      {
//        fieldName: "Изм-2",
//        fieldAlias: 'meas',
//        isX: false,
//        type: 'number',
//        pivot: {
//          role: 'data',
//          format: 'fixedPoint',  //http://js.devexpress.com/Documentation/Guide/Data_Visualization/Common/Data_Formatting/?version=15_1#Data_Visualization_Common_Data_Formatting_Available_Formats_Numeric_Formats
//          precision: 1
//        }
//      },
//      {
//        fieldName: "Коммент",
//        fieldAlias: 'comment'
//      }
//    ],
//    tableConfig: {
//      table: "pivot",
//      pivotConfig: {
//        summaryType: 'sum',
//        expandRows: true,
//        expandColumns: true,
//        showColumnGrandTotals: true,
//        showRowGrandTotals: true,
//        showColumnTotals: true,
//        showRowTotals: true
//      }
//    },
//    defaultKind: 'stackedBar',
//    defaultHeight: 300,
//    defaultWidth: 300,
//
//  }
//
//};
//
////DEFAULTS
//if(newProcCfg.length == 0)
//  newProcCfg = fakeProcCfg;
