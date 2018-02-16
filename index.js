const Cryptopia = require('./cryptopiam.js')


var key = 'aa903e0b70544955b414d33d987bfe2f'
var secret = '8i3GoHxNRvCMticaKj++sBt4H2BI1WLUtVX6UsY1Ycs='


const cryptopia = new Cryptopia(key, secret);
let son10DegerMaxYuzde;

async function Basla() {

  var pair = "DOGE";
  var yuzde = 20;
  var limit = 10;

  var markets = await cryptopia.GetMarketsForPairYuzde(pair, yuzde);

  var son10Deger = markets.slice(1, limit + 1)

  son10DegerMaxYuzde = son10Deger.sort(function (a, b) {
    return b.yuzde - a.yuzde
  })

  await Sell("ADC/DOGE");
  var marketName = son10DegerMaxYuzde[0].Label;
  var openOrders = await cryptopia.GetOpenOrders(marketName, count);
  console.log(openOrders);


  return;
  /*
    console.log(son10DegerMaxYuzde[4])
    console.log(son10DegerMaxYuzde[3])
    console.log(son10DegerMaxYuzde[2])
    console.log(son10DegerMaxYuzde[1])
  */

  console.log(son10DegerMaxYuzde[0])
  console.log("Market Sayısı : " + son10Deger.length);

  console.log("Doge varmı kontrol et");
  var balance = await cryptopia.GetBalance(pair)


  console.log("Balance: " + balance.Data[0].Available);
  if (parseFloat(balance.Data[0].Available) < 0) {
    console.log("Doge amount 1000 den küçük işlem iptal");
    return;
  }


  console.log("Market Name: " + marketName);
  var count = 10;

  console.log("Buy varmı kontrol et.");
  var openOrders = await cryptopia.GetOpenOrders(marketName, count);
  console.log(openOrders);
  if (!openOrders.Success) {  // Success false ise yeni bir buy aç
    console.log("Yeni bir buy aç");
    var type = "Buy"
    var rate = parseFloat(son10DegerMaxYuzde[0].BidPrice) + 00000001;
    var amount = 1000 / rate;
    var submitOrder = await cryptopia.SubmitTrade(marketName, null, type, rate, amount)
    if (!submitOrder.Error) {
      console.log(submitOrder.Data.OrderId);
    }

    console.log(submitOrder);
  } else {
    console.log("Zaten Buy Var");
  }

  console.log(openOrders);

}

Basla();


async function Sell(marketName) {
  //VPRC/DOGE

  var type = "Sell"
  var rate = parseFloat(son10DegerMaxYuzde[0].AskPrice) - 00000001;
  var amount = 1000 / rate;
  var submitOrder = await cryptopia.SubmitTrade(marketName, null, type, rate, amount)
  console.log(submitOrder);
  if (!submitOrder.Error) {
    console.log(submitOrder.Data.OrderId);
  }

}



function OrderLeriKontrolEt() {
  //oderid = 244970105
}
