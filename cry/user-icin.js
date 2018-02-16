const hataBildir = require('./hataBildir.js')
class UserIcin {
    constructor (dataBasem) {
        this.dataBasem = dataBasem
    }

    async  GetUsers () {
        // this.sql = 'SELECT id, username, `key`, secret FROM users where `key` is not null and secret is not null'
        this.sql = 'SELECT id, username, `key`, secret FROM users where id=' + this.dataBasem.userId
        return await this.dataBasem.RunDbQuery(this.sql).catch(e => hataBildir(e, this.market))
    }

    async  GetUserMarketsFromDb (cryptopia, balances, userId) {
        this.cryptopia = cryptopia

        let guncelMarkets
        await this.cryptopia.GetMarkets('BTC').then(allMarkets => {
            guncelMarkets = allMarkets.Data
        }).catch(e => hataBildir(e))
        //uyanBtcGuncelMarketler = btcMarketler.Data.filter(e => e.Yuzde > 20 && e.Change > 0 && e.BaseVolume > 1)


        this.balances = balances
        this.sql = `SELECT * FROM marketler WHERE status='A' AND userId=${userId} order by 1 desc`
        let userMarkets = await this.dataBasem.RunDbQuery(this.sql).catch(e => hataBildir(e, this.market))

        // Bilgileri Doldur
        let yeniMarkets = []
        for (let userMarket of userMarkets) {
            /*
            if (userMarket.name == 'WRC/BTC') {
                console.log('Dur')
            }
            */
            userMarket.guncelMarket = guncelMarkets.find(e => e.Label == userMarket.name)
            userMarket.marketBalance = await this.GetAltcoinBalance(userMarket.name).catch(e => hataBildir(e, this.market))

            if (userMarket.marketBalance.Total != 0) { // balance varsa direk ekle ve bu market için döngüyü bitir aşağı girme.
                yeniMarkets.push(userMarket)
                continue
            }

            if (!userMarket.guncelMarket) { // Market kaldırılmışsa geç bunu
                continue
            }

            const highLowFarkKontrol = (userMarket.guncelMarket.High - userMarket.guncelMarket.Low) / userMarket.guncelMarket.Low * 100 >= 25
            // Diğer kontrollerin hepsine uyuyorsa ekle
            if (//userMarket.guncelMarket.Change > 0 && 
                userMarket.guncelMarket.BaseVolume >= 0.1
                && userMarket.guncelMarket.BidPrice > 0.00000020
                && userMarket.guncelMarket.AskPrice > 0.00000020
                //   && highLowFarkKontrol
            ) {
                yeniMarkets.push(userMarket)
                /*
               const guncelYuzde = await this.GetGuncelYuzde(userMarket.name, userMarket.yuzde).catch(e => hataBildir(e, this.market))
              
               if (guncelYuzde >= userMarket.yuzde) {  // Bunu özellikle buraya aldım. Çünkü ilk önce Change ve BaseVolume yi kontrol etsin uyarsa buna baksın.
                   userMarket.guncelYuzde = guncelYuzde
                   yeniMarkets.push(userMarket)
               }
               */
            }
        }

        yeniMarkets.sort(function (a, b) {
            return b.guncelMarket.BaseVolume - a.guncelMarket.BaseVolume
        })

        return yeniMarkets
    }

    async  GetGuncelYuzde (marketName, marketYuzde) {
        var guncelMarket = await this.cryptopia.GetMarket(marketName.replace('/', '_')).catch(e => hataBildir(e, marketName))
        if (!guncelMarket) {
            return await this.GetGuncelYuzde(marketName, marketYuzde).catch(e => hataBildir(e, marketName))
        }
        guncelMarket = guncelMarket.Data
        return Math.round((guncelMarket.AskPrice - guncelMarket.BidPrice) / guncelMarket.BidPrice * 100) >= marketYuzde
    }

    async  GetAltcoinBalance (marketName) {
        const anaBalanceName = marketName.split('/')[1]
        const altBalanceName = marketName.split('/')[0]
        //  this.market.anaCoinBalance = this.balances.find(e => e.Symbol == anaBalanceName)
        return this.balances.find(e => e.Symbol == altBalanceName) || { 'Total': '0', 'Available': '0' }
    }

    async  IslemSayisiniKaydet (userId, islemSayisi) {
        this.sql = `INSERT INTO Islemler(userId, islemSayisi) VALUES(${userId}, ${islemSayisi}) `
        await this.dataBasem.RunDbQuery(this.sql).catch(e => hataBildir(e, this.market))
    }
}

module.exports = UserIcin


