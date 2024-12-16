import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";

const CandleStickChart = ({ tokenDetails }) => {
    const [series, setSeries] = useState([
        {
            name: "Token Price",
            data: [],
        },
    ]);

    // Chart configuration options
    const options = {
        chart: {
            type: "line",
            height: 400,
            animations: {
                enabled: true,
                easing: "linear",
                dynamicAnimation: {
                    speed: 1000,
                },
            },
            toolbar: {
                show: true,
            },
            zoom: {
                enabled: true,
            },
        },
        stroke: {
            curve: "smooth", // Smooth line
            width: 2,        // Line thickness
        },
        xaxis: {
            type: "datetime",
            title: {
                text: "Time",
                style: { fontSize: "14px" },
            },
            labels: {
                datetimeFormatter: {
                    year: "yyyy",
                    month: "MMM 'yy",
                    day: "dd MMM",
                    hour: "HH:mm",
                },
            },
        },
        yaxis: {
            title: {
                text: "Price (USD)",
                style: { fontSize: "14px" },
            },
            decimalsInFloat: 4, // Show up to 4 decimal places
        },
        tooltip: {
            x: {
                format: "dd MMM HH:mm", // Clearer date formatting
            },
            y: {
                formatter: (value) => `$${value.toFixed(4)}`, // USD format
            },
        },
        title: {
            text: `${ tokenDetails?.ticker}/USD Price Chart`,
            align: "left",
            style: {
                fontSize: "16px",
                fontWeight: "bold",
            },
        },
    };

    // Function to generate one month's simulated historical data
    const generateHistoricalData = () => {
        const data = [];
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(now.getDate() - 30);

        let currentTime = oneMonthAgo;
        let currentPrice = 0.0500; // Starting price in USD

        while (currentTime <= now) {
            // Simulate small random price fluctuations
            currentPrice += Math.random() * 0.005 - 0.0025; // Change between -0.0025 and +0.0025
            currentPrice = Math.max(0.030, Math.min(0.070, currentPrice)); // Clamp between 0.030 and 0.070

            data.push({
                x: new Date(currentTime),
                y: parseFloat(currentPrice.toFixed(4)),
            });

            currentTime.setHours(currentTime.getHours() + 6); // Increment by 6 hours
        }

        return data;
    };

    // Simulate fetching real-time price data
    const simulateRealTimeData = (lastPrice) => {
        let newPrice = lastPrice + Math.random() * 0.005 - 0.0025; // Change between -0.0025 and +0.0025
        newPrice = Math.max(0.030, Math.min(0.070, newPrice)); // Clamp between 0.030 and 0.070
        return {
            x: new Date(), // Current timestamp
            y: parseFloat(newPrice.toFixed(4)),
        };
    };

    // Initialize chart with simulated historical data
    useEffect(() => {
        const historicalData = generateHistoricalData();
        setSeries([{ name: "HBAR Price", data: historicalData }]);

        // Set up interval for live updates
        const interval = setInterval(() => {
            setSeries((prevSeries) => {
                const lastDataPoint = prevSeries[0].data[prevSeries[0].data.length - 1];
                const newDataPoint = simulateRealTimeData(lastDataPoint.y);

                return [
                    {
                        ...prevSeries[0],
                        data: [...prevSeries[0].data, newDataPoint].slice(-200), // Keep only the last 200 points
                    },
                ];
            });
        }, 1000); // Update every second

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <div>
            <ApexCharts options={options} series={series} type="line" height={400} />
        </div>
    );
};

export default CandleStickChart;
