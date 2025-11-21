// List of major volatility indices
const indices = ['R_10', 'R_25', 'R_50', 'R_75', 'R_100'];

// Main container for all panels
const allPanels = document.getElementById('all-panels');

// Store last digits for each index
const lastDigitsMap = {};

// Store WebSocket connections
const wsMap = {};

// Create a panel and WebSocket for each index
indices.forEach(symbol => {
    // Create panel
    const panel = document.createElement('div');
    panel.className = 'panel sub-panel';
    panel.innerHTML = `
        <h2>${symbol}</h2>
        <div id="price-${symbol}">Current Price: -</div>
        <div id="freq-${symbol}">Digit Frequency:</div>
        <div id="pred-${symbol}">Prediction:</div>
    `;
    allPanels.appendChild(panel);

    // Initialize last digits array
    lastDigitsMap[symbol] = [];

    // Connect WebSocket
    const ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");

    ws.onopen = () => {
        ws.send(JSON.stringify({ ticks: symbol }));
    };

    ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.tick) {
            const price = data.tick.ask;
            document.getElementById(`price-${symbol}`).innerText = `Current Price: ${price}`;
            updateFrequency(symbol, price);
            updatePrediction(symbol);
        }
    };

    wsMap[symbol] = ws;
});

// Update digit frequency
function updateFrequency(symbol, price) {
    const lastDigit = price.toString().slice(-1);
    const arr = lastDigitsMap[symbol];
    arr.push(lastDigit);
    if (arr.length > 50) arr.shift();

    const counts = {};
    arr.forEach(d => counts[d] = (counts[d] || 0) + 1);

    let html = '';
    for (let i = 0; i <= 9; i++) {
        html += `Digit ${i}: ${counts[i] || 0}<br>`;
    }
    document.getElementById(`freq-${symbol}`).innerHTML = html;
}

// Update Matches prediction
function updatePrediction(symbol) {
    const arr = lastDigitsMap[symbol];
    if (!arr.length) return;

    const counts = {};
    arr.forEach(d => counts[d] = (counts[d] || 0) + 1);

    let minCount = Infinity, predictedDigit = '?';
    for (let i = 0; i <= 9; i++) {
        if ((counts[i] || 0) < minCount) {
            minCount = counts[i] || 0;
            predictedDigit = i;
        }
    }

    document.getElementById(`pred-${symbol}`).innerText = `Predicted next last digit (Matches): ${predictedDigit}`;
}
