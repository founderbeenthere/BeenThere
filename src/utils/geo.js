// GPS calibration for HERO_UPDATED_TRAVEL_WALL_CONCEPT_9_16 images (941×1672px)
// Target viewport: desktop 1440×900.
// Map area on image: x≈80–861px, y≈38–610px (wooden wall relief art).
// Mercator projection, longitude -170° to 190°, latitude -65°S to 75°N.
//
// Pixel positions measured/computed on the 941×1672 image.
// IMG_H = 941 × (900/1440) = 588 → effective height so that
//   pctTop = py/IMG_H × 100 places the pin correctly on a 1440×900 viewport.

const IMG_W = 941
const IMG_H = 588  // = IMG_W × (900/1440), targeting 1440×900 desktop

const CALIBRATION = [
  { lat:  49.25, lng: -123.10, px: 182, py: 207 }, // Vancouver
  { lat:  40.71, lng:  -74.01, px: 288, py: 241 }, // New York
  { lat:  19.43, lng:  -99.13, px: 234, py: 310 }, // Mexico City
  { lat: -15.77, lng:  -47.93, px: 345, py: 411 }, // Brasilia
  { lat: -34.60, lng:  -58.40, px: 322, py: 471 }, // Buenos Aires
  { lat:  51.51, lng:   -0.13, px: 448, py: 197 }, // London
  { lat:  41.90, lng:   12.50, px: 476, py: 235 }, // Rome
  { lat:  30.06, lng:   31.25, px: 516, py: 277 }, // Cairo
  { lat:  55.75, lng:   37.62, px: 530, py: 176 }, // Moscow
  { lat:  19.08, lng:   72.88, px: 607, py: 310 }, // Mumbai
  { lat:  35.68, lng:  139.65, px: 751, py: 257 }, // Tokyo
  { lat: -33.87, lng:  151.21, px: 776, py: 468 }, // Sydney
  { lat: -33.90, lng:   18.40, px: 489, py: 469 }, // Cape Town
  { lat:  -1.30, lng:   36.82, px: 528, py: 370 }, // Nairobi
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

const pctLeft = CALIBRATION.map(p => (p.px / IMG_W) * 100)
const pctTop  = CALIBRATION.map(p => (p.py / IMG_H) * 100)
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
