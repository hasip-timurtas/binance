module.exports = function hataBildir (err, market, functionName) {
    console.log(market)
    if (err.error) {
        console.log(err.error.Error)
    } else {
        console.log(err)
    }
}
