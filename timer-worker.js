setInterval(() => {
    postMessage('tick'); // 每 50 毫秒通知一次主網頁
}, 50);