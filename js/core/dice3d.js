// 3D Dice System using Three.js and Cannon-es physics
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Dice face textures and colors
const FACE_COLORS = {
  default: '#2a2d38',
  locked: '#c9944a',
  cursed: '#9b4a9b',
  blessed: '#4a9b6a',
  fire: '#c94a4a',
  ice: '#4a7cc9',
  lightning: '#c9c44a'
};

const PIP_COLORS = {
  default: '#e8e4dc',
  gold: '#ffd700',
  red: '#ff4444',
  blue: '#4488ff',
  green: '#44ff44',
  purple: '#aa44ff'
};

export class Dice3DSystem {
  constructor(container) {
    this.container = container;
    this.dice = [];
    this.isRolling = false;
    this.onRollComplete = null;
    
    this.init();
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x12141a);
    
    // Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 12, 8);
    this.camera.lookAt(0, 0, 0);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    this.scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    this.scene.add(mainLight);
    
    // Ghost light for spooky effect
    const ghostLight = new THREE.PointLight(0x4a7cc9, 0.3, 20);
    ghostLight.position.set(-3, 5, -3);
    this.scene.add(ghostLight);
    
    // Physics world
    this.world = new CANNON.World();
    this.world.gravity.set(0, -30, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 20;
    
    // Ground plane (dice tray)
    this.createDiceTray();
    
    // Raycaster for clicking
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Event listeners
    this.container.addEventListener('click', (e) => this.onClick(e));
    window.addEventListener('resize', () => this.onResize());
    
    // Start animation loop
    this.animate();
  }

