const Websocket = require("ws");

const server = new Websocket.Server({ port: 9900 });

let wsocket; // Declare a variable to hold the WebSocket object

var balance = 0;
var playerId = "";
var increaseMoney = 0;
var gameCode = "";
var gameType = 2;
var roomId = 0;
var records = [[[0, 61, 73, 85, 87, 90, 91, 78, 71, 56, 40, 20, 12, 0, 0, 0, 12, 22, 35, 91], 91], [[91, 29, 52, 71, 91, 89, 86, 77, 55, 22, -0, -30, -47, -70, -71, -71, -55, -43, -12, -71], -71], [[-71, -37, -31, -27, -24, -22, -22, -27, -35, -44, -52, -59, -64, -68, -71, -70, -68, -61, -53, -22], -22], [[-22, -15, -15, -13, -13, -13, -13, -14, -15, -16, -17, -19, -20, -21, -21, -21, -21, -20, -19, -13], -13], [[-13, -33, -21, -17, -13, -13, -17, -21, -26, -34, -48, -55, -64, -69, -70, -70, -68, -57, -52, -70], -70], [[-70, -21, -17, -7, -4, -1, -1, -10, -17, -29, -44, -52, -61, -65, -67, -70, -67, -56, -49, -1], -1], [[-1, 27, 33, 38, 40, 40, 37, 36, 30, 25, 15, 12, 4, -0, 1, 1, 4, 6, 15, 40], 40], [[40, 9, 23, 37, 40, 40, 36, 29, 23, 9, -4, -21, -36, -44, -44, -39, -39, -25, -11, -44], -44], [[-44, -64, -52, -49, -47, -44, -44, -52, -57, -69, -78, -86, -92, -95, -100, -97, -97, -91, -80, -100], -100], [[-100, -79, -72, -69, -67, -68, -69, -70, -76, -79, -86, -92, -97, -97, -100, -99, -96, -94, -87, -67], -67]];
var round = 0; // 0 = reset, 1 = betting, 2 = start, 3 = game over
var roundDelayCount = [3, 10, 11, 5];
var roundCount = 0;
var currentTotalBetValue = [0, 0];
var currentPlayerBetValue = [0, 0];

var previousLastValue = -67;
var currentValue = [];


function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
}

function generateRandomInt(length) {
    const characters = '0123456789';
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
}

function loginRequest() {
    playerId = generateRandomString(8);
    balance = 200000;

    let response = {
        errCode: 0,
        errMsg: "success",
        vals: {},
    }

    response.vals = {
        type: 1,
        id: 1,
        data: {
            sessionId: generateRandomInt(10),
            errCode: 0,
            lobbyServerIp: "127.0.0.1",
            lobbyServerPort: 9900,
            playerId: playerId,
        }
    }

    return response;
}

function lobbyRequest() {

    let response = {
        errCode: 0,
        errMsg: "success",
        vals: {},
    }

    response.vals = {
        type: 3,
        id: 3,
        data: {
            gameId: generateRandomInt(6),
            errCode: 0,
            balance: balance,
            serverTime: Date.now(),
            currency: "CNY",
            walletType:2,
        }
    }
    return response;
}

function joinRoomRequest() {
    let response = {
        errCode: 0,
        errMsg: "success",
        vals: {},
    }

    betInfo = [{
        gameName: "Stock Market",
        minBet: 1,
        maxBet: 1024,
    }]

    currencyInfo = {
        currencyId: 1,
        currency: "CNY",
    }

    response.vals = {
        type: 100000,
        id: 3,
        data: {
            subType: 100005,
            subData: [{
                gameType: gameType,
                roomId: roomId,
                errCode: 0,
                balance: balance,
                betInfo: betInfo,
                currencyInfo: currencyInfo,
            }]
        }
    }

    return response;
}

