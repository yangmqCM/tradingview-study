
class socket {
  constructor(url = 'wss://api.hadax.com/ws', options) {
    this.heartBeatTimer = null
    this.options = options
    this.messageMap = {}
    this.connState = 0
    this.socket = null
    this.url = url
  }
  doOpen() {
    if (this.connState) return
    this.connState = 1
    this.afterOpenEmit = []
    const BrowserWebSocket = window.WebSocket || window.MozWebSocket
    const socket = new BrowserWebSocket(this.url)
    socket.binaryType = 'arraybuffer'
    socket.onopen = evt => this.onOpen(evt)
    socket.onclose = evt => this.onClose(evt)
    socket.onmessage = evt => this.onMessage(evt.data)
    socket.onerror = err => this.onError(err)
    this.socket = socket
  }
  handle(data) {   
    // console.log('received', data.ch, 'data.ts', data.ts, 'crawler.ts', moment().format('x'));
    let symbol = data.ch.split('.')[1];
    let channel = data.ch.split('.')[2];
    switch (channel) {
      case 'depth':
        orderbook[symbol] = data.tick;
        break;
      case 'kline':
        return data.tick
        break;
    } 
  }
  onOpen(evt) {
    this.connState = 2
    this.heartBeatTimer = setInterval(this.checkHeartbeat.bind(this), 20000)
    this.onReceiver({ Event: 'open' })
  }
  checkOpen() {
    return this.connState === 2
  }
  onClose() {
    this.connState = 0
    if (this.connState) {
      this.onReceiver({ Event: 'close' })
    }
  }
  send(data) {
    data = {
      "sub": `market.btcusdt.kline.1min`,
      "id": `btcusdt`
  }
    this.socket.send(JSON.stringify(data))
  }
  emit(data) {
    return new Promise(resolve => {
      this.socket.send(JSON.stringify(data))
      this.on('message', data => {
        resolve(data)
      })
    })
  }
  onMessage(message) {
    try {
      const pako = require('pako');
      // let text = pako.inflate(message, {to: 'string'});
      // let msg = JSON.parse(text);
      // this.onReceiver({ Event: 'message', Data: msg })
      let text = pako.inflate(message, {
        to: 'string'
      });
      let msg = JSON.parse(text);
      
      if (msg.ping) {
        this.socket.send(JSON.stringify({
          pong: msg.ping
        }));
      } else if (msg.tick) {
        // console.log(msg);
        //this.handle(msg);
        this.onReceiver({ Event: 'message', Data: this.handle(msg) })
      } else {
        this.onReceiver({ Event: 'message', Data: this.handle(msg) })
      }

    } catch (err) {
      console.error(' >> Data parsing error:', err)
    }
  }
  checkHeartbeat() {
    const data = {
      'cmd': 'ping',
      'args': [Date.parse(new Date())]
    }
    this.send(data)
  }
  onError(err) {

  }
  onReceiver(data) { 
    const callback = this.messageMap[data.Event] 
    if (callback) callback(data.Data)
  }
  on(name, handler) {
    this.messageMap[name] = handler
  }
  doClose() {
    this.socket.close()
  }
  destroy() {
    if (this.heartBeatTimer) {
      clearInterval(this.heartBeatTimer)
      this.heartBeatTimer = null
    }
    this.doClose()
    this.messageMap = {}
    this.connState = 0
    this.socket = null
  }
}

export default socket