import { execSync } from 'child_process'
import { writeFileSync, readFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

export function getAdbDevice() {
  try {
    const out = execSync('adb devices', { encoding: 'utf-8' })
    const lines = out.split('\n').filter(l => l.trim() && !l.startsWith('List of'))
    for (const l of lines) {
      const parts = l.trim().split(/\s+/)
      if (parts[1] === 'device') {
        const id = parts[0]
        let model = 'Android Device'
        try {
          model = execSync(`adb -s ${id} shell getprop ro.product.model`, { encoding: 'utf-8' }).trim()
        } catch {}
        return { id, model }
      }
    }
  } catch (e) {
    console.warn('[adb] ADB detection error:', e.message)
  }
  return null
}

export function dumpHierarchy(deviceId) {
  const tempXml = join(tmpdir(), `adb_dump_${Date.now()}.xml`)
  try {
    // Dump to sdcard then pull to local temp
    execSync(`adb -s ${deviceId} shell uiautomator dump /sdcard/window_dump.xml`, { timeout: 10000 })
    execSync(`adb -s ${deviceId} pull /sdcard/window_dump.xml "${tempXml}"`, { timeout: 10000 })
    const xml = readFileSync(tempXml, 'utf-8')
    try { unlinkSync(tempXml) } catch {}

    const nodes = []
    // Regex match node attributes
    const regex = /<node\s+([^>]+)\/?>/g
    let match
    while ((match = regex.exec(xml)) !== null) {
      const attrs = match[1]
      const textMatch = attrs.match(/text="([^"]*)"/)
      const descMatch = attrs.match(/content-desc="([^"]*)"/)
      const idMatch = attrs.match(/resource-id="([^"]*)"/)
      const boundsMatch = attrs.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/)

      if (boundsMatch) {
        const x1 = parseInt(boundsMatch[1], 10)
        const y1 = parseInt(boundsMatch[2], 10)
        const x2 = parseInt(boundsMatch[3], 10)
        const y2 = parseInt(boundsMatch[4], 10)
        const cx = Math.round((x1 + x2) / 2)
        const cy = Math.round((y1 + y2) / 2)

        const text = textMatch ? textMatch[1] : ''
        const desc = descMatch ? descMatch[1] : ''
        const resId = idMatch ? idMatch[1] : ''

        if (text || desc || resId) {
          nodes.push({ text, desc, resId, x1, y1, x2, y2, cx, cy })
        }
      }
    }
    return nodes
  } catch (e) {
    try { unlinkSync(tempXml) } catch {}
    console.warn(`[adb] Dump hierarchy failed: ${e.message}`)
    return []
  }
}

export function findNodeByText(nodes, targetText) {
  if (!targetText || !nodes.length) return null
  const lower = targetText.toLowerCase().trim()

  // 1. Exact match on text
  let found = nodes.find(n => n.text.toLowerCase().trim() === lower)
  if (found) return found

  // 2. Exact match on content-desc
  found = nodes.find(n => n.desc.toLowerCase().trim() === lower)
  if (found) return found

  // 3. Partial match
  found = nodes.find(n => n.text.toLowerCase().includes(lower) || n.desc.toLowerCase().includes(lower))
  return found || null
}

export function clickText(deviceId, targetText) {
  const nodes = dumpHierarchy(deviceId)
  const node = findNodeByText(nodes, targetText)
  if (!node) {
    return { success: false, error: `Elemen dengan teks "${targetText}" tidak ditemukan di layar` }
  }
  execSync(`adb -s ${deviceId} shell input tap ${node.cx} ${node.cy}`, { timeout: 5000 })
  return { success: true, x: node.cx, y: node.cy, matchedText: node.text || node.desc }
}

export function getPerformanceStats(deviceId, pkg = 'com.bukainjalan.app') {
  const stats = {
    memoryPssMb: 0,
    totalFrames: 0,
    jankyFrames: 0,
    jankPercent: 0,
  }

  // 1. Memory stats
  try {
    const memOut = execSync(`adb -s ${deviceId} shell dumpsys meminfo ${pkg}`, { encoding: 'utf-8', timeout: 8000 })
    const pssMatch = memOut.match(/TOTAL\s+PSS:\s+(\d+)/i) || memOut.match(/TOTAL\s+(\d+)/)
    if (pssMatch) {
      stats.memoryPssMb = Math.round(parseInt(pssMatch[1], 10) / 1024)
    }
  } catch {}

  // 2. Gfx stats (jank)
  try {
    const gfxOut = execSync(`adb -s ${deviceId} shell dumpsys gfxinfo ${pkg}`, { encoding: 'utf-8', timeout: 8000 })
    const totalMatch = gfxOut.match(/Total frames rendered:\s+(\d+)/)
    const jankyMatch = gfxOut.match(/Janky frames:\s+(\d+)\s+\(([\d.]+)%\)/)
    if (totalMatch) stats.totalFrames = parseInt(totalMatch[1], 10)
    if (jankyMatch) {
      stats.jankyFrames = parseInt(jankyMatch[1], 10)
      stats.jankPercent = parseFloat(jankyMatch[2])
    }
  } catch {}

  return stats
}
