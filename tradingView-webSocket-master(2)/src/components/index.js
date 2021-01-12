const store = {
    ws: new WebSocket("wss://api.huobiasia.vip/ws"),
    onDataCallback: null,
    onRealTimeCallback: null,
    to: null,
  };

  store.ws.onmessage = e => {
    const reader = new FileReader();

    reader.onload = e => {
      const res = JSON.parse(pako.ungzip(reader.result, { to: "string" }));

      if (res.ping) {
        store.ws.send(JSON.stringify({ pong: new Date().getTime() }));
      }

      if (res.rep) {
        let datas = [];
        for (let data of res.data) {
          datas.push({
            time: data.id * 1000,
            close: data.close,
            open: data.open,
            high: data.high,
            low: data.low,
            volume: data.amount
          });
        }

        store.onDataCallback(datas, {noData: !datas.length});
      }

      if (res.tick) {
        console.log(res);
        const data = res.tick;

        store.onRealTimeCallback({
          time: data.id * 1000,
          volume: data.amount,
          close: data.close,
          open: data.open,
          high: data.high,
          low: data.low,
        });
      }
    };

    reader.readAsArrayBuffer(e.data);
  };