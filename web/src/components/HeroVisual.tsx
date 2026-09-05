import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion) return

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    )

    camera.position.z = 7

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const group = new THREE.Group()
    scene.add(group)

    // Main wireframe sphere
    const geometry = new THREE.IcosahedronGeometry(2, 5)

    const material = new THREE.MeshBasicMaterial({
      color: 0xd6a84f,
      wireframe: true,
      transparent: true,
      opacity: 0.24,
    })

    const mesh = new THREE.Mesh(geometry, material)
    group.add(mesh)

    // Orbit rings
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    })

    ;[1.4, 2.4, 3.1].forEach((radius, index) => {
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.007, 8, 180),
        ringMaterial,
      )

      torus.rotation.x = index * 0.6 + 0.4
      torus.rotation.y = index * 0.35

      group.add(torus)
    })

    // Particle field
    const pointsGeometry = new THREE.BufferGeometry()
    const points: number[] = []

    for (let i = 0; i < 850; i++) {
      const a = Math.random() * Math.PI * 2
      const b = Math.acos(2 * Math.random() - 1)
      const radius = 2.55 + Math.random() * 1.4

      points.push(
        radius * Math.sin(b) * Math.cos(a),
        radius * Math.sin(b) * Math.sin(a),
        radius * Math.cos(b),
      )
    }

    pointsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(points, 3),
    )

    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xe7cf9d,
      size: 0.018,
      transparent: true,
      opacity: 0.5,
    })

    const particleSystem = new THREE.Points(
      pointsGeometry,
      pointsMaterial,
    )

    group.add(particleSystem)

    // Pointer interaction
    let mouseX = 0
    let mouseY = 0

    const handlePointerMove = (event: PointerEvent) => {
      mouseX =
        (event.clientX / window.innerWidth - 0.5) * 0.35

      mouseY =
        (event.clientY / window.innerHeight - 0.5) * 0.22
    }

    window.addEventListener('pointermove', handlePointerMove)

    // Animation
    const clock = new THREE.Clock()
    let animationFrame = 0

    const animate = () => {
      const time = clock.getElapsedTime()

      group.rotation.y = time * 0.06 + mouseX
      group.rotation.x = time * 0.025 + mouseY

      mesh.rotation.z = time * 0.08

      renderer.render(scene, camera)

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    // Responsive resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()

      renderer.setSize(
        window.innerWidth,
        window.innerHeight,
      )
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrame)

      window.removeEventListener(
        'pointermove',
        handlePointerMove,
      )

      window.removeEventListener(
        'resize',
        handleResize,
      )

      geometry.dispose()
      material.dispose()

      ringMaterial.dispose()

      pointsGeometry.dispose()
      pointsMaterial.dispose()

      renderer.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} id="viz" />
}