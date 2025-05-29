/**
 * Creates a mock THREE.js object when the real library fails to load
 */
export function createThreeMock() {
  if (typeof window === "undefined") return null

  console.log("Creating THREE.js mock object")

  return {
    Scene: () => ({
      add: () => {},
      children: [],
      background: null,
    }),
    PerspectiveCamera: () => ({
      position: { x: 0, y: 0, z: 0 },
      lookAt: () => {},
    }),
    WebGLRenderer: () => ({
      setSize: () => {},
      render: () => {},
      domElement: document.createElement("div"),
      setClearColor: () => {},
      setPixelRatio: () => {},
    }),
    BoxGeometry: () => ({}),
    SphereGeometry: () => ({}),
    PlaneGeometry: () => ({}),
    MeshBasicMaterial: () => ({ color: 0xffffff }),
    MeshStandardMaterial: () => ({ color: 0xffffff }),
    Mesh: () => ({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    }),
    Vector3: (x = 0, y = 0, z = 0) => ({ x, y, z, set: () => {}, copy: () => {} }),
    Clock: () => ({
      getElapsedTime: () => 0,
      getDelta: () => 0.016,
    }),
    Color: () => ({ r: 1, g: 1, b: 1 }),
    AmbientLight: () => ({}),
    DirectionalLight: () => ({
      position: { x: 0, y: 0, z: 0 },
      target: { position: { x: 0, y: 0, z: 0 } },
    }),
    PointLight: () => ({
      position: { x: 0, y: 0, z: 0 },
    }),
    Group: () => ({
      add: () => {},
      children: [],
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    }),
    TextureLoader: () => ({
      load: () => {
        const img = new Image()
        return img
      },
    }),
    MathUtils: {
      degToRad: (degrees: number) => degrees * (Math.PI / 180),
      radToDeg: (radians: number) => radians * (180 / Math.PI),
      clamp: (value: number, min: number, max: number) => Math.max(min, Math.min(max, value)),
    },
  }
}
