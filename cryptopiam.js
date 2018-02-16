const rp = require('request-promise')
const crypto = require('crypto')
const nonce = require('nonce')()
const hataBildir = require('./cry/hataBildir.js')

class Cryptopia {
  constructor (key, secret) {
    this.key = key
    this.secret = secret
    this.API_URL = 'https://www.cryptopia.co.nz/api/'
  }

  _public (endpoint, parameters) {
    let httpParam = '/'
    for (let key in parameters) {
      if (parameters[key]) {
        httpParam += parameters[key] + '/'
      }
    }
    const options = {
      method: 'GET',
      uri: this.API_URL + endpoint + httpParam,
      json: true,
      gzip: true
    }

    return rp(options)
  }

  async GetCurrencies () {
    return this._public('GetCurrencies')
  }

  async GetTradePairs () {
    return this._public('GetTradePairs')
  }

  async GetMarkets (baseMarket, hours) {
    return this._public('GetMarkets', { baseMarket, hours })
  }

  async GetMarket (market, hours) {
    return this._public('GetMarket', { market, hours })
  }

  async GetMarketHistory (market, hours) {
    return this._public('GetMarketHistory', { market, hours })
  }

  async GetMarketOrders (market, orderCount) {
    return this._public('GetMarketOrders', { market, orderCount })
  }

  async GetMarketOrderGroups (markets, orderCount) {
    return this._public('GetMarketOrderGroups', { markets, orderCount })
  }

  async _private (endpoint, parameters) {
    const _nonce = nonce()
    const HASHED_POST_PARAMS = crypto.createHash('md5').update(JSON.stringify(parameters)).digest('base64')
    const requestSignature = this.key + 'POST' + encodeURIComponent(this.API_URL + endpoint).toLowerCase() + _nonce + HASHED_POST_PARAMS
    const hmacSignature = crypto.createHmac('sha256', Buffer.from(this.secret, 'base64')).update(requestSignature).digest('base64')
    const authorization = 'amx ' + this.key + ':' + hmacSignature + ':' + _nonce

    const options = {
      method: 'POST',
      uri: this.API_URL + endpoint,
      body: parameters,
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(JSON.stringify(parameters))
      },
      json: true,
      gzip: true
    }

    let result = null
    await rp(options).then(e => {
      result = e
    }).catch(e => {
      hataBildir(e, 'Hata GetTradeHistory()')
      result = 'Error'
    })

    if (result == 'Error') {
      await this.sleep(10)
    }

    return result
  }

  sleep (saniye) {
    return new Promise(resolve => setTimeout(resolve, saniye * 1000))
  }

  async GetBalance (Currency) {
    return await this._private('GetBalance', { Currency }).catch(e => hataBildir(e))
  }

  async GetDepositAddress (Currency) {
    return await this._private('GetDepositAddress', { Currency }).catch(e => hataBildir(e))
  }

  async GetOpenOrders (Market, TradePairId, Count) {
    return await this._private('GetOpenOrders', { Market, TradePairId, Count }).catch(e => hataBildir(e))
  }
  async GetTradeHistory (Market, TradePairId, Count) {
    return await this._private('GetTradeHistory', { Market, TradePairId, Count }).catch(e => hataBildir(e))
  }

  async GetTransactions (Type, Count) {
    return await this._private('GetTransactions', { Type, Count }).catch(e => hataBildir(e))
  }

  async SubmitTrade (Market, TradePairId, Type, Rate, Amount) {
    return await this._private('SubmitTrade', { Market, TradePairId, Type, Rate, Amount }).catch(e => hataBildir(e))
  }

  async CancelTrade (Type, OrderId, TradePairId) {
    return await this._private('CancelTrade', { Type, OrderId, TradePairId }).catch(e => hataBildir(e))
  }

  async SubmitTip (Currency, ActiveUsers, Amount) {
    return await this._private('SubmitTip', { Currency, ActiveUsers, Amount }).catch(e => hataBildir(e))
  }

  async SubmitWithdraw (Currency, Address, PaymentId, Amount) {
    return await this._private('SubmitWithdraw', { Currency, Address, PaymentId, Amount }).catch(e => hataBildir(e))
  }

  async SubmitTransfer (Currency, Username, Amount) {
    return await this._private('SubmitTransfer', { Currency, Username, Amount }).catch(e => hataBildir(e))
  }

  async GetMarketsForPairYuzde (Pair, Yuzde) {
    let markets = await this.GetMarkets(Pair)

    while (markets == null) {
      console.log('Market Null')
      markets = await this.GetMarkets(Pair)
    }

    let yuzdeBuyukOlanlar = markets.Data.filter(function (e) {
      e.yuzde = ((e.AskPrice - e.BidPrice) / e.BidPrice * 100)
      return ((e.AskPrice - e.BidPrice) / e.BidPrice * 100) >= Yuzde && e.BaseVolume > 0.0001 && e.BidPrice > 0.00000004 && e.AskPrice > 0.00000004
    })

    yuzdeBuyukOlanlar.sort(function (a, b) {
      return b.BaseVolume - a.BaseVolume
    })

    return yuzdeBuyukOlanlar
  }
}



module.exports = Cryptopia
