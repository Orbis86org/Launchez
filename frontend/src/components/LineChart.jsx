import React from 'react'
import ApexCharts from 'react-apexcharts';

function LineChart() {

  // Function to generate the last month's dates and identify Sundays
  const generateDates = () => {
    const today = new Date();
    const dates = [];
    const labels = [];
  
    // Start from 30 days ago (last month)
    today.setDate(today.getDate() - 30);
  
    // Loop to get all the dates for the past month
    for (let i = 0; i < 31; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      // Add the current date to the array
      dates.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      
      // If it's a Sunday, mark it for the label
      if (currentDate.getDay() === 0) {
        labels.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      } else {
        labels.push(''); // No label for non-Sunday dates
      }
    }
  
    return { dates, labels };
  };


  // Get the dates and labels for the last month
  const { dates, labels } = generateDates();
  console.log({ dates, labels });

  const series = [
    {
      name: "Sales",
      data: [10, 40, 70, 35, 60, 45, 30, 90, 120, 110, 130, 115, 90, 80, 100, 130, 140, 150, 160, 170, 120, 135, 90, 75, 80, 105, 110, 95, 90, 105, 130],  // More varied data points
    }
  ];

  // Chart options
  const options = {
    chart: {
      height: 350,
      type: 'line',
    },
    stroke: {
      curve: 'straight',
    },
    title: {
      text: 'Dummy Trade Chart',
      align: 'left',
      style: {
          color: '#FFFFFF' // Title color
      }
    },
    xaxis: {
      categories: dates,  // Set full dates from the `date` array
      hideOverlappingLabels: true,
      tickAmount: 4,
      tickPlacement: 'between',
      labels: {
        style: {
          colors: '#fff',  // Label text color
          fontSize: '12px',  // Font size
        },
        rotate: 0,
          rotateAlways: false,
          hideOverlappingLabels: true,
        formatter: (value) => {
          // Only show label if it's not empty in the `labels` array
          //if(labels.includes(value)){
            return value;
          //}
        },
      },
    },
    yaxis: {
      labels: {
        show: false,  // Hide the y-axis labels
      },
    },
    grid: {
      borderColor: 'transperant',
    },
  };

  return (
    <div>
      <ApexCharts options={options} series={series} type="line" height={350} />
    </div>
  )
}

export default LineChart
