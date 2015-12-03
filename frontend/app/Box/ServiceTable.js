/**
 *   Created by Hel on 06.11.2015.
 */
tstApp.factory("ServiceTable", function ($rootScope, ServiceAnalysis) {

    var rusification = {
      grandTotal: 'Итог',
      total: 'Подитог',
      sortRowBySummary: 'Сортировать ряды по итогу',
      sortColumnBySummary: 'Сортировать колонки по итогу',
      showFieldChooser: 'Выбор полей',
      removeAllSorting: 'Сбросить сортировку',
      noData: 'Нет данных',
      expandAll: 'Раскрыть все',
      collapseAll: 'Свернуть все'
    };

    var expander = function (expandRows, expandColumns, dataSource) {

      //special for expander
      var foreachTree = function (items, func, path) {
        path = path || [];
        for (var i = 0; i < items.length; i++) {
          path.push(items[i].value); //<-- this value does magic
          func(items[i], path);
          if (items[i].children) {
            foreachTree(items[i].children, func, path);
          }
          path.pop();
        }
      }

      var data = dataSource.getData();
      var state = {expandedRows: [], expandedColumns: []};

      foreachTree(data.rows, function (member, path) {
        //if (member.children) {
        state.expandedRows.push(path.slice(0));
        //}
      });


      foreachTree(data.columns, function (member, path) {
        // if (member.children) {
        state.expandedColumns.push(path.slice(0));
        // }
      });

      $.each(state.expandedRows, function (index, path) {
        if (expandRows)
          dataSource.expandHeaderItem("row", path);
        else
          dataSource.collapseHeaderItem("row", path);
      });
      $.each(state.expandedColumns, function (index, path) {
        if (expandColumns)
          dataSource.expandHeaderItem("column", path);
        else
          dataSource.collapseHeaderItem("column", path);

      });
    };

    //universal function for recursive digging into pivot

    var dataTraversalForDeviation = function (dataSource, pivotCnfg) {
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

      //var pivotGridDataSource = $('#pivotTable').dxPivotGrid('instance').getDataSource();
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
      //console.log(allMeasures);

      // really existing measures
      var reallyExistingMeasures = 0;
      for (var i = 0; i < allMeasures.length; i++)
        if (!(allMeasures[i].hasOwnProperty('myVirtualName')))
          reallyExistingMeasures++;
      //console.log('reallyExistingMeasures ' + reallyExistingMeasures);

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

              var findIndexOfVirtualMeasure = function (allMeasures, whoToSearch) {
                //define index of this virtual measure
                var maxVirtualIndex = 0;
                for (var i = 0; i < allMeasures.length; i++)
                  if ((allMeasures[i].myVirtualIndex ) && (allMeasures[i].myVirtualName == whoToSearch) && (allMeasures[i].myVirtualIndex > maxVirtualIndex))
                    maxVirtualIndex = allMeasures[i].myVirtualIndex;
                return maxVirtualIndex;
              };

              for (var i = 0; i < reallyExistingMeasures; i++) {
                //1) value of the cell
                //2) basis  (NOTE: first col with data has index=2)
                var basis = ((data.values[rowMembers[0].index] || [])[2] || [])[i];
                var value = ((data.values[rowMembers[0].index] || [])[columnMembers[0].index] || [])[i];
                //3) value of previous sell + deviation
                if (columnMembers[0].index > 2) { //0-GT, 1-Total, 2-Subtotal?
                  var valuePrevious = ((data.values[rowMembers[0].index] || [])[columnMembers[0].index - 1] || [])[i];
                }
                else
                  var valuePrevious = basis;
                //4) deviation
                var deviation = value - valuePrevious;


                //======Deviation
                if (pivotCnfg.absoluteDeviation) {
                  var maxVirtualIndex = findIndexOfVirtualMeasure(allMeasures, 'absoluteDeviation');
                  //console.log('absoluteDeviation maxVirtualIndex ' + maxVirtualIndex);
                  ((data.values[rowMembers[0].index] || [])[columnMembers[0].index] || [])[maxVirtualIndex + i] = deviation;
                }
                //======chainGrowthCoefficient
                if (pivotCnfg.chainGrowthCoefficient) {
                  var maxVirtualIndex = findIndexOfVirtualMeasure(allMeasures, 'chainGrowthCoefficient');
                  //console.log('chainGrowthCoefficient maxVirtualIndex ' + maxVirtualIndex);
                  var chainGrowthCoefficient = (value / valuePrevious).toFixed(3);
                  ((data.values[rowMembers[0].index] || [])[columnMembers[0].index] || [])[maxVirtualIndex + i] = chainGrowthCoefficient;

                }
                //========basisGrowthCoefficient
                if (pivotCnfg.basisGrowthCoefficient) {
                  var maxVirtualIndex = findIndexOfVirtualMeasure(allMeasures, 'basisGrowthCoefficient');
                  //console.log('basisGrowthCoefficient maxVirtualIndex ' + maxVirtualIndex);
                  var basisGrowthCoefficient = (value / basis).toFixed(3);
                  ((data.values[rowMembers[0].index] || [])[columnMembers[0].index] || [])[maxVirtualIndex + i] = basisGrowthCoefficient;
                }
                //========basisDeviationGrowthCoefficient
                if (pivotCnfg.basisDeviationGrowthCoefficient) {
                  var maxVirtualIndex = findIndexOfVirtualMeasure(allMeasures, 'basisDeviationGrowthCoefficient');
                  var basisDeviationGrowthCoefficient = ((value - basis ) / basis * 100).toFixed(2);
                  ((data.values[rowMembers[0].index] || [])[columnMembers[0].index] || [])[maxVirtualIndex + i] = basisDeviationGrowthCoefficient;
                }
                //========chainDeviationGrowthCoefficient
                if (pivotCnfg.chainDeviationGrowthCoefficient) {
                  var maxVirtualIndex = findIndexOfVirtualMeasure(allMeasures, 'chainDeviationGrowthCoefficient');

                  var chainDeviationGrowthCoefficient = ((value - valuePrevious) / valuePrevious * 100).toFixed(2);
                  ((data.values[rowMembers[0].index] || [])[columnMembers[0].index] || [])[maxVirtualIndex + i] = chainDeviationGrowthCoefficient;
                }
              }

            }
          })
        }
      })
    };

    var heatmapAnalyzis = function (heatmap, e) {
      if (heatmap.on) { //if option is ON
        var color,
          measure = e.cell.dataIndex,
          minValue = heatmap.minValues[measure],
          maxValue = heatmap.maxValues[measure],
          value = parseInt(e.cell.text),
          palette = [360, 120, 300, 180, 240, 60];

        if ((e.cell.rowType == "D") && (e.cell.columnType == "D")) {
          if (!isNaN(value)) {
            var variation = 75 - (Math.round(55 * (value - minValue) / (maxValue - minValue))); //we' ll change lightness from 20 to 75
            //if (variation >= 255) {
            //  var b = (510 - variation);
            //  var r = 255;
            //} else {
            //  var b = 255;
            //  var r = (variation);
            //}
            //color = r + ',0,' + b;
            var hue = palette[e.cell.dataIndex];
            var hsla = 'hsla(' + hue + ', 85%, ' + variation + '%, 1)'

            console.log(value + '; ' + hsla)
            e.cellElement.css("background", hsla); //'rgb(' + color + ')');
          }
          //if (heatmap.onWithTotal) {
          //  minValue = heatmap.minValueWithTotal;
          //  maxValue = heatmap.maxValueWithTotal;
          //}
        }
        //if ((e.cell.rowType == "T") || (e.cell.columnType == "T") || (e.cell.rowType == "GT") || (e.cell.columnType == "GT")) {
        //  //if (heatmap.onWithTotal) {
        //  //  minValue = heatmap.minTotal;
        //  //  maxValue = heatmap.maxTotal;
        //  //}
        //}

      }
      else
        e.cellElement.css("background", '');
    };

    return {
      simpleTable: function (selector, dataConfig, data) {

        var myPulledColumnsAll = [];
        for (var i = 0; (dataConfig && i < dataConfig.length); i++) {
          var myNewColumn = {
            dataField: dataConfig[i].fieldAlias,
            caption: dataConfig[i].fieldName,
          }
          if (dataConfig[i].hasOwnProperty('groupIndex'))
            myNewColumn.groupIndex = dataConfig[i].groupIndex;

          myPulledColumnsAll.push(myNewColumn);
        }
        var chartOpts = {
          dataSource: data,
          paging: {
            enabled: true
          },
          //editing: {
          //  editMode: 'row',
          //  editEnabled: true,
          //  removeEnabled: true,
          //  insertEnabled: true,
          //  removeConfirmMessage: 'Are you sure you want to delete this record?'
          //},
          //selection: {
          //  mode: 'multiple'
          //},
          columns: myPulledColumnsAll,
          allowColumnResizing: true,
          groupPanel: {visible: true},
          grouping: {autoExpandAll: false}
        };

        //APPEND
        $(selector).dxDataGrid(chartOpts);

      },

      pivotTable: function (selector, chartInfo, data, whoIsActive, chartSelector) {

        var dataConfig = chartInfo.settings.dataConfig;
        //fill in rows
        var tempFields = [];
        for (var i = 0; (dataConfig && i < dataConfig.length); i++) {
          // r-o-w-s
          if (dataConfig[i].pivot && (dataConfig[i].pivot.role == 'row')) {

            var insertThis = {
              caption: dataConfig[i].fieldName,
              width: 120,
              dataField: dataConfig[i].fieldAlias,
              area: dataConfig[i].pivot.role,
            }
            if (dataConfig[i].hasOwnProperty('areaIndex'))
              insertThis.areaIndex = dataConfig[i].areaIndex;

            tempFields.push(insertThis);
          }
          // c-o-l-s
          if (dataConfig[i].pivot && (dataConfig[i].pivot.role == 'column')) {

            for (var j = 0; j < dataConfig[i].pivot.group.length; j++) {

              var groupPeriod = dataConfig[i].pivot.group[j];
              //console.log(groupPeriod);
              var insertThis = {
                caption: dataConfig[i].fieldName,
                dataField: dataConfig[i].fieldAlias,
                area: dataConfig[i].pivot.role,
                dataType: dataConfig[i].type,
                groupInterval: groupPeriod,
              }
              if (dataConfig[i].hasOwnProperty('areaIndex'))
                insertThis.areaIndex = dataConfig[i].areaIndex;
              tempFields.push(insertThis);
            }
          }
          // d-a-t-a
          if (dataConfig[i].pivot && (dataConfig[i].pivot.role == 'data')) {

            var insertThis = {
              caption: dataConfig[i].fieldName,
              dataField: dataConfig[i].fieldAlias,
              area: dataConfig[i].pivot.role,
              dataType: dataConfig[i].type,
              summaryType: chartInfo.settings.tableConfig.pivotConfig.summaryType,
              format: dataConfig[i].pivot.format,
              precision: dataConfig[i].pivot.precision
            }
            //console.log(insertThis);
            tempFields.push(insertThis);
          }

        }

        //console.log('tmp flds');
        //console.log(tempFields);

        //Stolen from: http://jsfiddle.net/wf1p3bew/
        var dataSource = new DevExpress.data.PivotGridDataSource({
          store: data,
          fields: tempFields,
        });

        dataSource.load().done(function () {

          console.log('DS load done');
          //console.log(chartInfo.settings.tableConfig.pivotConfig.expandRows);
          //console.log(chartInfo.settings.tableConfig.pivotConfig.expandColumns);
          expander(chartInfo.settings.tableConfig.pivotConfig.expandRows, chartInfo.settings.tableConfig.pivotConfig.expandColumns, dataSource);

          //add some params
          chartInfo.settings.tableConfig.pivotConfig.texts = rusification;
          chartInfo.settings.tableConfig.pivotConfig.allowExpandAll = true;
          chartInfo.settings.tableConfig.pivotConfig.allowFiltering = true;
          chartInfo.settings.tableConfig.pivotConfig.allowSorting = true;
          chartInfo.settings.tableConfig.pivotConfig.allowSortingBySummary = true;
          chartInfo.settings.tableConfig.pivotConfig.heatmap = {
            on: false,
            onWithTotal: false
          };
          chartInfo.settings.tableConfig.pivotConfig.onCellPrepared = function (e) {
            //console.log('onCellPrepared')
            //console.log(e)
            heatmapAnalyzis(chartInfo.settings.tableConfig.pivotConfig.heatmap, e);

          };

          $(selector).dxPivotGrid(chartInfo.settings.tableConfig.pivotConfig);

          //APPEND
          $(selector).dxPivotGrid({dataSource: dataSource});

          dataSource.on("changed", function () {
            //console.log('DS changed')
            if (chartInfo.settings.defaultKind != 'table') {
              if (whoIsActive == 'pie' || whoIsActive == 'doughnut')
                $(chartSelector).dxPieChart("option", "dataSource", createChartDataSource(dataSource));
              else {
                if (whoIsActive != 'map' && whoIsActive != 'gauge' && whoIsActive != 'scale' && whoIsActive != 'text')
                  $(chartSelector).dxChart("option", "dataSource", createChartDataSource(dataSource));
              }


              dataTraversalForDeviation(dataSource, chartInfo.settings.tableConfig.pivotConfig);

            }

          });

        });


      },

      //pivotOnChangeBindingToChart: function (pivotSelector, chartSelector, whoIsActive) {
      //  var pivotGridDataSource = $(pivotSelector).dxPivotGrid("instance").getDataSource();
      //  pivotGridDataSource.on("changed", function () {
      //    if (whoIsActive != 'pie' && whoIsActive != 'map' && whoIsActive != 'gauge' && whoIsActive != 'scale' && whoIsActive != 'text') {
      //      $(chartSelector).dxChart("option", "dataSource", createChartDataSource(pivotGridDataSource));
      //    }
      //  });
      //
      //},

      expand: function (rows, columns) {
        var dataSource = $('#pivotTable').dxPivotGrid('instance').getDataSource();
        expander(rows, columns, dataSource);
        //APPEND

        //$('#pivotTable').dxPivotGrid({dataSource: dataSource});

      }

    }
  }
)


