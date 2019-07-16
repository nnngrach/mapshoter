const express = require( 'express' )
const queue = require('express-queue')
const requestHandlerOverpass = require( './ScreenshotTools/RequestHandlerOverpass' )
const requestHandler = require( './ScreenshotTools/RequestHandler' )
const browserFabric = require( './ScreenshotTools/BrowserFabric' )

var isBrowserBusyForOverpass = { value: false}



const PORT = process.env.PORT || 5000
const app = express()


server = require('http').createServer(app),
server.maxConnections = 20

server.listen( PORT )
console.log( 'Listening on port ', PORT )

// app.listen( PORT, () => {
//   console.log( 'Listening on port ', PORT )
// })

const browserPromise = browserFabric.create()

app.use(queue({ activeLimit: 2, queuedLimit: -1 }))



app.get( '/', async ( req, res, next ) => {
  res.writeHead( 200, {'Content-Type': 'text/plain'})
  res.end( 'Puppeteer utility for AnyGIS' )
})


// Для перенаправления пользователя на одно из свободных зеркал
// app.get( '/:x/:y/:z', async ( req, res, next ) => {
//   const randomValue = randomInt( 1, 31 )
//   res.redirect(`https://mapshoter${randomValue}.herokuapp.com/overpass/${req.params.x}/${req.params.y}/${req.params.z}?script=${req.query.script}`)
//   })




// Для непосредственной загрузки тайла
app.get( '/:mode/:x/:y/:z/:minZ', async ( req, res, next ) => {

  const x = req.params.x
  const y = req.params.y
  const z = req.params.z
  const minZ = req.params.minZ
  const scriptName = req.query.script

  var moduleName, defaultUrl, maxZ

  if ( !isInt( x )) return next( error( 400, 'X must must be Intager' ))
  if ( !isInt( y )) return next( error( 400, 'Y must must be Intager' ))
  if ( !isInt( z )) return next( error( 400, 'Z must must be Intager' ))
  if ( !isInt( minZ )) return next( error( 400, 'MinimalZoom must must be Intager' ))
  if ( !scriptName ) return next( error( 400, 'No script paramerer' ) )


  // Выбираем режим обработки карты
  switch ( req.params.mode ) {

    // OverpassTurbo.eu
    case 'overpass':
      maxZ = 19
      moduleName = '../Modes/OverpassBasic'
      defaultUrl = `http://tile.openstreetmap.org/${z}/${x}/${y}.png`
      return requestHandler.makeRequest(x, y, z, minZ, maxZ, scriptName, moduleName, defaultUrl, res, browserPromise)
      break

    case 'overpass2':
      maxZ = 19
      moduleName = '../Modes/OverpassBasic2'
      defaultUrl = `http://tile.openstreetmap.org/${z}/${x}/${y}.png`
      return requestHandlerOverpass.makeRequest(x, y, z, minZ, maxZ, scriptName, moduleName, defaultUrl, res, browserPromise, isBrowserBusyForOverpass)
      break

    // Waze.com
    case 'waze':
      maxZ = 17
      moduleName = '../Modes/Waze'
      defaultUrl = `https://worldtiles1.waze.com/tiles/${z}/${x}/${y}.png`
      return requestHandler.makeRequest(x, y, z, minZ, maxZ, scriptName, moduleName, defaultUrl, res, browserPromise)
      break

    // Nakarte.me
    case 'nakarte':
      maxZ = 18
      moduleName = '../Modes/Nakarte'
      defaultUrl = `https://tile.opentopomap.org/${z}/${x}/${y}.png`
      return requestHandler.makeRequest(x, y, z, minZ, maxZ, scriptName, moduleName, defaultUrl, res, browserPromise)
      break

    default:
      return next( error( 400, 'Unknown mode value' ) )
  }
})





// Вспомогательные функции

function isInt( value ) {
  var x = parseFloat( value )
  return !isNaN( value ) && ( x | 0 ) === x
}


function error( status, msg ) {
  var err = new Error( msg )
  err.status = status
  return err
}


// async function wait(ms) {
//   return new Promise(resolve => {
//     setTimeout(resolve, ms);
//   });
// }
