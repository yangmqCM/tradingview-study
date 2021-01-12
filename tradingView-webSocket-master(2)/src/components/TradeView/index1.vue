<template>
  <div id="trade-view">
  </div>
</template>

<script>
import { widget as TvWidget } from '../../../static/tradeview/charting_library12/charting_library.js'
import socket from './datafeeds/socket.js'
import datafeeds from './datafeeds/datafees.js'
export default {
  data() {
    return {
      widget: null,
      socket: new socket(),
      datafeeds: new datafeeds(this),
      symbol: null,
      interval: null,
      cacheData: {},
      lastTime: null,
      getBarTimer: null,
      isLoading: true
    }
  },
  created() {
    this.socket.doOpen()
    this.socket.on('open', () => {
      this.socket.send({ cmd: 'req', args: [`candle.M5.btcusdt}`, 1440, parseInt(Date.now() / 1000)] })
    })
    this.socket.on('message', this.onMessage)
  },
  methods: {
    init(symbol = 'BTCUSDT', interval = 5) {
      if (!this.widget) {
        this.widget = new TvWidget({
          symbol: symbol,
          interval: interval, 
          container_id: 'trade-view',
          datafeed: this.datafeeds,
          // library_path: '/static/tradeview/charting_library/',
          // disabled_features: ['header_symbol_search'],
          // enabled_features: [],
          // timezone: 'Asia/Shanghai',
          // locale: 'zh',
          // debug: false, 
          // theme: "Dark",  
          	// debug: true, // uncomment this line to see Library errors and warnings in the console
					fullscreen: true,
					symbol: 'AAPL',
					interval: '1D',
					// container_id: "tv_chart_container",
					autosize: true,
					theme: "Dark",
					// toolbar_bg: '#000000',
					//	BEWARE: no trailing slash is expected in feed URL 
				 library_path: '/static/tradeview/charting_library12/',
					locale:"zh",

					disabled_features: ["use_localstorage_for_settings"],
					enabled_features: ["study_templates"],
					charts_storage_url: 'https://saveload.tradingview.com',
					charts_storage_api_version: "1.1",
					client_id: 'tradingview.com',
					user_id: 'public_user_id',
					// theme: getParameterByName('theme'),
        })
        this.symbol = symbol
        this.interval = interval
      }
    },
    sendMessage(data) {
      if (this.socket.checkOpen()) {
        this.socket.send(data)
      } else {
        this.socket.on('open', () => {
          this.socket.send(data)
        })
      }
    },
    unSubscribe(interval) {
      // if (interval < 60) {
      //   this.sendMessage({ cmd: 'unsub', args: [`candle.M${interval}.${this.symbol.toLowerCase()}`, 1440, parseInt(Date.now() / 1000)] })
      // } else if (interval >= 60) {
      //   this.sendMessage({ cmd: 'unsub', args: [`candle.H${interval / 60}.${this.symbol.toLowerCase()}`, 1440, parseInt(Date.now() / 1000)] })
      // } else {
      //   this.sendMessage({ cmd: 'unsub', args: [`candle.D1.${this.symbol.toLowerCase()}`, 207, parseInt(Date.now() / 1000)] })
      // }

    },
    subscribe() {
      // if (this.interval < 60) {
      //   this.sendMessage({ cmd: 'sub', args: [`candle.M${this.interval}.${this.symbol.toLowerCase()}`] })
      // } else if (this.interval >= 60) {
      //   this.sendMessage({ cmd: 'sub', args: [`candle.H${this.interval / 60}.${this.symbol.toLowerCase()}`] })
      // } else {
      //   this.sendMessage({ cmd: 'sub', args: [`candle.D1.${this.symbol.toLowerCase()}`] })
      // } 
        this.sendMessage(JSON.stringify({
            "sub": `market.${this.symbol}.depth.step0`,
            "id": `${this.symbol}`
        }));
        this.sendMessage(JSON.stringify({
            "sub": `market.${this.symbol}.kline.1min`,
            "id": `${this.symbol}`
        }));
    },
    onMessage(data) {    
      // if (data.data && data.data.length) {
      //   const list = []
      //   const ticker = `${this.symbol}-${this.interval}`
      //   data.data.forEach(function (element) {  
      //     list.push({ 
      //       time: this.interval !== 'D' || this.interval !== '1D' ? element.id * 1000 : element.id,
      //       open: element.open,
      //       high: element.high,
      //       low: element.low,
      //       close: element.close,
      //       volume: element.vol
      //     })
      //   }, this)
      //   this.cacheData[ticker] = list
      //   this.lastTime = list[list.length - 1].time
      //   this.subscribe()
      // }
      // if (data.type && data.type.indexOf(this.symbol.toLowerCase()) !== -1) {
        // console.log(' >> sub:', data.type)
//         amount: 2.163626
// close: 39612.69
// count: 140
// high: 39612.69
// id: 1610281860
// low: 39570.64
// open: 39570.64
// vol: 85673.86439173
        this.datafeeds.barsUpdater.updateData()
        const ticker = `${this.symbol}-${this.interval}`
        const barsData = {
          time: data.id * 1000,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: data.vol
        }
        console.log(barsData)
        //if (barsData.time >= this.lastTime && this.cacheData[ticker] && this.cacheData[ticker].length) {
          this.cacheData[0][0] = barsData
        //}
      // }
    },
    getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback) {
      // console.log(' >> :', rangeStartDate, rangeEndDate)
      if (this.interval !== resolution) {
        this.unSubscribe(this.interval)
        this.interval = resolution
        console.log(JSON.stringify({
            "sub": `market.${this.symbol}.depth.step0`,
            "id": `${this.symbol}`
        }))
        console.log(123)
                this.sendMessage(JSON.stringify({
            "sub": `market.${this.symbol}.depth.step0`,
            "id": `${this.symbol}`
        }));
        this.sendMessage(JSON.stringify({
            "sub": `market.${this.symbol}.kline.1min`,
            "id": `${this.symbol}`
        }));
        // if (resolution < 60) {
        //   this.sendMessage({ cmd: 'req', args: [`candle.M${this.interval}.${this.symbol.toLowerCase()}`, 1440, parseInt(Date.now() / 1000)] })
        // } else if (resolution >= 60) {
        //   this.sendMessage({ cmd: 'req', args: [`candle.H${this.interval / 60}.${this.symbol.toLowerCase()}`, 1440, parseInt(Date.now() / 1000)] })
        // } else {
        //   this.sendMessage({ cmd: 'req', args: [`candle.D1.${this.symbol.toLowerCase()}`, 800, parseInt(Date.now() / 1000)] })
        // }
      }
      const ticker = `${this.symbol}-${this.interval}`
      if (this.cacheData[ticker] && this.cacheData[ticker].length) {
        this.isLoading = false
        const newBars = []
        this.cacheData[ticker].forEach(item => {
          if (item.time >= rangeStartDate * 1000 && item.time <= rangeEndDate * 1000) {
            newBars.push(item)
          }
        })
        onLoadedCallback(newBars)
      } else {
        const self = this
        this.getBarTimer = setTimeout(function () {
          self.getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback)
        }, 10)
      }
    }
  }
}
</script>

