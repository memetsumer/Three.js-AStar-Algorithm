import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import Node from "./PathNode";
import aStar from "./algortihm";

const gui = new dat.GUI();

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

let geometry = new THREE.IcosahedronBufferGeometry(1, 12);

let material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});

let nodes = [];
for (let i = 0; i < geometry.attributes.position.count; i++) {
  let x = geometry.attributes.position.array[i * 3];
  let y = geometry.attributes.position.array[i * 3 + 1];
  let z = geometry.attributes.position.array[i * 3 + 2];
  nodes[i] = new Node(i, x, y, z);
}

for (let node of nodes) {
  node.addNeighbors(geometry);
}

let icosahedron = new THREE.Mesh(geometry, material);
scene.add(icosahedron);

let cubeGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
let cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
// Pick random start and end nodes
let startNode = nodes[Math.floor(Math.random() * nodes.length)];
let cubeStart = new THREE.Mesh(cubeGeometry, cubeMaterial);
cubeStart.rotation.x = 0.5;
cubeStart.position.set(
  startNode.vertex.x,
  startNode.vertex.y,
  startNode.vertex.z
);
scene.add(cubeStart);

let endNode = nodes[Math.floor(Math.random() * nodes.length)];
let cubeEnd = new THREE.Mesh(cubeGeometry, cubeMaterial);
cubeEnd.rotation.x = 0.5;
cubeEnd.position.set(endNode.vertex.x, endNode.vertex.y, endNode.vertex.z);
scene.add(cubeEnd);

// Run the A* algorithm
let path = aStar(startNode, endNode, nodes);

if (path.length > 0) {
  for (let node of path) {
    //Add cube to each node
    let cubeGeometry = new THREE.BoxGeometry(0.03, 0.03, 0.03);
    let cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(node.vertex.x, node.vertex.y, node.vertex.z);
    scene.add(cube);
  }
}

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

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 2);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const tick = () => {
  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