function transferRequest() {
    let response = {
        errCode: 0,
        errMsg: "success",
        vals: {},
    }

    response.vals = {
        type: 100000,
        id: 3,
        data: {
            subType: 100069,
            subData: [{
                errCode: 0,
                balance: balance,
                increaseMoney: increaseMoney,
            }]
        }
    }

    increaseMoney = 0;
    return response;
}

function recordRequest() {
    let response = {
        errCode: 0,
        errMsg: "success",
        vals: {},
    }

    response.vals = {
        type: 100000,
        id: 3,
        data: {
            subType: 100071,
            subData: [{
                errCode: 0,
                opCode: "GetRecords",
                recordsInfo: records,
            }]
        }
    }

    return response;
}

function roomInfoRequest() {
    let response = {
        errCode: 0,
        errMsg: "success",
        vals: {},
    }

    roomInfo = {
        minBet: 1,
        maxBet: 1024,
        recordList: records,
    }

    response.vals = {
        type: 100000,
        id: 3,
        data: {
            subType: 100071,
            subData: [{
                errCode: 0,
                opCode: "SyncRoomInfo",
                roomInfo: roomInfo,
            }]
        }
    }

    return response;
}

function roomListRequest() {
    let response = {
        errCode: 0,
        errMsg: "success",
        vals: {},
    }

    let date = Date.now();
    date += 60 * 60 * 1000;
    response.vals = {
        type: 100000,
        id: 3,
        data: {
            gameType: gameType,
            roomIndex: roomId,
            isOccupied: true,
            reserveExpiredTime : date,
        }
    }

    return response;
}

function setBetRequest(bet) {
    // validate bet
    if (bet[0] != 0 && currentPlayerBetValue[1] == 0 || bet[1] != 0 && currentPlayerBetValue[0] == 0) {
        currentPlayerBetValue[0] += bet[0];
        currentPlayerBetValue[1] += bet[1];
        currentTotalBetValue[0] += bet[0];
        currentTotalBetValue[1] += bet[1];
    }
    else {
        return;
    }
   
    gameCode = "#" + generateRandomString(6);
    balance -= bet[0];
    balance -= bet[1];

    let response = {
        errCode: 0,
        errMsg: "success",
        vals: {},
    }

    betInfo = {
        bet: currentPlayerBetValue,
        balance: balance,
    }
    response.vals = {
        type: 100000,
        id: 3,
        data: {
            subType: 100071,
            subData: [{
                errCode: 0,
                opCode: "SetBet",
                betInfo: betInfo,
            }]
        }
    }

    globalBetResponse();

    return response;
}

function globalBetResponse() {

    let response = {
        errCode: 0,
        errMsg: "success",
        vals: {},
    }

    betInfo = {
        bet: currentTotalBetValue,
    }
    response.vals = {
        type: 100000,
        id: 3,
        data: {
            subType: 100071,
            subData: [{
                errCode: 0,
                opCode: "GlobalBet",
                betInfo: betInfo,
            }]
        }
    }
    if (wsocket && wsocket.readyState === Websocket.OPEN) {
        wsocket.send(JSON.stringify(response));
    }
}

function resetResponse() {
    currentCrashValue = parseFloat(1.00);

    let response = {
        errCode: 0,
        errMsg: "success",
        vals: {},
    }

    response.vals = {
        type: 100000,
        id: 3,
        data: {
            subType: 100071,
            subData: [{
                errCode: 0,
                opCode: "Reset",
                roundCount: roundCount,
                maxRoundCount: roundDelayCount[0],
                records: records,
            }]
        }
    }

    return response;
}

function startBetResponse() {
    let response = {
        errCode: 0,
        errMsg: "success",
        vals: {},
    }

    response.vals = {
        type: 100000,
        id: 3,
        data: {
            subType: 100071,
            subData: [{
                errCode: 0,
                opCode: "StartBet",
                roundCount: roundCount,
                maxRoundCount: roundDelayCount[1],
            }]
        }
    }

    return response;
}

