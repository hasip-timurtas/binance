const OrderGuncelle = require('./orderGuncelle.js')
const hataBildir = require('./hataBildir.js')

class marketIcin {
    constructor (market, cryptopia, dataBasem) {
        this.cryptopia = cryptopia
        this.dataBasem = dataBasem
        this.market = market
        this.balance = market.altCoinBalance.Available
        this.totalBalance = market.altCoinBalance.Total
        this.islemSayisi = 0
        this.sellOrderPrices = null
    }

    async BilgileriDoldur () {
        await this.GetTradeHistory().catch(e => hataBildir(e, this.market))

    }

    async YuzdeKontrol () {
        await this.GetSingleMarket().catch(e => hataBildir(e, this.market))  // Yüzde uyuymluluğu için balance guncelMarket Burada dolduruluyor.
        await this.GetOpenOrders().catch(e => hataBildir(e, this.market))
        const yuzdesi = Math.round(((this.guncelMarket.AskPrice - 0.00000001) - this.guncelMarket.BidPrice + 0.00000001) / (this.guncelMarket.BidPrice + 0.00000001) * 100)
        const yuzdeFarki = yuzdesi >= this.market.yuzde
        if (!yuzdeFarki && this.totalOrderCount == 0 && this.balance == 0) { // Yüzde farkı küçükse ve Open Orders yoksa hiç girme.
            this.marketiKapat = true
            return true
        }

        return false
    }

    async  Basla () {
        const yuzdeDusuk = await this.YuzdeKontrol().catch(e => hataBildir(e, this.market))
        if (yuzdeDusuk) { // Yüzde Düşükse direk çık 
            return this.islemSayisi
        }

        await this.BilgileriDoldur().catch(e => hataBildir(e, this.market))
        const orderGuncelle = new OrderGuncelle(this.market, this.openOrders, this.dataBasem, this.orderHistory)
        await orderGuncelle.Basla()

        if (this.market.name == 'KDC/BTC') {
            console.log('dur')
        }

        if (this.balance > 0) { // 
            await this.DirekSellYap().catch(e => hataBildir(e, this.market))
        }

        this.aktifOrderVarMi && this.totalOrderCount == 1 && await this.AovTcSol().catch(e => hataBildir(e, this.market))
        this.aktifOrderVarMi && this.totalOrderCount == 2 && await this.AovTc().catch(e => hataBildir(e, this.market))
        if (!this.aktifOrderVarMi && (!this.lastOrder || this.lastOrder.Type == 'Sell')) await this.Buy().catch(e => hataBildir(e, this.market))
        //  if (!this.aktifOrderVarMi && this.lastOrder && (this.lastOrder.Type == 'Buy' || this.lastBuyOrder)) await this.Sell().catch(e => hataBildir(e, this.market))
        return this.islemSayisi
    }

    async DirekSellYap () {
        console.log('Balance var Sadece satış. Eğer başka sell varsa iptal edilip hep beraber sell yapılacak.')
        if (this.sellOrders && this.sellOrders.length > 0) {
            for (let mySellOrder of this.sellOrders) {
                //  if(mySellOrder.Amount-mySellOrder.Remaining)
                this.balance += mySellOrder.Remaining
            }
            await this.ButunOrderleriIptalEt(this.sellOrders).catch(e => hataBildir(e, this.market))
        }
        await this.Sell().catch(e => hataBildir(e, this.market))
    }

    async AovTcSol () { // Aktif order varmı? // 
        // this.sellOrders[0].Amount - this.sellOrders[0].Remaining > 0 && this.OrderRemainingGuncelle(this.sellOrders[0])
        await this.OneGecenVarmiKontrol().catch(e => hataBildir(e, this.market))
    }

    async AovTc () { // Aktif order var mı? // total count 0 dan bütük mü
        this.buyOrders.length == 2 && this.ButunOrderleriIptalEt(this.buyOrders)
        this.sellOrders.length == 2 && this.ButunOrderleriIptalEt(this.sellOrders)
        await this.OneGecenVarmiKontrol().catch(e => hataBildir(e, this.market))
        console.log('Remainingleri kontrol et!!!')
        //console.log('İki tane Buy yada 2 tane sell var bir hata var olmaz, ## BU İŞLEM ATLANIYOR')
    }


    async ButunOrderleriIptalEt (openOrders) {
        for (let myOrder of openOrders) {
            await this.CancelOrder(myOrder.OrderId).catch(e => hataBildir(e, this.market))
        }
    }

