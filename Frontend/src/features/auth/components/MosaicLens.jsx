import * as React from 'react'
import { useEffect, useRef } from 'react'
import {
  MAX_DPR,
  NAME,
  FIELD_SRC,
  FINISH_SRC,
  color,
  num,
  clampN,
  link,
  locations,
} from './mosaicShaders'

function fieldTarget(gl) {
  const fbo = gl.createFramebuffer()
  let tex = null
  let w = 0
  let h = 0
  let half = !!gl.getExtension('EXT_color_buffer_float')
  return {
    fbo,
    texture: () => tex,
    width: () => w,
    height: () => h,
    resize(nw, nh) {
      if (nw === w && nh === h && tex) return
      for (let attempt = 0; attempt < 2; attempt++) {
        if (tex) gl.deleteTexture(tex)
        tex = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texImage2D(gl.TEXTURE_2D, 0, half ? gl.RGBA16F : gl.RGBA8, nw, nh, 0, gl.RGBA, half ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
        const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        if (ok || !half) break
        half = false
      }
      w = nw
      h = nh
    },
    dispose() {
      if (tex) gl.deleteTexture(tex)
      gl.deleteFramebuffer(fbo)
    },
  }
}

function trackPointer(root) {
  const p = { tx: 0, ty: 0, inside: false, seen: false }
  const read = (e) => {
    const r = root.getBoundingClientRect()
    const sx = root.offsetWidth / (r.width || 1)
    const sy = root.offsetHeight / (r.height || 1)
    p.tx = (e.clientX - r.left) * sx
    p.ty = (e.clientY - r.top) * sy
    p.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
    p.seen = true
  }
  const out = (e) => {
    if (!e.relatedTarget) p.inside = false
  }
  window.addEventListener('pointermove', read, { passive: true })
  window.addEventListener('pointerdown', read, { passive: true })
  document.addEventListener('pointerout', out)
  return {
    p,
    dispose() {
      window.removeEventListener('pointermove', read)
      window.removeEventListener('pointerdown', read)
      document.removeEventListener('pointerout', out)
    },
  }
}

const DEFAULTS = {
  background: '#FEB2CD',
  color1: '#69E1FF',
  color2: '#FFE7A3',
}

function OriginkitBaseMosaicLens(props) {
  const {
    style,
    background = DEFAULTS.background,
    color1 = DEFAULTS.color1,
    color2 = DEFAULTS.color2,
    speed = 100,
    size = 153,
    angle = 0,
    tileSize = 10,
    hover = 88,
    reach = 279,
    width,
    height,
  } = props

  const rootRef = useRef(null)
  const canvasRef = useRef(null)

  const vRef = useRef({ background, color1, color2, speed: 1, size: 1, angle: 0, tile: 14, hover: 1, reach: 180 })
  vRef.current = {
    background,
    color1,
    color2,
    speed: clampN(num(speed, 50), 0, 100) / 50,
    size: clampN(num(size, 100), 50, 200) / 100,
    angle: (clampN(num(angle, 0), -180, 180) * Math.PI) / 180,
    tile: clampN(Math.round(num(tileSize, 14)), 6, 48),
    hover: clampN(num(hover, 100), 0, 200) / 100,
    reach: clampN(num(reach, 180), 10, 800),
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    if (!canvas || !root) return
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false })
    if (!gl) {
      console.error(`${NAME}: WebGL2 unavailable`)
      return
    }
    const field = link(gl, FIELD_SRC, 'field')
    const finish = link(gl, FINISH_SRC, 'finish')
    if (!field || !finish) return
    const uf = locations(gl, field, ['uRes', 'uTime', 'uC1', 'uC2', 'uSize', 'uAngle'])
    const un = locations(gl, finish, ['uField', 'uRes', 'uTime', 'uBg', 'uPaper', 'uMouse', 'uOn', 'uReach', 'uTile'])
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    const target = fieldTarget(gl)
    const pointer = trackPointer(root)
    const ptr = pointer.p

    let mx = 0
    let my = 0
    let on = 0
    let raf = 0
    let last = -1
    let clock = 0

    const render = (now) => {
      raf = requestAnimationFrame(render)
      const dt = last < 0 ? 0 : clampN((now - last) / 1000, 0, 0.05)
      last = now
      const v = vRef.current
      clock = (clock + dt * v.speed) % 3600

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const cw = canvas.clientWidth || 1200
      const ch = canvas.clientHeight || 800
      const bw = Math.max(1, Math.round(cw * dpr))
      const bh = Math.max(1, Math.round(ch * dpr))
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw
        canvas.height = bh
      }
      target.resize(Math.max(1, Math.round(bw / 2)), Math.max(1, Math.round(bh / 2)))

      const present = ptr.inside ? 1 : 0
      if (present && on < 0.02) {
        mx = ptr.tx
        my = ptr.ty
      }
      on += (present - on) * (1 - Math.exp(-dt * 5))
      const k = 1 - Math.exp(-dt * 16)
      mx += (ptr.tx - mx) * k
      my += (ptr.ty - my) * k

      const c1 = color(v.color1, DEFAULTS.color1)
      const c2 = color(v.color2, DEFAULTS.color2)
      const bg = color(v.background, DEFAULTS.background)
      const bgLum = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2]

      const sx = bw / cw
      const sy = bh / ch

      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
      gl.viewport(0, 0, target.width(), target.height())
      gl.useProgram(field)
      gl.uniform2f(uf.uRes, target.width(), target.height())
      gl.uniform1f(uf.uTime, clock)
      gl.uniform3f(uf.uC1, c1[0], c1[1], c1[2])
      gl.uniform3f(uf.uC2, c2[0], c2[1], c2[2])
      gl.uniform1f(uf.uSize, v.size)
      gl.uniform1f(uf.uAngle, v.angle)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, bw, bh)
      gl.useProgram(finish)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, target.texture())
      gl.uniform1i(un.uField, 0)
      gl.uniform2f(un.uRes, bw, bh)
      gl.uniform1f(un.uTime, clock)
      gl.uniform3f(un.uBg, bg[0], bg[1], bg[2])
      gl.uniform1f(un.uPaper, clampN((bgLum - 0.35) / 0.3, 0, 1))

      gl.uniform2f(un.uMouse, mx * sx, bh - my * sy)
      gl.uniform1f(un.uOn, on * v.hover)
      gl.uniform1f(un.uReach, v.reach * sy)
      gl.uniform1f(un.uTile, Math.max(1, Math.round(v.tile * dpr)))
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    raf = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(raf)
      pointer.dispose()
      target.dispose()
      gl.deleteVertexArray(vao)
      gl.deleteProgram(field)
      gl.deleteProgram(finish)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background,
        width: typeof width === 'number' && width > 0 ? width : '100%',
        height: typeof height === 'number' && height > 0 ? height : '100%',
        ...style,
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}

const defaultPresetProps = {
  background: '#FFD1E1',
  color1: '#8DE2F7',
  color2: '#FFE7A3',
}

export default function MosaicLens(props) {
  return <OriginkitBaseMosaicLens {...defaultPresetProps} {...props} />
}
