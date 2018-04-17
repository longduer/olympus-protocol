pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

interface IMarketOrderCallback {
   function MarketOrderStatusUpdated(uint orderId, uint status) external;
}

interface IExchangeProvider{
    function placeOrder(uint orderId, ERC20[] tokenAddresses, uint[] amount, uint[] rates, address deposit) external payable returns (bool);
    function canceOrder(uint orderId) external returns(bool);
    function getOrderStauts(uint orderId) external view returns(uint);
}

interface IExchangeAdapterManager {
    function pickExchange(ERC20 token, uint amount, uint rate) external view returns (bytes32 exchangeId);
    function checkTokenSupported(ERC20 token) external view returns(bool);
    function getExchangeAdapter(bytes32 exchangeId) external view returns(address);
}

interface IAdapterOrderCallback{
    function AdapterOrderStatusUpdated(address exchange, uint adapterOrderId) external returns(bool);
    function AdapterApproved(uint adapterOrderId) external;
}

interface IExchangeAdapter{

    // 成功返回Adapter自己定义的adapter's order id, 跟orderId无关
    function placeOrder(bytes32 exchangeId, ERC20 dest, uint amount, uint rate, address deposit) external payable returns(uint adapterOrderId);

    // 订单成功后付款
    function payOrder(uint adapterOrderId) external payable returns(bool);

    // 根据adapter order id, 取消订单
    function cancelOrder(uint adapterOrderId) external returns(bool);

    function getOrderStatus(uint adapterOrderId) external view returns(int);

    /// >0 : current exchange rate
    /// =0 : not support
    /// <0 : support but doesn't know rate
    function getRate(bytes32 exchangeId, ERC20 token, uint amount) external view returns (int);
    function isEnabled(bytes32 _id) external view returns (bool);

    function getExchange(bytes32 _id) external view returns(bytes32 name, uint status);

    function addExchange(bytes32 _id, bytes32 _name) external returns(bool);
}