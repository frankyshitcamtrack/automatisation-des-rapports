const { createCanvas } = require('canvas');
const { Title } = require('chart.js');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Fonction pour créer un graphique
async function createChart(label, labels, data) {
  const width = 500; // largeur du graphique
  const height = 500; // hauteur du graphique
  const formatLabels = labels.map((item) => item.slice(0, 9) + '...');
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    chartCallback: (ChartJS) => {},
    backgroundColour: 'rgb(92, 155, 213)',
  });

  const configuration = {
    type: 'bar',
    data: {
      labels: formatLabels,
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: 'rgba(0, 0, 255, 1)',
          borderColor: 'rgba(0, 0, 255, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          color: 'white',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        label: {
          color: 'white',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'white',
            font: {
              size: 14,
              weight: 'bold',
            }, // Y-axis label font color
          },
        },
        x: {
          ticks: {
            color: 'white', // X-axis label font color
            font: {
              size: 14,
              weight: 'bold',
            },
          },
        },
      },
    },
  };

  // Générer l'image du graphique
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  return image;
}

// Fonction pour créer un graphique
async function createChartKPDC(label, labels, data) {
  const width = 500; // largeur du graphique
  const height = 500; // hauteur du graphique
  const formatLabels = labels.map((item) => item.slice(0, 9) + '...');
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    chartCallback: (ChartJS) => {},
  });

  const configuration = {
    type: 'bar',
    data: {
      labels: formatLabels,
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: 'rgb(203, 49, 16 )',
          borderColor: 'rgb(203, 49, 16 )',
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          color: 'black',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        label: {
          color: 'black',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'black',
            font: {
              size: 14,
              weight: 'bold',
            }, // Y-axis label font color
          },
        },
        x: {
          ticks: {
            color: 'black', // X-axis label font color
            font: {
              size: 14,
              weight: 'bold',
            },
          },
        },
      },
    },
  };

  // Générer l'image du graphique
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  return image;
}

// Fonction pour créer un graphique
async function createChartDureeKPDC(label, labels, data) {
  const width = 700; // largeur du graphique
  const height = 500; // hauteur du graphique
  const formatLabels = labels.map((item) => item.slice(0, 9) + '...');
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    chartCallback: (ChartJS) => {},
  });

  const configuration = {
    type: 'bar',
    data: {
      labels: formatLabels,
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: 'rgb(59, 38, 33 )',
          borderColor: 'rgb(59, 38, 33 )',
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          color: 'white',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        label: {
          color: 'white',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'black',
            font: {
              size: 14,
              weight: 'white',
            }, // Y-axis label font color
          },
        },
        x: {
          beginAtZero: true,
          ticks: {
            color: 'black', // X-axis label font color
            font: {
              size: 14,
              weight: 'bold',
            },
          },
        },
      },
    },
  };

  // Générer l'image du graphique
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  return image;
}

module.exports = { createChart, createChartKPDC, createChartDureeKPDC };
