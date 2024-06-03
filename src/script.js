import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
gui.close();
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Fog
const fog = new THREE.Fog("#d4c5c5", 1, 15);
scene.fog = fog;
scene.background = new THREE.Color("#060218");
/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const doorColorTexture = textureLoader.load(
  "/textures/door/color2 (Среднее).jpg"
);

const grassColorTexture = textureLoader.load("textures/grass/color.jpg");
const grassNormalTexture = textureLoader.load("textures/grass/normal.jpg");
const grassAmbientOcclusionTexture = textureLoader.load(
  "textures/grass/ambientOcclusion.jpg"
);
const grassRoughnessTexture = textureLoader.load(
  "textures/grass/roughness.jpg"
);

grassColorTexture.repeat.set(30, 30);
grassNormalTexture.repeat.set(30, 30);
grassAmbientOcclusionTexture.repeat.set(30, 30);
grassRoughnessTexture.repeat.set(30, 30);

grassColorTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;

grassColorTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;
// Fonts

const fontFile = "/fonts/helvetiker_regular.typeface.json";
const fontLoader = new FontLoader();

fontLoader.load(
  fontFile,
  (font) => {
    console.log("Font loaded:", font);
    const textGeometry = new TextGeometry("CyberGrave", {
      font: font,
      size: 0.3,
      height: 0.1,
      curveSegments: 5,
      bevelEnabled: false,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 4,
    });

    textGeometry.center();
    const textMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const text = new THREE.Mesh(textGeometry, textMaterial);
    text.position.y = 2.2;
    text.position.z = 2;
    textMaterial.wireframe = false;
    text.castShadow = true;
    text.receiveShadow = true;
    scene.add(text);
  },
  console.log("In progress..."),
  console.log("Font NOT loaded")
);

/**
 * House
 */

// Group
const houseGroup = new THREE.Group();
// scene.add(houseGroup);

// Walls

const wallsParams = { height: 2.5, width: 4 };
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({ color: "#a6c51f", wireframe: false })
);

walls.position.y = walls.geometry.parameters.height / 2;
houseGroup.add(walls);
gui
  .add(wallsParams, "height")
  .min(1)
  .max(3)
  .name("Walls height")
  .onChange(function (value) {
    walls.scale.y = value / walls.geometry.parameters.height;
    walls.position.y = value / 2;
    roof.position.y = value + roof.geometry.parameters.height / 2;
  });

// Roof

const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.2, 3, 4),
  new THREE.MeshStandardMaterial({ color: "#85195a" })
);
roof.position.y =
  walls.geometry.parameters.height + roof.geometry.parameters.height / 2;
roof.rotation.y = Math.PI * 0.25;
houseGroup.add(roof);

// Door

const door = new THREE.Mesh(
  new THREE.PlaneGeometry(1.4, 2),
  new THREE.MeshStandardMaterial({ map: doorColorTexture })
);
door.position.y = door.geometry.parameters.height / 2;
door.position.z = walls.geometry.parameters.depth / 2 + 0.01;
houseGroup.add(door);

// Bushes
const bushMaterial = new THREE.MeshBasicMaterial({
  color: "#0f4429",
});

const bushesGroup = new THREE.Group();

for (let i = 0; i < 5; i++) {
  const bushRadius = (Math.random() + 0.2) * 0.5;
  const bushGeometry = new THREE.SphereGeometry(bushRadius, 32, 32);
  const bushes = new THREE.Mesh(bushGeometry, bushMaterial);
  bushes.position.set(
    -2 + Math.random() * 3,
    bushRadius - bushRadius / 8,
    3 + Math.random()
  );
  bushes.castShadow = true;
  bushes.receiveShadow = true;
  bushesGroup.add(bushes);
}

houseGroup.add(bushesGroup);

// Graves
const gravesMaterial = new THREE.MeshBasicMaterial({ color: "#1b1b1c" });
const gravesGeometry = new THREE.BoxGeometry(0.6, 1, 0.15);
const gravesGroup = new THREE.Group();
for (let i = 0; i < 500; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 40;
  const x = Math.sin(angle) * radius;
  const y = Math.cos(angle) * radius;
  const grave = new THREE.Mesh(gravesGeometry, gravesMaterial);
  grave.position.set(x, gravesGeometry.parameters.height / 2 - 0.1, y);
  grave.rotateY((Math.random() - 0.5) * 0.5);
  grave.rotateZ((Math.random() - 0.5) * 0.2);
  grave.castShadow = true;
  grave.receiveShadow = true;
  gravesGroup.add(grave);
}
scene.add(gravesGroup);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.MeshStandardMaterial({
    map: grassColorTexture,
    normalMap: grassNormalTexture,
    aoMap: grassAmbientOcclusionTexture,
    roughnessMap: grassRoughnessTexture,
    roughness: 10,
  })
);

floor.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute((floor.geometry.attributes.uv.array, 2))
);

floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
houseGroup.add(floor);
scene.add(houseGroup);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
//scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight("#cff2fa", 0.12);
moonLight.position.set(4, 5, 2);
gui.add(moonLight, "intensity").min(0).max(1).step(0.001);
gui.add(moonLight.position, "x").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "y").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "z").min(-5).max(5).step(0.001);
scene.add(moonLight);

// Door light
const doorLight = new THREE.PointLight("#e18d1f", 1, 7);
doorLight.position.set(0, 2.2, 2.7);
houseGroup.add(doorLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 3;
camera.position.z = 40;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.zoomSpeed = 0.4;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor("#d4c5c5");
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

floor.receiveShadow = true;
moonLight.castShadow = true;
doorLight.castShadow = true;
walls.castShadow = true;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (camera.position.z > 4.5) {
    camera.position.z -= 0.1;
    camera.position.y -= 0.003;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
