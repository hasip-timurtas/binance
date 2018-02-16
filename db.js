const mysql = require('mysql')
const hataBildir = require('./cry/hataBildir.js')
class DataBasem {
    constructor () {
        this.userId = 3
        this.sql = ''
        this.result = null
        this.connection = mysql.createConnection({ host: '209.250.238.100', user: 'hasip', password: '15yb88dycf', database: 'cryptopia', dateStrings: true, multipleStatements: true })
    }
    async RunDbQuery (sql) {
        this.sql = sql
        this.result = await this._Run().catch(e => hataBildir(e))
        return this.result
    }

    _Run () {
        return new Promise((resolve, reject) => {
            this.connection.query(this.sql, (error, results, fields) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
    }

    async AddError (userId, orderType, functionName, error) {
        this.sql = `INSERT INTO Error_Logs(UserId, Typem, FunctionName,Error) Values(${userId}, '${orderType}', '${functionName}', '${error}')`
        await this.RunDbQuery(this.sql).catch(e => hataBildir(e))
    }

    async UserMarketBalanceGuncelle (userId, balances) {
        var queries = ''
        balances.forEach(function (balance) {
            queries += mysql.format(`UPDATE marketler SET amount=${balance.Total} WHERE userId=${userId} and name like '${balance.Symbol}%';`)
        })

        const result = await this.YeniBalanslariDByeEkle(queries).catch(e => hataBildir(e))

    }

    YeniBalanslariDByeEkle (queries) {
        return new Promise((resolve, reject) => {
            this.connection.query(queries, function (error, results, fields) {
                if (error) {
                    reject(error)
                } else {
                    resolve(true)
                }
            })
        })
    }

    async  GetSingleMarket (marketName) {
        this.sql = `SELECT * FROM ana_marketler WHERE Label='${marketName}'`
        const result = await this.RunDbQuery(this.sql).catch(e => hataBildir(e))
        return result[0]
    }

    async GetLastBuyPriceFromDb (marketName) {
        this.sql = `select Price from Orders where userId=${this.userId} and Type='Buy' and Status='A' and Label='${marketName}' order by 1 desc Limit 1`
        const result = await this.RunDbQuery(this.sql).catch(e => hataBildir(e))
        return result[0]
    }

    async GetLastSellPriceFromDb (marketName) {
        this.sql = `select Price from Orders where userId=${this.userId} and Type='Sell' and Status='A' and Label='${marketName}' order by 1 desc Limit 1`
        const result = await this.RunDbQuery(this.sql).catch(e => hataBildir(e))
        return result[0]
    }

    async OpenOrdersInit (data) {
        data = data.filter(e => e.splice(0, 0, this.userId)) // Her datanın sıfırıncı kolonuna userId ekliyoruz
        await this.OpenOrdersTabloBosalt()
        this.OpenOrdersDByeEkle(data)
    }

    OpenOrdersTabloBosalt () {
        return new Promise((resolve, reject) => {
            connection.query('TRUNCATE table OpenOrders', function (error, results, fields) {
                if (error) {
                    rejec(error)
                } else {
                    resolve(true)
                }
            })
        })
    }

    OpenOrdersDByeEkle (openOrders) {
        var sql = 'INSERT INTO OpenOrders ( `userId`, `OrderId`, `Market`, `Type`, `Rate`, `Amount`, `Total`, `Remaining`, `Fee`, `Time`) VALUES ?'
        return new Promise((resolve, reject) => {
            connection.query(sql, [openOrders], function (error, results, fields) {
                if (error) {
                    reject(error)
                } else {
                    resolve(true)
                }
            })
        })
    }
}
module.exports = DataBasem


