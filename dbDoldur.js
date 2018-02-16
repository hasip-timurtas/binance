var mysql = require('mysql')
var axios = require('axios')

var connection = mysql.createConnection({
  host: '209.250.238.100',
  user: 'hasip',
  password: '15yb88dycf',
  database: 'cryptopia',
  dateStrings: true
})

connection.connect()
Basla()

function TabloBosalt () {
  return new Promise((resolve, reject) => {
    connection.query('TRUNCATE table ana_marketler', function (error, results, fields) {
      if (error) {
        rejec(error)
      } else {
        resolve(true)
      }
    })
  })
}


async function Basla () {
  var markets = await GetMarkets()
  var gelenMarket = null
  var newMarket
  var yuzde

  var ayikla = markets.filter((e) => {
    e.yuzde = Math.round(((e.AskPrice - e.BidPrice) / e.BidPrice * 100))
    return e.Volume > 0.0001 && e.BaseVolume > 0.0001 && e.BidPrice > 0.00000004 && e.AskPrice > 0.00000004
  })



  var matketler = []
  for (let market of ayikla) {
    newMarket = [
      market.TradePairId,
      market.Label,
      market.AskPrice.toFixed(8),
      market.BidPrice.toFixed(8),
      market.Volume.toFixed(8),
      market.Change.toFixed(2),
      market.BaseVolume.toFixed(8),
      market.yuzde.toString()
    ]

    matketler.push(newMarket)
  }

  console.log('#     ##### BİTTİ ######    #')

  await TabloBosalt().then(sonuc => {
    if (sonuc) {
      console.log('Sonuc :' + sonuc)
      console.log('Veritabanı silme başarılı.')
    } else {
      console.log('Sonuc :' + sonuc)
      console.log('Veritabanı silme BAŞARISIZ.')
    }
  })

  await YeniMarketleriDByeEkle(matketler).then(sonuc => {
    if (sonuc) {
      console.log('Sonuc :' + sonuc)
      console.log('Veritabanı yenileme başarılı.')
    } else {
      console.log('Sonuc :' + sonuc)
      console.log('Veritabanı yenileme BAŞARISIZ.')
    }
  })


}



async function GetMarkets () {
  var getMarketsUrl = 'https://www.cryptopia.co.nz/api/GetMarkets'
  var resultMar = await axios(getMarketsUrl)
  return resultMar.data.Data
}


function YeniMarketleriDByeEkle (marketler) {
  var sql = 'INSERT INTO ana_marketler (`TradePairId`, `Label`, `AskPrice`, `BidPrice`, `Volume`, `Change`, `BaseVolume`, `Yuzde`) VALUES ?'
  return new Promise((resolve, reject) => {
    connection.query(sql, [marketler], function (error, results, fields) {
      if (error) {
        reject(error)
      } else {
        resolve(true)
      }
    })
  })
}