function resultResponse(value) {
    console.log("resultResponse", value);
    let response = {
        errCode: 0,
        errMsg: "success",
        vals: {},
    }

    response.vals = {
        type: 100000,
        id: 3,
        data: {
            subType: 100071,
            subData: [{
                errCode: 0,
                opCode: "Result",
                value: value,
            }]
        }
    }

    if (wsocket && wsocket.readyState === Websocket.OPEN) {
        wsocket.send(JSON.stringify(response));
    }
}

function calculateWinLose() {
    let totalBet = currentPlayerBetValue[0] + currentPlayerBetValue[1];
    let playerWinlose = 0;
    if (totalBet > 0) {
        if (previousLastValue > 0) { // positive
            if (currentPlayerBetValue[0] > 0) {
                playerWinlose = currentPlayerBetValue[0] + (currentPlayerBetValue[0] * (previousLastValue / 100));
            }
            else {
                playerWinlose = currentPlayerBetValue[1] - (currentPlayerBetValue[1] * (previousLastValue / 100));
            }
        }
        else {
            if (currentPlayerBetValue[1] > 0) {
                playerWinlose = currentPlayerBetValue[1] + (currentPlayerBetValue[1] * (-previousLastValue / 100));
            }
            else {
                playerWinlose = currentPlayerBetValue[0] - (currentPlayerBetValue[0] * (-previousLastValue / 100));
            }
        }
    }
    playerWinlose = Math.floor(playerWinlose);
    
    increaseMoney = playerWinlose;
    balance += playerWinlose;

    let response = {
        errCode: 0,
        errMsg: "success",
        vals: {},
    }

    betInfo = {
        cashOutValue: previousLastValue,
        awardMoney: playerWinlose,
    }
    response.vals = {
        type: 100000,
        id: 3,
        data: {
            subType: 100071,
            subData: [{
                errCode: 0,
                opCode: "CashOut",
                betInfo: betInfo,
            }]
        }
    }

    if (wsocket && wsocket.readyState === Websocket.OPEN) {
        wsocket.send(JSON.stringify(response));
    }
}

function gameOverResponse() {
    let response = {
        errCode: 0,
        errMsg: "success",
        vals: {},
    }

    response.vals = {
        type: 100000,
        id: 3,
        data: {
            subType: 100071,
            subData: [{
                errCode: 0,
                opCode: "GameOver",
                roundCount: roundCount,
                maxRoundCount: roundDelayCount[3],
                records: records,
                endValue: previousLastValue,
            }]
        }
    }

    return response;
}


// Define your custom function that you want to run independently
function commonIntervalInit() {
    // Keep the server running indefinitely
    setInterval(() => {
        roundCount += 1;
        if (roundCount > roundDelayCount[round]) {
            round += 1;
            roundCount = 1;
            // reset
            if (round > roundDelayCount.length - 1) {
                round = 0;
            }
        }

        // reset action
        if (round == 0) {
            if (roundCount == 1) {
                currentPlayerBetValue = [0, 0];
                currentTotalBetValue = [0, 0];
                let response = resetResponse();
                if (wsocket && wsocket.readyState === Websocket.OPEN) {
                    wsocket.send(JSON.stringify(response));
                }
            }
        }

        // start betting action
        if (round == 1) {
            if (roundCount == 1) {
                let response = startBetResponse();
                if (wsocket && wsocket.readyState === Websocket.OPEN) {
                    wsocket.send(JSON.stringify(response));
                }
            }
        }

        if (round == 2) {
            if (roundCount == 1) {
                let randomValue = generateRandomValue(-100, 100);
                while (randomValue == previousLastValue) {
                    randomValue = generateRandomValue(-100, 100);
                }
                generateSmoothValues(previousLastValue, randomValue, 20);
                callValues(500);
            }
        }

        // game over action
        if (round == 3) {

            if (roundCount == 1) {
                records.push([currentValue, previousLastValue]);
                if (records.length > 10) {
                    records.shift();
                }

                calculateWinLose();
                let response = gameOverResponse();
                if (wsocket && wsocket.readyState === Websocket.OPEN) {
                    wsocket.send(JSON.stringify(response));
                }
            }
        }
    }, 1000);
}

