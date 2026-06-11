// Calibrated conversion: GPS (lat, lng) → position % on frame1 image
// Fit computed via least-squares regression on 5 measured reference points.

const IMG_SIZE = 1080

const CALIBRATION = [
  { lat:  49.3, lng: -123.1, px: 266, py: 358 }, // Vancouver
  { lat: -33.9, lng:   18.4, px: 597, py: 597 }, // Cape Town
  { lat:  35.6762, lng:  139.6503, px: 874, py: 388 }, // Tokyo
  { lat:  55.7, lng:   12.6, px: 592, py: 342 }, // Copenhagen
  { lat: -37.8, lng:  144.9, px: 897, py: 614 }, // Melbourne
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
