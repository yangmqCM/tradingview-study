<template>
  <!-- <div id="trade-view"></div> -->
  <div id="chart-container-id"></div>
</template>

<script> 
import {
  widget,
  version,
} from "../charting_library.min.js";
// import socket from './datafeeds/socket.js'
import DataFeeds from "./datafeed";
import pako from "pako";

const toDouble = (time) => {
  if (String(time).length < 2) return "0" + time;
  return time;
};
console.log(version());

const store = {
  ws: new WebSocket("wss://api.huobiasia.vip/ws"),
  onDataCallback: null,
  onRealTimeCallback: null,
  to: null,
};

store.ws.onmessage = (e) => {
  const reader = new FileReader();
  reader.onload = (e) => {
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
          volume: data.amount,
        });
      }

      store.onDataCallback(datas, { noData: !datas.length });
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

export default {
  mounted() {
    const tv = new widget({
      debug: true,
      symbol: "btcusdt",
      timezone: "Asia/Shanghai",
      fullscreen: true,
      interval: "5",
      container_id: "chart-container-id",
      library_path: "/charting_library/",
      locale: "zh",
      autosize: true,
      datafeed: new DataFeeds(store),
      theme: "Dark",
      favorites: {
        intervals: ["1", "5", "15", "30", "60", "240", "1D"],
      },
      customFormatters: {
        timeFormatter: {
          format: (date) => {
            var _format_str = "%h:%m";
            return _format_str
              .replace("%h", toDouble(date.getUTCHours()), 2)
              .replace("%m", toDouble(date.getUTCMinutes()), 2)
              .replace("%s", date.getUTCSeconds(), 2);
          },
        },
        dateFormatter: {
          format: (date) => {
            return (
              date.getUTCFullYear() +
              "-" +
              toDouble(date.getUTCMonth() + 1) +
              "-" +
              toDouble(date.getUTCDate())
            );
          },
        },
      },
      disabled_features: [
        //禁用功能
        "header_symbol_search",
        "symbol_search_hot_key",
        "header_compare",
        "header_undo_redo",
        "header_screenshot",
        "volume_force_overlay",
      ],
      enabled_features: [
        //启用的功能
        "dont_show_boolean_study_arguments", //是否隐藏指标参数
        "hide_last_na_study_output", //隐藏最后一次指标输出
        "same_data_requery",
        "side_toolbar_in_fullscreen_mode",
        "adaptive_logo",
      ],
    });
    tv.onChartReady(() => {
      const chart = tv.chart();
      console.log(chart);
      // 出现均线在0刻度，注意数据类型为number
      const colors = ["#e0d283", "#92c580", "#8dc1d9"];
      [5, 10, 30].forEach((time, index) => {
        //1.15写法 1.14不同
        chart.createStudy("Moving Average", false, false, [time, "close", 0], {
          "Plot.linewidth": 2,
          "plot.color.0": colors[index],
          precision: 2,
        });
      });
    });
  },
};
</script> 
