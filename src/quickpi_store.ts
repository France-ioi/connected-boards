export function QuickStore(rwidentifier, rwpassword) {
  var url = 'https://cloud.quick-pi.org';
  var connected = (rwidentifier === undefined);

  function post(path, data, callback) {
    $.ajax({
      type: 'POST',
      url: url + path,
      crossDomain: true,
      data: data,
      dataType: 'json',
      success: callback
    });
  }

  return {
    connected: rwpassword,
    read: function(identifier, key, callback) {
      var data = {
        prefix: identifier,
        key: key
      };
      post('/api/data/read', data, callback);
    },

    write: function(identifier, key, value, callback) {
      if (identifier != rwidentifier)
      {
        callback({
          sucess: false,
          message: "Écriture sur un identifiant en lecture seule : " + identifier,
        });
      }
      else {
        var data = {
          prefix: identifier,
          password: rwpassword,
          key: key,
          value: JSON.stringify(value)
        };
        post('/api/data/write', data, callback);
      }
    }
  }
}