    async OneGecenVarmiKontrol () {
        if (this.totalOrderCount == 0) {
            return
        }

        for (let myOrder of this.openOrders) {
            const yuzdeFarki = Math.round(((this.guncelMarket.AskPrice - 0.00000001) - this.guncelMarket.BidPrice + 0.00000001) / (this.guncelMarket.BidPrice + 0.00000001) * 100)
            if (myOrder.Type == 'Buy' && (this.guncelMarket.BidPrice != myOrder.Rate || yuzdeFarki < this.market.yuzde)) {
                // return Math.round((guncelMarket.AskPrice - guncelMarket.BidPrice) / guncelMarket.BidPrice * 100) < marketYuzde
                // Buydaki En Üstteki ücret bizim ücretimiz değil biri öne geçmiş.
                console.log('Buy iptal ve tekrar kur.')
                await this.CancelOrder(myOrder.OrderId).catch(e => hataBildir(e, this.market))
                await this.sleep(10) // Buydan önce 10 saniye beklesinki  Get single data refreshlensin
                await this.Buy().catch(e => hataBildir(e, this.market))
                // this.marketiKapat = true
            }

            if (myOrder.Type == 'Sell' && this.guncelMarket.AskPrice != myOrder.Rate) {

                /*
                const ilkBesSirada = this.sellOrderPrices && this.sellOrderPrices.includes(myOrder.Rate)

                if (this.sellOrderPrices && !ilkBesSirada) { // Sell İlk 20 sırada değilse boz ve En Üste Koy
                    this.balance = myOrder.Amount   // Seli iptal etmeden önce son balansını alıyoruz. sell için lazım olacak.
                    this.CancelOrder(myOrder.OrderId).catch(e => hataBildir(e, this.market))
                    this.ucuncuSirayaKoy = true // 20. sıradan 5. sıraya koyuyor
                    await this.Sell().catch(e => hataBildir(e, this.market))
                    // this.marketiKapat = true
                    return
                }
                */
                var seliBoz = await this.SellIcinYuzdeFarkiUygunMu()
                if (!seliBoz) {
                    this.marketiKapat = true
                    return
                }
                // Sellde En Üstteki ücret bizim ücretimiz değil biri öne geçmiş. Zarar etmemesi için 
                console.log('Sell iptal ve tekrar kur.')
                this.balance = myOrder.Amount   // Seli iptal etmeden önce son balansını alıyoruz. sell için lazım olacak.
                await this.CancelOrder(myOrder.OrderId).catch(e => hataBildir(e, this.market))
                await this.sleep(10) // Buydan önce 10 saniye beklesinki  Get single data refreshlensin
                await this.Sell().catch(e => hataBildir(e, this.market))
                this.marketiKapat = true
            }
        }
    }

    async SellIcinYuzdeFarkiUygunMu () {

        if (this.lastBuyOrder == undefined || this.market.aldiginFiyataSat == 'A') {
            return false
        }
        var satacagiFiyat = parseFloat(this.guncelMarket.AskPrice) - 0.00000001
        var aldigiFiyat = this.lastBuyOrder.Rate

        const alimSatimYuzdeFarki = ((satacagiFiyat - aldigiFiyat) / aldigiFiyat * 100)
        return alimSatimYuzdeFarki > this.market.yuzde // Alım satım yüzde farkı istenenden büyük yada eşit değilse
    }

    async CancelOrder (orderId) {
        this.islemSayisi++
        const result = await this.cryptopia.CancelTrade('Trade', orderId).catch(e => hataBildir(e, this.market))
        if (!result.Success) return false
        const silinecekOrder = this.openOrders.find(e => e.OrderId == orderId)
        var index = this.openOrders.indexOf(silinecekOrder)
        this.openOrders.splice(index, 1)
        await this.OpenOrdersVeriableGuncelle().catch(e => hataBildir(e, this.market))
        await this.OrderSilDb(orderId).catch(e => hataBildir(e, this.market))
        return true
    }

