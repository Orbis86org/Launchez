import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

function TradingChart() {
  // Create a ref to the chart container
  const chartContainerRef = useRef(null);

  useEffect(() => {
    // Only run when the component is mounted
    if (chartContainerRef.current) {
      const chartOptions = {
        layout: { textColor: 'black', background: { type: 'solid', color: 'white' } },
      };
      const chart = createChart(chartContainerRef.current, chartOptions);

      const areaSeries = chart.addAreaSeries({
        lineColor: '#2962FF',
        topColor: '#2962FF',
        bottomColor: 'rgba(41, 98, 255, 0.28)',
      });

      areaSeries.setData([
        { time: new Date('2018-12-22').getTime() / 1000, value: 32.51 },
        { time: new Date('2018-12-23').getTime() / 1000, value: 31.11 },
        { time: new Date('2018-12-24').getTime() / 1000, value: 27.02 },
        { time: new Date('2018-12-25').getTime() / 1000, value: 27.32 },
        { time: new Date('2018-12-26').getTime() / 1000, value: 25.17 },
        { time: new Date('2018-12-27').getTime() / 1000, value: 28.89 },
        { time: new Date('2018-12-28').getTime() / 1000, value: 25.46 },
        { time: new Date('2018-12-29').getTime() / 1000, value: 23.92 },
        { time: new Date('2018-12-30').getTime() / 1000, value: 22.68 },
        { time: new Date('2018-12-31').getTime() / 1000, value: 22.67 },
      ]);

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      candlestickSeries.setData([
        { time: new Date('2018-12-22').getTime() / 1000, open: 75.16, high: 82.84, low: 36.16, close: 45.72 },
        { time: new Date('2018-12-23').getTime() / 1000, open: 45.12, high: 53.90, low: 45.12, close: 48.09 },
        { time: new Date('2018-12-24').getTime() / 1000, open: 60.71, high: 60.71, low: 53.39, close: 59.29 },
        { time: new Date('2018-12-25').getTime() / 1000, open: 68.26, high: 68.26, low: 59.04, close: 60.50 },
        { time: new Date('2018-12-26').getTime() / 1000, open: 67.71, high: 105.85, low: 66.67, close: 91.04 },
        { time: new Date('2018-12-27').getTime() / 1000, open: 91.04, high: 121.40, low: 82.70, close: 111.40 },
        { time: new Date('2018-12-28').getTime() / 1000, open: 111.51, high: 142.83, low: 103.34, close: 131.25 },
        { time: new Date('2018-12-29').getTime() / 1000, open: 131.33, high: 151.17, low: 77.68, close: 96.43 },
        { time: new Date('2018-12-30').getTime() / 1000, open: 106.33, high: 110.20, low: 90.39, close: 98.10 },
        { time: new Date('2018-12-31').getTime() / 1000, open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
      ]);

      // Fit content to the chart area
      chart.timeScale().fitContent();

      return () => {
        // Cleanup the chart when the component is unmounted
        chart.remove();
      };
    }
  }, []);

  return <div ref={chartContainerRef} style={{ position: 'relative', width: '100%', height: '500px' }}></div>;
}

export default TradingChart;
