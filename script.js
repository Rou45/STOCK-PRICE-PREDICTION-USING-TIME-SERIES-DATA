// Replace with your Alpha Vantage API key
const apiKey = '8QXVB1CHWMFK6P3E';

// Function to fetch stock data from Alpha Vantage API
async function fetchStockData() {
    const stockSymbol = document.getElementById('symbol').value || 'AAPL'; // Default to 'AAPL' if no symbol is entered
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Check if the API returned an error
        if (data["Error Message"]) {
            console.error("Error fetching stock data:", data["Error Message"]);
            alert("Error: Invalid stock symbol or API limit reached.");
            return;
        }

        // Extract time series data
        const timeSeries = data["Time Series (Daily)"];
        const labels = [];
        const prices = [];

        // Iterate over the data and get dates and closing prices
        for (const date in timeSeries) {
            labels.push(date);
            prices.push(parseFloat(timeSeries[date]["4. close"]));
        }

        // Reverse the arrays to have the oldest date first
        labels.reverse();
        prices.reverse();

        // Update the chart with the fetched data
        updateChart(labels, prices, stockSymbol);

        // Predict next day's stock price using linear regression
        const prediction = predictStockPrice(prices);
        document.getElementById("prediction-result").innerText = `Predicted Next Closing Price for ${stockSymbol}: $${prediction.toFixed(2)}`;

    } catch (error) {
        console.error("Failed to fetch stock data:", error);
    }
}

// Function to update the chart with new data
function updateChart(labels, data, stockSymbol) {
    const ctx = document.getElementById('stockChart').getContext('2d');

    // Destroy the previous chart instance if it exists to avoid duplication
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${stockSymbol} Stock Price (Close)`,
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            responsive: true,
        }
    });
}

// Simple linear regression for stock price prediction
function predictStockPrice(prices) {
    const n = prices.length;
    const sumX = n * (n + 1) / 2;
    const sumY = prices.reduce((a, b) => a + b, 0);
    const sumXY = prices.reduce((sum, price, index) => sum + (index + 1) * price, 0);
    const sumX2 = n * (n + 1) * (2 * n + 1) / 6;

    // Calculate slope (m) and intercept (b) of the line y = mx + b
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    // Predict the next price (for x = n+1, which is the next day)
    const nextPrice = m * (n + 1) + b;
    return nextPrice;
}

// Call the function to fetch stock data for the default symbol on page load
fetchStockData();