    async  Buy () {
        const yuzdesi = Math.round(((this.guncelMarket.AskPrice - 0.00000001) - this.guncelMarket.BidPrice + 0.00000001) / (this.guncelMarket.BidPrice + 0.00000001) * 100)
        const yuzdeFarki = yuzdesi >= this.market.yuzde  // Yinede Kontrol Et

        if ((this.buyOrders && this.buyOrders.length > 0) || this.market.type == 'S' || !yuzdeFarki) {
            this.marketiKapat = true
            return
        }

        console.log(` Buy Kuruluyor ${this.market.name}: 
        Güncel Market AskPrice:  ${this.guncelMarket.AskPrice.toFixed(8)} 
        Güncel Market BirPrice:  ${this.guncelMarket.BidPrice.toFixed(8)}
        Fark: ${yuzdesi}`)

        let tutar

        if (this.guncelMarket.BaseVolume > 1 && yuzdesi >= 20) {
            tutar = this.market.tutar * 1.5
        } else if (this.guncelMarket.BaseVolume > 1) {
            tutar = this.market.tutar
        } else if (this.guncelMarket.BaseVolume > 0.5) {
            tutar = this.market.tutar / 2
        } else {
            tutar = this.market.tutar / 4
        }

        const rate = parseFloat(this.guncelMarket.BidPrice) + parseFloat('0.00000001')
        if (tutar / rate >= this.totalBalance) {
            console.log('Yeteri Kadar buy alındı şimdi satma zamanı')
            return
        }
        // openOrders.reduce((sum, current) => Number(sum.Total) + Number(current.Total))


        const orderParams = [this.market.name, null, 'Buy', rate, tutar / rate]
        const submitOrder = await this.cryptopia.SubmitTrade(...orderParams).catch(e => hataBildir(e, this.market))
        this.islemSayisi++
        if (!submitOrder.Error) {
            this.guncelMarket.BidPrice = rate // Yeni bid pricei bizimkiyle güncelliyorum, price güncellendi diye habire bozup kurmasın.
            this.market.OrderId = submitOrder.Data ? submitOrder.Data.OrderId : submitOrder.Data.FilledOrders[0]
            this.market.OrderId = this.market.OrderId || submitOrder.Data.FilledOrders[0]
            this.market.Rate = rate
            this.market.Amount = this.market.tutar / rate
            this.market.Total = this.market.Amount * rate
            this.market.Type = 'Buy'
            console.log(this.market.name + 'için BUY kuruldu. Buy OrderId: ' + this.market.OrderId)
            await this.OrderInsert().catch(e => hataBildir(e, this.market))
        } else {
            let userId = 0, errorType = 'Hata', functionName = 'this.marketIcin.Buy', error = submitOrder.Error
            console.log('Buy Kurarken Hata:' + submitOrder.Error + ' Market : ' + this.market.name)
            await this.dataBasem.AddError(userId, errorType, functionName, error).catch(e => hataBildir(e, this.market))
        }
    }

    async GetSellFiyati () {
        // Bu fonksiyon eğer alım satım arasında %10 ve üstü fark varsa true döndürür fark %10 dan düşürse aldıüı fiyata %10 ekler o ücreti  ve false döndürür.
        console.log('BuyFarkKontrolSellIcin')
        if (this.ucuncuSirayaKoy) return this.sellOrderPrices[9] // 10. sıranın ücretini gönderiyorum. Eğer benim sell 5. sırada değilse
        var satacagiFiyat = parseFloat(this.guncelMarket.AskPrice) - 0.00000001
        if (this.lastBuyOrder == undefined) return satacagiFiyat        // Veritabanında Buy yok o yüzden %10 fark varmış gibi gönder.
        if (this.market.karsizSat == 'A') return this.guncelMarket.AskPrice  // karsiz satmada en üstteki fiyata bırakıyor.
        var aldigiFiyat = this.lastBuyOrder.Rate
        if (this.market.aldiginFiyataSat == 'A') return aldigiFiyat
        var alimSatimYuzdeFarki = ((satacagiFiyat - aldigiFiyat) / aldigiFiyat * 100)
        if (alimSatimYuzdeFarki >= this.market.yuzde) return satacagiFiyat  //  alım satım fiyatı büyükeşitse ve en üstte değilse pazarı bozsun en üste geçsin
        // ÜSTTEKİLERİN HİÇBİRİ DEĞİLSE
        return aldigiFiyat + (aldigiFiyat / 100 * this.market.yuzde) // market yuzde dee ne varsa ekle sat
    }

    async  Sell () {
        if (this.market.type == 'B') return
        let rate = await this.GetSellFiyati().catch(e => hataBildir(e, this.market)) // RATEYİ BURDAN ALIYOR
        rate = Number(rate.toFixed(8))
        if (this.balance * rate < 0.0005) {
            // Balance 0.0005 BTC den düşük o yüzden pazara girmiyoruz ve bu pazarı kapatıyoruz.
            this.marketiKapat = true
            return
        }

        const orderParams = [this.market.name, null, 'Sell', rate, this.balance]
        const submitOrder = await this.cryptopia.SubmitTrade(...orderParams).catch(e => hataBildir(e, this.market))
        this.islemSayisi++
        if (!submitOrder.Error) {
            this.guncelMarket.AskPrice = rate
            this.market.OrderId = submitOrder.Data.OrderId ? submitOrder.Data.OrderId : submitOrder.Data.FilledOrders[0]
            this.market.Rate = rate
            this.market.Amount = this.balance
            this.market.Total = this.market.Amount * rate
            this.market.Type = 'Sell'
            console.log(this.market.name + ' SELL kuruldu. Sell OrderId: ' + this.market.OrderId)
            await this.OrderInsert().catch(e => hataBildir(e, this.market))

        } else {
            let userId = 0, errorType = 'Hata', functionName = 'this.marketIcin.Sell', error = submitOrder.Error
            await this.dataBasem.AddError(userId, errorType, functionName, error).catch(e => hataBildir(e, this.market))
            console.log('Sell Kurarken Hata:' + submitOrder.Error + ' Market : ' + this.market.name)
        }

        this.balance = 0
        this.karsizSat = false
        this.balanceRefreshle = true
    }

