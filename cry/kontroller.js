
const hataBildir = require('./hataBildir.js')

class Kontroller {
    constructor (market, balances, cryptopia, dataBasem, totalBalances) {
        this.market = market
        this.balances = balances
        this.cryptopia = cryptopia
        this.dataBasem = dataBasem
        this.totalBalances = totalBalances
    }

    async BilgileriDoldur () {
        await this.SetGuncelMarket().catch(e => hataBildir(e, this.market))
        await this.SetBalances().catch(e => hataBildir(e, this.market))
        await this.SonBuyPriceKontrol().catch(e => hataBildir(e, this.market))
        await this.setBalanceSellIcinYeterli().catch(e => hataBildir(e, this.market))
        await this.SonSellPriceKontrol().catch(e => hataBildir(e, this.market))
       
    }

    async  KontrolEUyuyorMu () {
        await this.BilgileriDoldur().catch(e => hataBildir(e, this.market))

        let altCoinBalanbceKontrol = this.market.altCoinBalance.Available > 0 && this.balanceSellIcinYeterli && this.market
        this.market.BuyUsteAl = this.buyUsteAl || false
        this.market.SellUsteAl = this.sellUsteAl || false
        // let digerKontroller = this.market.anaCoinBalance.Available >= this.market.tutar && this.yuzdeUygunMu && this.baseVolumeUygunMu && this.changeUygunMu
        let anaBalanceVeYuzdeKontrol = this.market.anaCoinBalance.Available >= this.market.tutar && this.yuzdeUygunMu

        /*
        if (altCoinBalanbceKontrol || this.market.BuyUsteAl || anaBalanceKontrol) {/// 
            return this.market
        }
        */
        return { altCoinBalanbceKontrol, buyUsteAl: this.market.BuyUsteAl, sellUsteAl: this.market.SellUsteAl, anaBalanceVeYuzdeKontrol, market: this.market }
    }

    async  SetBalances () {
        const anaBalanceName = this.market.name.split('/')[1]
        const altBalanceName = this.market.name.split('/')[0]
        this.market.anaCoinBalance = this.balances.find(e => e.Symbol == anaBalanceName) || { 'Total': '0', 'Available': '0' }
        this.market.altCoinBalance = this.balances.find(e => e.Symbol == altBalanceName) || { 'Total': '0', 'Available': '0' }
    }

    async  SetGuncelMarket () {
        var guncelMarket = await this.cryptopia.GetMarket(this.market.name.replace('/', '_')).catch(e => hataBildir(e, this.market))
        if (!guncelMarket) {
            return await this.SetGuncelMarket().catch(e => hataBildir(e, this.market))
        }
        this.guncelMarket = guncelMarket.Data
        await this.SetGuncelYuzde().catch(e => hataBildir(e, this.market))
    }

    async AldiginFiyataYadaKarsizSatKontrol () {
        const karsizSatisYapilsinMi = this.market.karsizSat == 'A'
        const aldiginFiyataSatsinMi = this.market.aldiginFiyataSat == 'A'
        this.AldiginFiyataYadaKarsizSat = karsizSatisYapilsinMi || aldiginFiyataSatsinMi
    }

    async  SonBuyPriceKontrol () {
        var sonBuyPrice = await this.dataBasem.GetLastBuyPriceFromDb(this.market.name).catch(e => hataBildir(e, this.market))
        this.buyUsteAl = sonBuyPrice && this.guncelMarket.BidPrice != sonBuyPrice  // GüncelMarketteki buyPrice ile aktiforderdeki bidpricei karşılaştırıyor. market.js de tekrar karşılaştıracak ikinci kontrol için. 
    }

    async setBalanceSellIcinYeterli(){
        // this.balance * this.guncelMarket.AskPrice < 0.0005 // Girme
        const balance = this.totalBalances.find(e => e.Symbol == this.market.name.split('/')[0]) || { 'Total': 0, 'Available': 0 }
        const totalYeterli = balance.Total * this.guncelMarket.AskPrice > 0.0005 // Eğer total amountu 0.0005 btc den azsa sell yapmaz uyarı verir. Tabi bu sadece btc paraı için.!!

        this.balanceSellIcinYeterli = totalYeterli
    }

    async  SonSellPriceKontrol () {
        if(!this.balanceSellIcinYeterli){
            this.sellUsteAl=false
            return
        }

        var sonSellPrice = await this.dataBasem.GetLastSellPriceFromDb(this.market.name).catch(e => hataBildir(e, this.market))
        this.sellUsteAl = sonSellPrice && this.guncelMarket.AskPrice != sonSellPrice  // GüncelMarketteki buyPrice ile aktiforderdeki bidpricei karşılaştırıyor. market.js de tekrar karşılaştıracak ikinci kontrol için. 
    }

    async  SetGuncelYuzde () {
        const guncelYuzde = Math.round((this.guncelMarket.AskPrice - this.guncelMarket.BidPrice) / this.guncelMarket.BidPrice * 100)
        this.yuzdeUygunMu = guncelYuzde >= this.market.yuzde
        this.market.guncelYuzde = guncelYuzde
    }
}
module.exports = Kontroller