function generateSmoothValues(firstValue, lastValue, numValues) {
    currentValue = [];
    currentValue = [firstValue];
    const range = Math.abs(lastValue - firstValue) / 2;
    const midPoint = (lastValue + firstValue) / 2;
    const waveLength = numValues - 1;

    for (let i = 1; i < numValues - 1; i++) {
        const sineWave = Math.sin((i / waveLength) * Math.PI * 2); // Generate sine wave values
        const noise = (Math.random() - 0.5) * range * 0.2; // Add slight random noise
        let newValue = midPoint + sineWave * range + noise;
        // Ensure newValue is within the range of the minimum and maximum of firstValue and lastValue
        newValue = Math.max(Math.min(firstValue, lastValue), Math.min(newValue, Math.max(firstValue, lastValue)));
        // Round the newValue
        newValue = Math.ceil(newValue);
        currentValue.push(newValue);
    }

    currentValue.push(lastValue);
    previousLastValue = lastValue;
}

function callValues(interval) {
    let index = 0;
    const intervalId = setInterval(() => {

        //
        if (index <= currentValue.length - 1) {
            resultResponse(currentValue[index]);
        }

        if (index >= currentValue.length - 1) {
            clearInterval(intervalId);

            previousLastValue = currentValue[19];
            return;
        }
        index++;
    }, interval);
}

function generateRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function test() {
    for (let i = 0; i < 10; i++) {
        let randomValue = generateRandomValue(-100, 100);
        while (randomValue == previousLastValue) {
            randomValue = generateRandomValue(-100, 100);
        }
        generateSmoothValues(previousLastValue, generateRandomValue(-100, 100), 20);
    }
    
}

//test();

// Call your custom function independently
commonIntervalInit();

server.on("connection", (ws) => {
    wsocket = ws;

    // ws.send("4515ce54-c62a-43ed-964e-0f4d4dc402b3");

    ws.on("message", (message) => {
        const jsonContent = JSON.parse(message);

        // login request
        if (jsonContent.type == 0) {
            let response = loginRequest();
            ws.send(JSON.stringify(response));
        }

        // lobby request
        if (jsonContent.type == 2) {
            let response = lobbyRequest();
            ws.send(JSON.stringify(response));
        }

        // room list request
        if (jsonContent.type == 200017) {
            let response = roomListRequest();
            ws.send(JSON.stringify(response));
        }

        if (jsonContent.type == 100000) {
            // join Room request

            if (jsonContent.data[0].subType == 100004) {
                roomId = jsonContent.data[0].subData.roomId;
                let response = joinRoomRequest();
                ws.send(JSON.stringify(response));
            }

            // transfer info request
            if (jsonContent.data[0].subType == 100068) {
                let response = transferRequest();
                ws.send(JSON.stringify(response));
            }

            // custom request
            if (jsonContent.data[0].subType == 100070) {
                // get records request
                if (jsonContent.data[0].subData[0].opCode == "GetRecords") {
                    let response = recordRequest();
                    ws.send(JSON.stringify(response));
                }
                // sync room info request
                if (jsonContent.data[0].subData[0].opCode == "SyncRoomInfo") {
                    let response = roomInfoRequest();
                    ws.send(JSON.stringify(response));
                }
                // set bet request
                if (jsonContent.data[0].subData[0].opCode == "SetBet") {
                    let bet = jsonContent.data[0].subData[0].message.bet;
                    let response = setBetRequest(bet);
                    ws.send(JSON.stringify(response));
                }
            }
        }
    })
});