'use strict'
const Cryptopia = require('../cryptopiam.js')
const UserIcin = require('./user-icin.js')
const DataBasem = require('../db.js')
const MarketIcin = require('./market.js')
const Kontroller = require('./kontroller.js')
const hataBildir = require('./hataBildir.js')
const rp = require('request-promise')
const Hapi = require('hapi')

let cryptopia, userIcin, marketIcin, dataBasem, kontroller
let _userId, totalBalances, availableBalances, anaIslemSayisi = 0, MarketThreadIslemSayisi, marketIslemler = [], processes = []
let timers = [], balances, balance, sayacim = 1, whileSayac = 1, marketIsimleri, sellPrices = []
const _accessToken = '8f03c10593f0abadef0b3084ba560826'

Basla()


async function Basla () {
	dataBasem = new DataBasem()
	userIcin = new UserIcin(dataBasem)
	const users = await userIcin.GetUsers().catch(e => hataBildir(e))
	_userId = users[0].id
	StartRestApi() // Port numarasını userId ye göre alıyor.
	cryptopia = new Cryptopia(users[0].key, users[0].secret)
	setInterval(() => sayacim++, 1000)
	while (true) {
		//const marketIslem = new MarketIcin(market, cryptopia, dataBasem)
		console.log('While Sayacı : => 	[ ' + whileSayac + ' ]')
		await Start().catch(e => hataBildir(e))
		RaporYazdir()
		whileSayac++
		await sleep(30)
	}
}

async function RaporYazdir () {
	marketIsimleri = ''
	Object.keys(marketIslemler).forEach(e => {
		if (marketIslemler[e]) marketIsimleri += '[' + e + '],'
	})
	console.log('Toplam ' + Object.keys(marketIslemler).length + ' Market için marketIşlem Aktif. Marketler => ' + marketIsimleri)
}

async function Start () {
	await BalanceDoldur().catch(e => hataBildir(e))
	const userMarkets = await userIcin.GetUserMarketsFromDb(cryptopia, totalBalances, _userId).catch(e => hataBildir(e))
	const bolunenSayi = sayiKacaBolunuyor(userMarkets.length)
	const chunkSayisi = userMarkets.length / bolunenSayi
	/*
	gelen marketlerin sayısıı 9 - 1 arası kaça bölünüyorsa bölüp, örneğin 15 5 e bölünüyor. 
	 userMarkets i 5 e bölüyoruz 3 lü gruplara ayırıyoruz. Amacımız burada 3 farklı loop çalıştırmak. 3 e böldüğümüz için daha hızlı işlem yapacak
	 Öbür türlü bir market te öğneğin sellde öne geçen olunca bunu farketmesi uzun sürüyor. Çünkü sıranın ona gelmesi uzun srüyor.
	 */
	let chunkUserMarkets = chunkArray(userMarkets, chunkSayisi)

	for (let i = 0; bolunenSayi > i; i++) {
		startChunk(chunkUserMarkets[i]).catch(e => {
			console.log(e)
		})
	}
}

async function startChunk (userMarkets) {
	for (let i = 0; i < userMarkets.length; i++) {
		//await sleep(1) // Toplu işlemlerde başlat. 
		const market = userMarkets[i]
		await MarketThreadKontrol(userMarkets, market, i + 1).catch(e => hataBildir(e))
	}
}

async function MarketThreadKontrol (userMarkets, market, marketSayac) {
	kontroller = new Kontroller(market, availableBalances, cryptopia, dataBasem, totalBalances)
	const sonuc = await kontroller.KontrolEUyuyorMu().catch(e => hataBildir(e))
	if (sonuc.altCoinBalanbceKontrol || sonuc.buyUsteAl || sonuc.sellUsteAl || sonuc.anaBalanceVeYuzdeKontrol) {
		MarketThreadBaslat(sonuc)
	} else if (timers[market.name]) {
		MarketThreadBitir(market.name)
	}
}

async function MarketThreadBaslat (sonuc) {
	if (timers[sonuc.market.name]) {
		return // Timer zaten var ise tekrar oluşturma
	}
	YeniMarketThread(sonuc.market)
}

async function MarketThreadBitir (market) {
	timers[market.name] = false
}

let marketBaslaIcinMusait = false
async function YeniMarketThread (market) {
	marketIslemler[market.name] = new MarketIcin(market, cryptopia, dataBasem)
	const marketSayisi = Object.keys(marketIslemler).length
	//await marketIslemler[market.name].BilgileriDoldur()
	console.log(market.name + ' İçin Market Başladı. Toplamda aktif ' + marketSayisi + ' Market var')
	timers[market.name] = true
	await sleep(3)
	while (timers[market.name]) { // Market içinde değerleri güncelledikten sonra while Düzgün Çalışacak.
		//Set balance
		await sleep(5)
		const altBalanceName = availableBalances.find(e => e.Symbol == market.name.split('/')[0]) || { 'Total': 0, 'Available': 0 }
		marketIslemler[market.name].balance = altBalanceName.Available
		marketIslemler[market.name].sellOrderPrices = sellPrices[market.name]
		marketIslemler[market.name].islemSayisi = 0
		await marketIslemler[market.name].Basla().then(async (is) => {
			anaIslemSayisi += is  // Islem sayısını burdan alıyoruz, bir sonraki işlem başladığında ona ekliyoruz. marketIslemler[market.name].islemSayisi = islemSayisi yazan yerde
			if (marketIslemler[market.name].marketiKapat) {
				timers[market.name] = false // Sell arkalarda kalsın diyorsan bu market whileden çıkacak, birdahaki yeni MarketThread de yeniden kontrol edilecek
			}

			if (marketIslemler[market.name].balanceRefreshle) {
				await BalanceDoldur().catch(e => hataBildir(e))
			}
		}).catch(e => {
			console.log(e)
		})

		await sleep(5)
	}
}