  createDiceTray() {
    // Tray floor
    const floorGeometry = new THREE.BoxGeometry(12, 0.5, 8);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1d26,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.25;
    floor.receiveShadow = true;
    this.scene.add(floor);
    
    // Floor physics
    const floorShape = new CANNON.Box(new CANNON.Vec3(6, 0.25, 4));
    const floorBody = new CANNON.Body({ mass: 0 });
    floorBody.addShape(floorShape);
    floorBody.position.set(0, -0.25, 0);
    this.world.addBody(floorBody);
    
    // Tray walls
    this.createWall(6, 0.5, 0, Math.PI / 2); // Right
    this.createWall(-6, 0.5, 0, -Math.PI / 2); // Left
    this.createWall(0, 0.5, 4, Math.PI); // Back
    this.createWall(0, 0.5, -4, 0); // Front
    
    // Tray felt texture (subtle pattern)
    const feltGeometry = new THREE.PlaneGeometry(11.8, 7.8);
    const feltMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e2130,
      roughness: 1,
      metalness: 0
    });
    const felt = new THREE.Mesh(feltGeometry, feltMaterial);
    felt.rotation.x = -Math.PI / 2;
    felt.position.y = 0.01;
    felt.receiveShadow = true;
    this.scene.add(felt);
  }

  createWall(x, y, z, rotationY) {
    // Visual wall
    const wallGeometry = new THREE.BoxGeometry(0.3, 1, rotationY === 0 || rotationY === Math.PI ? 12 : 8);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x252a38,
      roughness: 0.6,
      metalness: 0.3
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y, z);
    wall.rotation.y = rotationY;
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.scene.add(wall);
    
    // Physics wall
    const isHorizontal = rotationY === 0 || rotationY === Math.PI;
    const wallShape = new CANNON.Box(new CANNON.Vec3(isHorizontal ? 6 : 0.15, 0.5, isHorizontal ? 0.15 : 4));
    const wallBody = new CANNON.Body({ mass: 0 });
    wallBody.addShape(wallShape);
    wallBody.position.set(x, y, z);
    this.world.addBody(wallBody);
  }

  createDie(config = {}) {
    const {
      id = `die_${Date.now()}`,
      size = 1,
      faceColors = Array(6).fill(FACE_COLORS.default),
      faceValues = [1, 2, 3, 4, 5, 6],
      pipColor = PIP_COLORS.default,
      position = { x: 0, y: 5, z: 0 },
      locked = false,
      modifiers = {}
    } = config;

    // Create die mesh
    const geometry = new THREE.BoxGeometry(size, size, size);
    
    // Create face materials with pips
    const materials = faceValues.map((value, index) => {
      const canvas = this.createFaceTexture(value, faceColors[index], pipColor, modifiers);
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.4,
        metalness: 0.1
      });
    });

    const mesh = new THREE.Mesh(geometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(position.x, position.y, position.z);
    mesh.userData = { id, faceValues, locked, currentValue: null };
    
    // Physics body
    const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
    const body = new CANNON.Body({
      mass: locked ? 0 : 1,
      shape: shape,
      material: new CANNON.Material({ friction: 0.3, restitution: 0.3 })
    });
    body.position.set(position.x, position.y, position.z);
    body.angularDamping = 0.3;
    body.linearDamping = 0.3;
    
    this.scene.add(mesh);
    this.world.addBody(body);
    
    const dieObject = { id, mesh, body, config, faceValues, locked };
    this.dice.push(dieObject);
    
    return dieObject;
  }

  createFaceTexture(value, bgColor, pipColor, modifiers = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 128, 128);
    
    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 120, 120);
    
    // Modifier glow effect
    if (modifiers.glow) {
      ctx.shadowColor = modifiers.glow;
      ctx.shadowBlur = 20;
    }
    
    // Draw pips or number
    ctx.fillStyle = pipColor;
    ctx.shadowColor = pipColor;
    ctx.shadowBlur = 5;
    
    if (value <= 6) {
      this.drawPips(ctx, value);
    } else {
      // For values > 6, draw the number
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value.toString(), 64, 64);
    }
    
    // Modifier symbol
    if (modifiers.symbol) {
      ctx.font = '24px Arial';
      ctx.fillStyle = modifiers.symbolColor || '#ffd700';
      ctx.fillText(modifiers.symbol, 100, 20);
    }
    
    return canvas;
  }

  drawPips(ctx, value) {
    const pipRadius = 10;
    const positions = {
      1: [[64, 64]],
      2: [[32, 32], [96, 96]],
      3: [[32, 32], [64, 64], [96, 96]],
      4: [[32, 32], [96, 32], [32, 96], [96, 96]],
      5: [[32, 32], [96, 32], [64, 64], [32, 96], [96, 96]],
      6: [[32, 32], [96, 32], [32, 64], [96, 64], [32, 96], [96, 96]]
    };
    
    const pips = positions[value] || positions[1];
    pips.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, pipRadius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  rollDie(dieId, force = null) {
    const die = this.dice.find(d => d.id === dieId);
    if (!die || die.locked) return;
    
    // Reset position above tray
    const startX = (Math.random() - 0.5) * 4;
    const startZ = (Math.random() - 0.5) * 2;
    die.body.position.set(startX, 6, startZ);
    die.mesh.position.copy(die.body.position);
    
    // Apply random force and torque
    const throwForce = force || {
      x: (Math.random() - 0.5) * 10,
      y: -5,
      z: (Math.random() - 0.5) * 10
    };
    die.body.velocity.set(throwForce.x, throwForce.y, throwForce.z);
    
    const spin = {
      x: (Math.random() - 0.5) * 30,
      y: (Math.random() - 0.5) * 30,
      z: (Math.random() - 0.5) * 30
    };
    die.body.angularVelocity.set(spin.x, spin.y, spin.z);
    
    die.body.wakeUp();
  }

  rollAll() {
    if (this.isRolling) return;
    this.isRolling = true;
    
    this.dice.forEach((die, index) => {
      if (!die.locked) {
        setTimeout(() => this.rollDie(die.id), index * 100);
      }
    });
    
    // Check for settled dice
    this.checkSettled();
  }

  checkSettled() {
    const checkInterval = setInterval(() => {
      const allSettled = this.dice.every(die => {
        if (die.locked) return true;
        const velocity = die.body.velocity;
        const angularVelocity = die.body.angularVelocity;
        return velocity.length() < 0.1 && angularVelocity.length() < 0.1;
      });
      
      if (allSettled) {
        clearInterval(checkInterval);
        this.isRolling = false;
        this.readDiceValues();
        if (this.onRollComplete) {
          this.onRollComplete(this.dice.map(d => ({ id: d.id, value: d.mesh.userData.currentValue })));
        }
      }
    }, 100);
  }

  readDiceValues() {
    this.dice.forEach(die => {
      if (die.locked) return;
      
      // Get the upward-facing side
      const upVector = new THREE.Vector3(0, 1, 0);
      const faceNormals = [
        new THREE.Vector3(1, 0, 0),   // Right - face index 0
        new THREE.Vector3(-1, 0, 0),  // Left - face index 1
        new THREE.Vector3(0, 1, 0),   // Top - face index 2
        new THREE.Vector3(0, -1, 0),  // Bottom - face index 3
        new THREE.Vector3(0, 0, 1),   // Front - face index 4
        new THREE.Vector3(0, 0, -1)   // Back - face index 5
      ];
      
      // Standard die face mapping (opposite faces sum to 7)
      const faceValueMap = [3, 4, 1, 6, 2, 5]; // Index to face value
      
      let maxDot = -1;
      let topFaceIndex = 0;
      
      faceNormals.forEach((normal, index) => {
        const worldNormal = normal.clone().applyQuaternion(die.mesh.quaternion);
        const dot = worldNormal.dot(upVector);
        if (dot > maxDot) {
          maxDot = dot;
          topFaceIndex = index;
        }
      });
      
      // Use custom face values if defined, otherwise use standard mapping
      const value = die.faceValues ? die.faceValues[faceValueMap[topFaceIndex] - 1] : faceValueMap[topFaceIndex];
      die.mesh.userData.currentValue = value;
    });
  }

  toggleLock(dieId) {
    const die = this.dice.find(d => d.id === dieId);
    if (!die) return;
    
    die.locked = !die.locked;
    die.mesh.userData.locked = die.locked;
    
    // Visual feedback - glow when locked
    if (die.locked) {
      die.body.mass = 0;
      die.body.updateMassProperties();
      // Add golden outline effect
      die.mesh.material.forEach(mat => {
        mat.emissive = new THREE.Color(0xc9944a);
        mat.emissiveIntensity = 0.3;
      });
    } else {
      die.body.mass = 1;
      die.body.updateMassProperties();
      die.mesh.material.forEach(mat => {
        mat.emissive = new THREE.Color(0x000000);
        mat.emissiveIntensity = 0;
      });
    }
    
    return die.locked;
  }

  removeDie(dieId) {
    const index = this.dice.findIndex(d => d.id === dieId);
    if (index === -1) return;
    
    const die = this.dice[index];
    this.scene.remove(die.mesh);
    this.world.removeBody(die.body);
    this.dice.splice(index, 1);
  }

  clearDice() {
    this.dice.forEach(die => {
      this.scene.remove(die.mesh);
      this.world.removeBody(die.body);
    });
    this.dice = [];
  }

  updateDieFace(dieId, faceIndex, config) {
    const die = this.dice.find(d => d.id === dieId);
    if (!die) return;
    
    const { value, color, pipColor, modifiers } = config;
    
    if (value !== undefined) {
      die.faceValues[faceIndex] = value;
    }
    
    // Recreate the face texture
    const canvas = this.createFaceTexture(
      die.faceValues[faceIndex],
      color || FACE_COLORS.default,
      pipColor || PIP_COLORS.default,
      modifiers || {}
    );
    
    const texture = new THREE.CanvasTexture(canvas);
    die.mesh.material[faceIndex].map = texture;
    die.mesh.material[faceIndex].needsUpdate = true;
  }

  onClick(event) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.dice.map(d => d.mesh));
    
    if (intersects.length > 0) {
      const clickedDie = this.dice.find(d => d.mesh === intersects[0].object);
      if (clickedDie) {
        if (this.isRolling) {
          // Can't interact while rolling
          return;
        }
        // Toggle lock or roll based on state
        if (event.shiftKey) {
          this.toggleLock(clickedDie.id);
        } else if (!clickedDie.locked) {
          this.rollDie(clickedDie.id);
        }
      }
    }
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Update physics
    this.world.step(1 / 60);
    
    // Sync meshes with physics bodies
    this.dice.forEach(die => {
      die.mesh.position.copy(die.body.position);
      die.mesh.quaternion.copy(die.body.quaternion);
    });
    
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.clearDice();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}

