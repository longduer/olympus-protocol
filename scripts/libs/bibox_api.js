let CryptoJS = require("crypto-js");
let request = require("request");

const prod_host = 'https://api.bibox.com';
const test_host = 'https://tapi.bibox.com';
var api_host = prod_host;
var api_key;
var api_secret;

let doPost = function (url, params) {

    return new Promise((resolve, reject) => {
        request.post({
            url: url,
            form: params
        }, function (error, response, body) {
            if (!error && response && response.statusCode === 200) {
                let result = JSON.parse(body);
                resolve(result);
            } else {
                reject(error);
            }
        });
    })
};

let doGet = function (url, callBack) {
    return new Promise((resolve, reject) => {
        request.get({
            url: url
        }, function (error, response, body) {
            if (!error && response && response.statusCode === 200) {
                let result = JSON.parse(body);
                resolve(result);
            } else {
                reject(error);
            }
        });
    })
};

let getSign = function (data) {
    var secret = api_secret;
    var sign = CryptoJS.HmacMD5(JSON.stringify(data), secret).toString();
    return sign;
};

let doApiRequestWithApikey = function (url, cmds, callBack) {

    let form = {
        cmds: JSON.stringify(cmds),
        apikey: api_key,
        sign: getSign(cmds)
    };
    return doPost(url, form);
};

let doApiRequest = function (url, cmds, callBack) {

    return new Promise(resolve => {

        let form = {
            cmds: JSON.stringify(cmds)
        };

        doPost(url, form, function (result) {
            resolve(result);
        });
    })
};

let getDepth = function (pair, size) {
    let _func_name_ = 'getDepth';

    //GET方式
    let get_url = 'https://api.bibox.com/v1/mdata?cmd=depth&pair=' + pair + '&size=' + size;
    doGet(get_url, function (res) {
        //TODO: 业务逻辑
        console.log('%s: GET请求结果：', _func_name_, JSON.stringify(res));
    });


    //POST方式
    let cmds = [{
        cmd: "api/depth",
        body: {
            pair: pair,
            size: size
        }
    }];
    let url = 'https://api.bibox.com/v1/mdata';
    doApiRequest(url, cmds, function (res) {
        //TODO: 业务逻辑
        console.log('%s: POST请求结果：', _func_name_, JSON.stringify(res));
    });
};


let getDeals = function (pair, size) {
    let _func_name_ = 'getDeals';

    let cmds = [{
        cmd: "api/deals",
        body: {
            pair: pair,
            size: size
        }
    }];
    let url = 'https://api.bibox.com/v1/mdata';
    doApiRequest(url, cmds, function (res) {
        //TODO: 业务逻辑
        console.log('%s: 请求结果：', _func_name_, JSON.stringify(res));
    });
};


let getKline = function (pair, period, size) {
    let _func_name_ = 'getKline';

    let cmds = [{
        cmd: "api/kline",
        body: {
            pair: pair,
            period: period,
            size: size
        }
    }];
    let url = 'https://api.bibox.com/v1/mdata';
    doApiRequest(url, cmds, function (res) {
        //TODO: 业务逻辑
        console.log('%s: 请求结果：', _func_name_, JSON.stringify(res));
    });
};

let getTicker = function (pair) {
    let _func_name_ = 'getTicker';

    let cmds = [{
        cmd: "api/ticker",
        body: {
            pair: pair
        }
    }];

    let url = 'https://api.bibox.com/v1/mdata';
    doApiRequest(url, cmds, function (res) {
        //TODO: 业务逻辑
        console.log('%s: 请求结果：', _func_name_, JSON.stringify(res));
    });
};

let getMarket = function (pair) {

    let cmds = [{
        cmd: "api/market",
        body: {
            pair: pair
        }
    }];

    let url = `${api_host}/v1/mdata`;
    return doApiRequest(url, cmds);
};

let getMarketAll = function () {

    let cmds = [{
        cmd: "api/marketAll",
        body: {}
    }];

    let url = `${api_host}/v1/mdata`;
    return doApiRequest(url, cmds, function (res) {
        //TODO: 业务逻辑
        console.log('%s: 请求结果：', _func_name_, JSON.stringify(res));
    });
};


