const hataBildir = require('./hataBildir.js')
class Threadlar {
    constructor (market, cryptopia, dataBasem) {
        this.market = market
        this.cryptopia = cryptopia
        this.dataBasem = dataBasem
    }

    async  ThreadBaslat () {
        var ab123c = timers[this.market.name]
        if (timers[this.market.name]) {
            return // Timer zaten var ise tekrar oluşturma
        }
        marketIslemler[market.name] = new MarketIcin(market, cryptopia, dataBasem)
        //await marketIslemler[market.name].BilgileriDoldur()
        timers[market.name] = true
        await YeniThread(market).catch(e => hataBildir(e, this.market))
        console.log(market.name + ' için Thread Başladı!')
    }

    async  ThreadBitir (market) {
        if (timers[market.name]) {
            timers[market.name] = false
            console.log(market.name + ' için Thread Bitti. ')
        }

    }

    async  YeniThread (market) {
        //	while (timers[market.name]) { // Market içinde değerleri güncelledikten sonra while Düzgün Çalışacak.
        //const marketIslem = new MarketIcin(market, cryptopia, dataBasem)
        await marketIslemler[market.name].Basla().then(is => {
            islemSayisi += is
            marketIslemler[market.name].islemSayisi = 0
        }).catch(e => {
            console.log(e)
        })
        //	await sleep(2)
        //	}
    }
}

module.exports = Threadlar
