// Calibrated conversion: GPS (lat, lng) → position % on frame1 image
// Fit computed via least-squares regression on 14 reference points.

const IMG_SIZE = 1080

const CALIBRATION = [
  { lat:  49.25, lng: -123.10, px: 267, py: 360 }, // Vancouver
  { lat:  40.7128, lng: -74.0060, px: 382, py: 394 }, // New York (measured)
  { lat:  19.43, lng:  -99.13, px: 324, py: 458 }, // Mexico City
  { lat: -15.77, lng:  -47.93, px: 445, py: 545 }, // Brasilia
  { lat: -34.60, lng:  -58.40, px: 420, py: 597 }, // Buenos Aires
  { lat:  51.51, lng:   -0.13, px: 557, py: 353 }, // London
  { lat:  41.90, lng:   12.50, px: 587, py: 392 }, // Rome
  { lat:  30.06, lng:   31.25, px: 631, py: 427 }, // Cairo
  { lat:  55.75, lng:   37.62, px: 646, py: 326 }, // Moscow
  { lat:  19.08, lng:   72.88, px: 729, py: 459 }, // Mumbai
  { lat:  35.6762, lng: 139.6503, px: 888, py: 391 }, // Tokyo (measured)
  { lat: -33.87, lng:  151.21, px: 914, py: 595 }, // Sydney
  { lat: -33.90, lng:   18.40, px: 597, py: 597 }, // Cape Town (measured)
  { lat:  -1.30, lng:   36.82, px: 644, py: 509 }, // Nairobi
]

function mercatorY(lat) {
  const latRad = (lat * Math.PI) / 180
  return Math.log(Math.tan(Math.PI / 4 + latRad / 2))
}

function leastSquares(xs, ys) {
  const n = xs.length
  const sumX  = xs.reduce((a, b) => a + b, 0)
  const sumY  = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0)
  const sumX2 = xs.reduce((s, x) => s + x * x, 0)
  const a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const b = (sumY - a * sumX) / n
  return { a, b }
}

const pctLeft = CALIBRATION.map(p => (p.px / IMG_SIZE) * 100)
const pctTop  = CALIBRATION.map(p => (p.py / IMG_SIZE) * 100)
const lngs    = CALIBRATION.map(p => p.lng)
const mercYs  = CALIBRATION.map(p => mercatorY(p.lat))

const fitX = leastSquares(lngs,   pctLeft)
const fitY = leastSquares(mercYs, pctTop)

export function geoToPercent(lat, lng) {
  return {
    left: fitX.a * lng + fitX.b,
    top:  fitY.a * mercatorY(lat) + fitY.b,
  }
}

export function percentToGeo(left, top) {
  const lng = (left - fitX.b) / fitX.a
  const mercY = (top - fitY.b) / fitY.a
  const lat = (2 * Math.atan(Math.exp(mercY)) - Math.PI / 2) * (180 / Math.PI)
  return { lat, lng }
}
