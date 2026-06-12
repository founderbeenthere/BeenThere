import { supabase } from './supabase'

const BUCKET = 'photos'

async function compressImage(file, maxDim = 800, quality = 0.8) {
  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height)
    width  = Math.round(width  * ratio)
    height = Math.round(height * ratio)
  }
  const canvas = document.createElement('canvas')
  canvas.width  = width
  canvas.height = height
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
}

// NOTE: il bucket "photos" deve essere creato manualmente:
// Supabase Dashboard → Storage → New bucket → nome "photos" → spunta Public → Create
export async function uploadPhoto(file, userId) {
  if (!supabase) throw new Error('Supabase non configurato')
  const blob     = await compressImage(file)
  const filename = `${userId}/${Date.now()}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(filename, blob, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (error) {
    if (error.message?.includes('Bucket not found') || error.statusCode === 400) {
      throw new Error('Bucket "photos" non trovato. Crealo in Supabase Dashboard → Storage.')
    }
    throw error
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  return data.publicUrl
}
