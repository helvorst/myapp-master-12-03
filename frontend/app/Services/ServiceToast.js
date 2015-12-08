/**
 * Created by hel on 06.12.2015.
 */
tstApp.factory("ServiceToast", function (toasty, $rootScope) {

  return {

    cookToast: function (message, importance) {

      if (this.prev != message) {
        var id = undefined;

        var conf = {
          msg: message,
          sound: !$rootScope.mute,
          onAdd: function () {
            id = this.id;
          }
        }


        if (importance == 'warning')
          toasty.warning(conf);
        if (importance == 'error')
          toasty.error(conf);
        if (importance == 'wait')
          toasty.wait(conf);
        if (importance == 'info')
          toasty.info(conf);
        if (importance == 'success')
          toasty.success(conf);
        if (importance == 'default')
          toasty(conf);


        this.prev = message;

        return id;
      }
    },

    dismissAll: function () {
      toasty.clear();
    },

    dismissById: function (id) {
      toasty.clear(id);
    }
  }
})
