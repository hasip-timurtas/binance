const Cryptopia = require('cryptopia.js')

var key = 'aa903e0b70544955b414d33d987bfe2f'
var secret = '8i3GoHxNRvCMticaKj++sBt4H2BI1WLUtVX6UsY1Ycs='

const cryptopia = new Cryptopia(key, secret)



async function Basla() {
  console.log(await (cryptopia.GetCurrencies()))
  console.log(await (cryptopia.GetTradePairs()))
  console.log(await (cryptopia.GetMarkets('USDT', 12)))
  console.log(await (cryptopia.GetMarket('DOT_BTC', 12)))
  console.log(await (cryptopia.GetMarketHistory('DOT_BTC', 48)))
  console.log(await (cryptopia.GetMarketOrders('DOT_BTC', 50)))
  console.log(await (cryptopia.GetMarketOrderGroups('DOT_BTC-DOT_LTC-DOT_DOGE-DOT_UNO', 50)))

  console.log(await (cryptopia.GetBalance()))
  console.log(await (cryptopia.GetDepositAddress('BTC')))
  console.log(await (cryptopia.GetOpenOrders('DOT/BTC', null, 100)))
  console.log(await (cryptopia.GetTradeHistory('DOT/BTC', null, 100)))
}

Basla();