// Dice inventory manager
export class DiceInventory {
  constructor() {
    this.ownedDice = [];
    this.equippedDice = [];
    this.maxEquipped = 5;
  }

  addDie(dieConfig) {
    const die = {
      id: `die_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: dieConfig.name || 'Standard Die',
      faceValues: dieConfig.faceValues || [1, 2, 3, 4, 5, 6],
      faceColors: dieConfig.faceColors || Array(6).fill(FACE_COLORS.default),
      pipColor: dieConfig.pipColor || PIP_COLORS.default,
      modifiers: dieConfig.modifiers || {},
      rarity: dieConfig.rarity || 'common',
      equipped: false
    };
    
    this.ownedDice.push(die);
    return die;
  }

  equipDie(dieId) {
    if (this.equippedDice.length >= this.maxEquipped) return false;
    
    const die = this.ownedDice.find(d => d.id === dieId);
    if (!die || die.equipped) return false;
    
    die.equipped = true;
    this.equippedDice.push(die);
    return true;
  }

  unequipDie(dieId) {
    const index = this.equippedDice.findIndex(d => d.id === dieId);
    if (index === -1) return false;
    
    this.equippedDice[index].equipped = false;
    this.equippedDice.splice(index, 1);
    return true;
  }

  upgradeDieFace(dieId, faceIndex, upgrade) {
    const die = this.ownedDice.find(d => d.id === dieId);
    if (!die) return false;
    
    if (upgrade.value !== undefined) {
      die.faceValues[faceIndex] = upgrade.value;
    }
    if (upgrade.color) {
      die.faceColors[faceIndex] = upgrade.color;
    }
    if (upgrade.modifier) {
      die.modifiers[faceIndex] = { ...die.modifiers[faceIndex], ...upgrade.modifier };
    }
    
    return true;
  }

  getEquippedDice() {
    return this.equippedDice;
  }

  getOwnedDice() {
    return this.ownedDice;
  }

  toJSON() {
    return {
      ownedDice: this.ownedDice,
      equippedDice: this.equippedDice.map(d => d.id)
    };
  }

  fromJSON(data) {
    this.ownedDice = data.ownedDice || [];
    this.equippedDice = this.ownedDice.filter(d => data.equippedDice?.includes(d.id));
    this.equippedDice.forEach(d => d.equipped = true);
  }
}

export { FACE_COLORS, PIP_COLORS };