    async OrderInsert () {

        var yeniOpenOrder = {
            'OrderId': this.market.OrderId,
            'TradePairId': null,
            'Market': this.market.name,
            'Type': this.market.Type,
            'Rate': this.market.Rate,
            'Amount': this.market.Amount,
            'Total': this.market.Total,
            'Remaining': this.market.Amount // Yeni olduğu için remainingi amount.
        }

        this.openOrders.push(yeniOpenOrder)
        await this.OpenOrdersVeriableGuncelle().catch(e => hataBildir(e, this.market))

        this.sql = `INSERT INTO Orders(userId,OrderId,Label,Type,Price,Amount,Total,Remaining) 
        Values(${this.dataBasem.userId},${this.market.OrderId},'${this.market.name}','${this.market.Type}',${this.market.Rate},${this.market.Amount},${this.market.Total},${this.market.Amount});`
        await this.dataBasem.RunDbQuery(this.sql).catch(e => hataBildir(e, this.market))
    }

    async  GetSingleMarket () {
        this.guncelMarket = await this.cryptopia.GetMarket(this.market.name.replace('/', '_')).catch(e => hataBildir(e, this.market))
        if (!this.guncelMarket || !this.guncelMarket) {
            return await this.GetSingleMarket().catch(e => hataBildir(e, this.market))
        }
        this.guncelMarket = this.guncelMarket.Data
        this.guncelMarket.yuzde = Math.round(((this.guncelMarket.AskPrice - 0.00000001) - this.guncelMarket.BidPrice + 0.00000001) / (this.guncelMarket.BidPrice + 0.00000001) * 100)
    }

    async  OrderSilDb (orderId) {
        this.sql = `DELETE FROM Orders WHERE OrderId=${orderId}`
        const result = await this.dataBasem.RunDbQuery(this.sql).catch(e => hataBildir(e, this.market))
        return result[0]
    }

    async GetTradeHistory () {

        // await this.sleep(1)
        this.orderHistory = await this.cryptopia.GetTradeHistory(this.market.name).catch(e => hataBildir(e, this.market))
        this.islemSayisi++
        if (!this.orderHistory) {
            await this.sleep(10).catch(e => hataBildir(e, this.market))
            return await this.GetTradeHistory()

        } else {
            this.orderHistory = this.orderHistory.Data
            this.lastOrder = this.orderHistory && this.orderHistory[0]
            this.lastBuyOrder = this.orderHistory && this.orderHistory.find(e => e.Type == 'Buy')
        }
    }

    async GetOpenOrders () {
        this.openOrders = await this.cryptopia.GetOpenOrders(this.market.name, null, 2).catch(e => hataBildir(e, this.market))
        this.islemSayisi++ // GetOpenOrders için
        if (!this.openOrders) {
            await this.sleep(10).catch(e => hataBildir(e, this.market))
            return await this.GetOpenOrders()

        } else {

            this.openOrders = this.openOrders.Data
            await this.OpenOrdersVeriableGuncelle()
        }

    }

    async OpenOrdersVeriableGuncelle () {
        this.buyOrders = this.openOrders && this.openOrders.filter(e => e.Type == 'Buy')
        this.sellOrders = this.openOrders && this.openOrders.filter(e => e.Type == 'Sell')
        this.totalOrderCount = (this.openOrders && this.openOrders.length) || 0
        this.aktifOrderVarMi = this.openOrders && this.openOrders.length > 0 ? true : false
    }

    sleep (saniye) {
        return new Promise(resolve => setTimeout(resolve, saniye * 1000))
    }


    async GetLastBuyPriceFromDb (marketName) {
        // BU FONKSİYON GetTradeHistory boş döndürdüğü durumlarda kullanılacak.
        this.sql = `select Price from Orders where userId=${this.dataBasem.userId} and Type='Buy' and Status='A' and Label='${marketName}' order by 1 desc Limit 1`
        const result = await this.RunDbQuery(this.sql).catch(e => hataBildir(e))
        return result[0]
    }

}

module.exports = marketIcin