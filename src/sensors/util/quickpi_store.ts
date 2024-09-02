export class QuickStore {
  private url = 'https://cloud.quick-pi.org';
  private rwidentifier: string;
  private rwpassword: string;
  public connected: boolean = false;

  constructor(rwidentifier?: string, rwpassword?: string) {
    this.rwidentifier = rwidentifier;
    this.rwpassword = rwpassword;
    this.connected = !!rwpassword;
  }

  read(identifier, key, callback) {
    let data = {
      prefix: identifier,
      key: key
    };
    this.post('/api/data/read', data, callback);
  }

  write(identifier, key, value, callback) {
    if (identifier !== this.rwidentifier)
    {
      callback({
        sucess: false,
        message: "Écriture sur un identifiant en lecture seule : " + identifier,
      });
    }
    else {
      let data = {
        prefix: identifier,
        password: this.rwpassword,
        key: key,
        value: JSON.stringify(value)
      };
      this.post('/api/data/write', data, callback);
    }
  }

  private post(path, data, callback) {
    $.ajax({
      type: 'POST',
      url: this.url + path,
      crossDomain: true,
      data: data,
      dataType: 'json',
      success: callback
    });
  }
}