async function BalanceDoldur () {
	//await sleep(10)
	var allBalances = await cryptopia.GetBalance().catch(e => hataBildir(e))
	totalBalances = allBalances.Data.filter(e => e.Total > 0 && e.Status == 'OK')
	availableBalances = allBalances.Data.filter(e => e.Available > 0 && e.Status == 'OK')
	anaIslemSayisi++
	await BalanceHesapla() // BALANCES HESAPLAMA İÇİN SONRA AKTİF EDİLECEK
	dataBasem.UserMarketBalanceGuncelle(dataBasem.userId, totalBalances)

}


function sleep (saniye) {
	return new Promise(resolve => setTimeout(resolve, saniye * 1000))
}

async function BalanceHesapla () {
	let coinler = ''
	let balanceUrls = []
	//var ornekData = totalBalances.filter(e => e.Symbol == 'SPACE')
	totalBalances.forEach((e, idx, array) => {

		if (coinler.length > 200) {
			balanceUrls.push(coinler)
			coinler = ''
		}

		if (idx === array.length - 1) {  // Eğer son kayıt ise
			coinler += e.Symbol + '_BTC'
			balanceUrls.push(coinler)
			return false
		}

		coinler += e.Symbol + '_BTC-'

	})

	let altBtcToBTC = 0
	let marketName = ''
	for (let balanceUrl of balanceUrls) {
		await cryptopia.GetMarketOrderGroups(balanceUrl, 30).then(e => {
			e.Data.forEach(x => {
				let altCoinBalance = totalBalances.find(a => a.Symbol == x.Market.split('_')[0]) // DOGE_BTC to DOGE --> altcoinin balasını alacaz
				altCoinBalance = x.Sell[0].Price * altCoinBalance.Total
				altBtcToBTC += altCoinBalance
				marketName = x.Market.replace('_', '/')
				if (marketName == 'SPACE/BTC') {
					console.log('DUr')
				}

				sellPrices[marketName] = x.Sell.map(x => x.Price)  // marketIslemler[marketName] varsa son 5 sell priceleri doldur
			})
		}).catch(e => {
			hataBildir(e)
		})
	}

	let realBTCValue = totalBalances.find(a => a.Symbol == 'BTC') || { 'Total': 0, 'Available': 0 }
	realBTCValue = realBTCValue.Total + altBtcToBTC

	let result = await BtcToTryAndUsd()
	result = result[0]
	const tryBalance = realBTCValue * result.price_try
	const usdBalance = realBTCValue * result.price_usd

	console.log(`
	#############   BTC BALANCE : ${realBTCValue.toFixed(8)}
	#############   USD BALANCE : ${usdBalance.toFixed(2)}
	#############   TL  BALANCE : ${tryBalance.toFixed(2)}`)
}

function BtcToTryAndUsd () {
	let url = 'https://api.coinmarketcap.com/v1/ticker/bitcoin/?convert=TRY'
	const options = {
		method: 'GET',
		uri: url,
		json: true,
		gzip: true
	}
	return rp(options)
}

function OpenOrdersInit (data) {
	//thi.dataBasem.OpenOrdersInit(data)
	console.log('HAPİ OpenOrdersInit')
}

function StartRestApi () {
	const server = new Hapi.Server({ port: '3005' + _userId, host: 'localhost' })

	server.route({
		method: 'POST',
		path: '/save-open-orders',
		handler: (request, reply) => {
			handler: (request, reply) => {
				if (request.payload.accessToken == _accessToken) {
					OpenOrdersInit(request.payload.data)
				}
			}
		}
	})

	// Start the server
	server.start((err) => {
		if (err) {
			throw err
		}
		console.log('Server running at:', server.info.uri)
	})
}



// Bölünebilme
// sayı 10 dan büyükse
var sayi = 29

function sayiKacaBolunuyor (sayi) {
	for (let i = 10; i > 0; i--) {
		if (i == 1 || sayi < 10) {
			return sayi
		}
		if (sayi % i == 0) {
			return i
		}
	}
}

function chunkArray (myArray, chunk_size) {
	var index = 0, arrayLength = myArray.length
	var tempArray = [], myChunk = []

	for (index = 0; index < arrayLength; index += chunk_size) {
		myChunk = myArray.slice(index, index + chunk_size)
		tempArray.push(myChunk)
	}

	return tempArray
}