let getUserOrderPending = function (pair, account_type, page, size) {
    let _func_name_ = 'getUserOrderPending';

    let cmds = [{
        cmd: "orderpending/orderPendingList",
        body: {
            pair: pair,
            account_type: account_type,
            page: page,
            size: size
        }
    }];

    let url = 'https://api.bibox.com/v1/orderpending';
    doApiRequestWithApikey(url, cmds, function (res) {
        //TODO: 业务逻辑
        console.log('%s: 请求结果：', _func_name_, JSON.stringify(res));
    });
};

let getUserOrderHistory = function (pair, account_type, page, size) {
    let _func_name_ = 'getUserOrderHistory';

    let cmds = [{
        cmd: "orderpending/orderHistoryList",
        body: {
            pair: pair,
            account_type: account_type,
            page: page,
            size: size
        }
    }];
    let url = 'https://api.bibox.com/v1/orderpending';
    doApiRequestWithApikey(url, cmds, function (res) {
        //TODO: 业务逻辑
        console.log('%s: 请求结果：', _func_name_, JSON.stringify(res));
    });
};

let doTrade = function (trade_order) {

    let cmds = [{
        cmd: "orderpending/trade",
        body: {
            pair: trade_order.pair,
            account_type: trade_order.account_type,
            order_type: trade_order.order_type,
            order_side: trade_order.order_side,
            pay_bix: trade_order.pay_bix,
            price: trade_order.price,
            amount: trade_order.amount,
            money: trade_order.money,
        }
    }];
    let url = 'https://api.bibox.com/v1/orderpending';

    return doApiRequestWithApikey(url, cmds);
};

let getOrder = function(id){

    let url = '';
    let cmds = {};
    return doApiRequestWithApikey(url, cmds);
}

let doCancelTrade = function (orders_id) {
    let _func_name_ = 'doCancelTrade';

    let cmds = [{
        cmd: "orderpending/cancelTrade",
        body: {
            orders_id: orders_id
        }
    }];
    let url = 'https://api.bibox.com/v1/orderpending';
    doApiRequestWithApikey(url, cmds, function (res) {
        //TODO: 业务逻辑
        console.log('%s: 请求结果：', _func_name_, JSON.stringify(res));
    });
};

let getUserAssets = function () {
    let cmds = [{
        cmd: "transfer/assets",
        body: {
            select: 1
        }
    }];
    let url = `${api_host}/v1/transfer`;
    return doApiRequestWithApikey(url, cmds);
};

let getCoinList = function(){

    let cmds = [{
        cmd: "transfer/coinList",
        body: { }
    }];
    let url = `${api_host}/v1/transfer`;
    return doApiRequestWithApikey(url, cmds);
}

// let doTest = function () {
//     //深度
//     getDepth('LTC_BTC', 10);
//     //成交历史
//     getDeals('LTC_BTC', 10);
//     //ticker
//     getTicker('LTC_BTC');
//     //市场行情
//     getMarket('LTC_BTC');
//     //市场行情，全币种
//     getMarketAll();
//     //k线
//     getKline('LTC_BTC', '1min', 10);


//     // 用户委托列表
//     getUserOrderPending('EOS_BTC', 0, 1, 10);
//     // 用户委托列表
//     getUserOrderHistory('BIX_BTC', 0, 1, 10);
//     // 用户普通资产
//     getUserAssets();

//     //用户下单
//     let trade_order = {
//         account_type: 0,
//         order_type: 2,
//         order_side: 1,
//         pair: 'BIX_BTC',
//         pay_bix: 0,
//         price: 0.00001688,
//         amount: 1,
//         money: 0.00001688
//     };
//     // doTrade(trade_order);

//     //用户撤单
//     // doCancelTrade(7790955);//orders_id
// };

// doTest();

const BIBOX = {
    config: function (_api_key, _api_secret) {
        api_key = _api_key;
        api_secret = _api_secret;
    },
    setTestMode: function (isTest) {
        api_host = isTest ? test_host : prod_host;
    },
    getMarketAll: getMarketAll,
    getMarket: getMarket,
    getUserAssets: getUserAssets,
    getCoinList: getCoinList,
    doTrade: doTrade,
    getOrder: getOrder
}

module.exports = BIBOX;