//if (e.area == "data") {
//  var value = parseInt(e.cell.text);
//  if (chartInfo.settings.tableConfig.pivotConfig.heatmap.minTotal == undefined)
//    chartInfo.settings.tableConfig.pivotConfig.heatmap.minTotal = chartInfo.settings.tableConfig.pivotConfig.heatmap.minValueWithTotal = chartInfo.settings.tableConfig.pivotConfig.heatmap.maxValueWithTotal = chartInfo.settings.tableConfig.pivotConfig.heatmap.maxTotal = chartInfo.settings.tableConfig.pivotConfig.heatmap.min;
//
//  if ((e.cell.rowType == "D") && (e.cell.columnType == "D")) {
//    if (value == 363)
//      console.log(e)
//    if (chartInfo.settings.tableConfig.pivotConfig.heatmap.minValueWithTotal > value)
//      chartInfo.settings.tableConfig.pivotConfig.heatmap.minValueWithTotal = value;
//    if (chartInfo.settings.tableConfig.pivotConfig.heatmap.maxValueWithTotal < value)
//      chartInfo.settings.tableConfig.pivotConfig.heatmap.maxValueWithTotal = value;
//  }
//  if ((e.cell.rowType == "T") || (e.cell.columnType == "T") || (e.cell.rowType == "GT") || (e.cell.columnType == "GT")) {
//    if (chartInfo.settings.tableConfig.pivotConfig.heatmap.minTotal > value)
//      chartInfo.settings.tableConfig.pivotConfig.heatmap.minTotal = value;
//    if (chartInfo.settings.tableConfig.pivotConfig.heatmap.maxTotal < value)
//      chartInfo.settings.tableConfig.pivotConfig.heatmap.maxTotal = value;
//  }
//
//
//  var minValue = chartInfo.settings.tableConfig.pivotConfig.heatmap.min;
//  var maxValue = chartInfo.settings.tableConfig.pivotConfig.heatmap.max;
