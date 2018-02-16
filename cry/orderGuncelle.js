const hataBildir = require('./hataBildir.js')
class OrderGuncelle {
    constructor (market, openOrders, dataBasem, orderHistory) {
        this.market = market
        this.openOrders = openOrders
        this.orderHistory = orderHistory
        this.lastDeactiveBuy = orderHistory && orderHistory.find(x => x.Type == 'Buy')
        this.lastDeactiveSell = orderHistory && orderHistory.find(x => x.Type == 'Sell')
        this.dataBasem = dataBasem
    }

    Basla () {
        this.openOrders && this.OrderRemainingGuncelle()

        // Aktif buy order yoksa veritababanındanda güncelle Deaktif et veritabanında aktifse
        this.lastDeactiveBuy && this.BuyOrderStatusGuncelle(this.market.name)

        // Aktif Sell order yoksa veritababanındanda güncelle Deaktif et veritabanında aktifse ve satış tutarını güncelle
        this.lastDeactiveSell && this.SellOrderStatusVeKarGuncelle(this.marketName)
    }

    OrderRemainingGuncelle () {
        for (let order of this.openOrders) {
            this.sql = `UPDATE Orders SET Remaining=${order.Remaining}, Status='A' where OrderId=${order.OrderId}`
            this.dataBasem.RunDbQuery(this.sql)
        }
    }

    BuyOrderStatusGuncelle () {
        this.sql = `UPDATE Orders SET Remaining=0, Status='D' where OrderId=${this.lastDeactiveBuy.TradeId} `
        this.dataBasem.RunDbQuery(this.sql)
    }

    async SellOrderStatusVeKarGuncelle () {
        this.sql = `select
            (select Total from Orders where OrderId=${this.lastDeactiveSell.TradeId})- 
            (select Total from Orders where OrderId=${this.lastDeactiveBuy.TradeId}) as kar
        from dual`
        const result = await this.dataBasem.RunDbQuery(this.sql).catch(e => hataBildir(e, this.market))
        const kar = result[0].kar || 0

        this.sql = `UPDATE Orders SET 
        Status='D',
        Kar=${kar},
        Remaining=0
        where OrderId=${this.lastDeactiveSell.TradeId};`
        this.dataBasem.RunDbQuery(this.sql)
        this.SatisYapildi(kar)//
        // Satış yapıldı.

    }

    async SatisYapildi (kar) {
        // console.log('Satış yapıldı Buraya bildirim gitmesi için kod yazılacak.')
        // console.log('Satış Yapıldı kar edildi!!! . KAR  Notepadden devam ettir Masaüstüne kayıtlı: ' + kar)
    }

}

module.exports = OrderGuncelle
