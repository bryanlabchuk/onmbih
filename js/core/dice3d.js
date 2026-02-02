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
    this.onDieLocked = null;  // Callback when a die is locked/unlocked
    this.animationId = null;
    this.initialized = false;
    
    // Don't init in constructor - wait for explicit call
  }

  init() {
    if (this.initialized) return;
    
    // Ensure container has dimensions
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 300;
    
    console.log('Initializing 3D Dice System', { width, height });
    
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x12141a);
    
    // Camera - adjusted for better dice viewing
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 10, 6);
    this.camera.lookAt(0, 0, 0);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Clear container and add canvas
    this.container.querySelectorAll('canvas').forEach(c => c.remove());
    this.container.appendChild(this.renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x606080, 0.8);
    this.scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 15, 5);
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
    
    // Additional fill light
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);
    
    // Ghost light for spooky effect
    const ghostLight = new THREE.PointLight(0x4a7cc9, 0.5, 20);
    ghostLight.position.set(-3, 8, -3);
    this.scene.add(ghostLight);
    
    // Physics world
    this.world = new CANNON.World();
    this.world.gravity.set(0, -40, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 10;
    this.world.allowSleep = true;
    
    // Contact material for better physics
    const diceMaterial = new CANNON.Material('dice');
    const floorMaterial = new CANNON.Material('floor');
    const diceFloorContact = new CANNON.ContactMaterial(diceMaterial, floorMaterial, {
      friction: 0.4,
      restitution: 0.3
    });
    this.world.addContactMaterial(diceFloorContact);
    this.diceMaterial = diceMaterial;
    this.floorMaterial = floorMaterial;
    
    // Ground plane (dice tray)
    this.createDiceTray();
    
    // Raycaster for clicking
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Event listeners
    this.container.addEventListener('click', (e) => this.onClick(e));
    this.container.addEventListener('contextmenu', (e) => this.onRightClick(e));
    window.addEventListener('resize', () => this.onResize());
    
    this.initialized = true;
    
    // Start animation loop
    this.animate();
    
    console.log('3D Dice System initialized successfully');
  }

  createDiceTray() {
    // Tray floor - darker felt material
    const floorGeometry = new THREE.BoxGeometry(14, 0.5, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1d26,
      roughness: 0.9,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.25;
    floor.receiveShadow = true;
    this.scene.add(floor);
    
    // Floor physics
    const floorShape = new CANNON.Box(new CANNON.Vec3(7, 0.25, 5));
    const floorBody = new CANNON.Body({ mass: 0, material: this.floorMaterial });
    floorBody.addShape(floorShape);
    floorBody.position.set(0, -0.25, 0);
    this.world.addBody(floorBody);
    
    // Visible tray walls (short, decorative)
    this.createVisibleWall(7, 0.75, 0, 'right');
    this.createVisibleWall(-7, 0.75, 0, 'left');
    this.createVisibleWall(0, 0.75, 5, 'back');
    this.createVisibleWall(0, 0.75, -5, 'front');
    
    // Invisible tall containment walls (physics only, much taller)
    this.createInvisibleWall(7.5, 10, 0, 'right');
    this.createInvisibleWall(-7.5, 10, 0, 'left');
    this.createInvisibleWall(0, 10, 5.5, 'back');
    this.createInvisibleWall(0, 10, -5.5, 'front');
    
    // Invisible ceiling to prevent dice escaping upward
    const ceilingShape = new CANNON.Box(new CANNON.Vec3(8, 0.5, 6));
    const ceilingBody = new CANNON.Body({ mass: 0, material: this.floorMaterial });
    ceilingBody.addShape(ceilingShape);
    ceilingBody.position.set(0, 15, 0);
    this.world.addBody(ceilingBody);
    
    // Tray felt texture overlay
    const feltGeometry = new THREE.PlaneGeometry(13.8, 9.8);
    const feltMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e2235,
      roughness: 1,
      metalness: 0
    });
    const felt = new THREE.Mesh(feltGeometry, feltMaterial);
    felt.rotation.x = -Math.PI / 2;
    felt.position.y = 0.01;
    felt.receiveShadow = true;
    this.scene.add(felt);
  }

  createVisibleWall(x, y, z, side) {
    const isHorizontal = side === 'front' || side === 'back';
    const width = isHorizontal ? 14 : 0.4;
    const depth = isHorizontal ? 0.4 : 10;
    
    // Visual wall with wood-like appearance
    const wallGeometry = new THREE.BoxGeometry(width, 1.5, depth);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2438,
      roughness: 0.7,
      metalness: 0.2
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.scene.add(wall);
    
    // Physics wall (short, visible height)
    const wallShape = new CANNON.Box(new CANNON.Vec3(width / 2, 0.75, depth / 2));
    const wallBody = new CANNON.Body({ mass: 0, material: this.floorMaterial });
    wallBody.addShape(wallShape);
    wallBody.position.set(x, y, z);
    this.world.addBody(wallBody);
  }

  createInvisibleWall(x, y, z, side) {
    // Tall invisible physics-only walls to contain dice
    const isHorizontal = side === 'front' || side === 'back';
    const width = isHorizontal ? 16 : 1;
    const depth = isHorizontal ? 1 : 12;
    const height = 20; // Very tall
    
    const wallShape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    const wallBody = new CANNON.Body({ mass: 0, material: this.floorMaterial });
    wallBody.addShape(wallShape);
    wallBody.position.set(x, y, z);
    this.world.addBody(wallBody);
  }

  createDie(config = {}) {
    const {
      id = `die_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      size = 1.2,
      faceColors = Array(6).fill(FACE_COLORS.default),
      faceValues = [1, 2, 3, 4, 5, 6],
      pipColor = PIP_COLORS.default,
      position = { x: 0, y: 3, z: 0 },
      locked = false,
      modifiers = {}
    } = config;

    console.log('Creating die:', id, 'at position:', position);

    // Create die mesh with rounded edges
    const geometry = this.createRoundedBoxGeometry(size, size, size, 0.08, 4);
    
    // Create face materials with pips - standard die layout
    // Material indices: 0=right(3), 1=left(4), 2=top(1), 3=bottom(6), 4=front(2), 5=back(5)
    const faceMapping = [2, 4, 0, 5, 1, 3]; // Maps material index to value index
    const materials = faceMapping.map((valueIndex) => {
      const value = faceValues[valueIndex];
      const canvas = this.createFaceTexture(value, faceColors[valueIndex] || FACE_COLORS.default, pipColor, modifiers[valueIndex] || {});
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.FrontSide
      });
    });

    const mesh = new THREE.Mesh(geometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(position.x, position.y, position.z);
    mesh.userData = { id, faceValues, locked, currentValue: faceValues[0] };
    
    // Physics body
    const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
    const body = new CANNON.Body({
      mass: locked ? 0 : 1,
      material: this.diceMaterial,
      angularDamping: 0.4,
      linearDamping: 0.4
    });
    body.addShape(shape);
    body.position.set(position.x, position.y, position.z);
    
    // Random initial rotation
    body.quaternion.setFromEuler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    
    this.scene.add(mesh);
    this.world.addBody(body);
    
    const dieObject = { id, mesh, body, config, faceValues: [...faceValues], locked, size };
    this.dice.push(dieObject);
    
    console.log('Die created, total dice:', this.dice.length);
    
    return dieObject;
  }

  createRoundedBoxGeometry(width, height, depth, radius, segments) {
    // Simple box for now - can be enhanced with rounded edges later
    return new THREE.BoxGeometry(width, height, depth);
  }

  createFaceTexture(value, bgColor, pipColor, modifiers = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Background with gradient
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 180);
    gradient.addColorStop(0, this.lightenColor(bgColor, 20));
    gradient.addColorStop(1, bgColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    // Rounded rectangle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 8;
    this.roundRect(ctx, 8, 8, 240, 240, 20);
    ctx.stroke();
    
    // Inner shadow for depth
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 4;
    this.roundRect(ctx, 12, 12, 232, 232, 16);
    ctx.stroke();
    
    // Draw pips or number
    ctx.fillStyle = pipColor;
    ctx.shadowColor = pipColor;
    ctx.shadowBlur = 10;
    
    if (value <= 6 && value >= 1) {
      this.drawPips(ctx, value, pipColor);
    } else if (value === 0) {
      // Special skull for 0
      ctx.font = 'bold 120px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💀', 128, 128);
    } else {
      // For values > 6, draw the number
      ctx.font = 'bold 140px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value.toString(), 128, 128);
    }
    
    // Modifier glow effect
    if (modifiers.glow) {
      ctx.shadowColor = modifiers.glow;
      ctx.shadowBlur = 30;
      ctx.strokeStyle = modifiers.glow;
      ctx.lineWidth = 6;
      this.roundRect(ctx, 16, 16, 224, 224, 14);
      ctx.stroke();
    }
    
    // Modifier symbol
    if (modifiers.symbol) {
      ctx.shadowBlur = 0;
      ctx.font = '40px Arial';
      ctx.fillStyle = modifiers.symbolColor || '#ffd700';
      ctx.fillText(modifiers.symbol, 220, 36);
    }
    
    return canvas;
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  drawPips(ctx, value, pipColor) {
    const pipRadius = 22;
    const positions = {
      1: [[128, 128]],
      2: [[70, 70], [186, 186]],
      3: [[70, 70], [128, 128], [186, 186]],
      4: [[70, 70], [186, 70], [70, 186], [186, 186]],
      5: [[70, 70], [186, 70], [128, 128], [70, 186], [186, 186]],
      6: [[70, 60], [186, 60], [70, 128], [186, 128], [70, 196], [186, 196]]
    };
    
    const pips = positions[value] || positions[1];
    
    // Draw pips with 3D effect
    pips.forEach(([x, y]) => {
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(x + 3, y + 3, pipRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Main pip
      ctx.fillStyle = pipColor;
      ctx.beginPath();
      ctx.arc(x, y, pipRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(x - 5, y - 5, pipRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  rollDie(dieId) {
    const die = this.dice.find(d => d.id === dieId);
    if (!die || die.locked) return;
    
    console.log('Rolling die:', dieId);
    
    // Reset position above tray with random offset (keep within bounds)
    const startX = (Math.random() - 0.5) * 4; // Reduced spread
    const startZ = (Math.random() - 0.5) * 3;
    die.body.position.set(startX, 6 + Math.random() * 2, startZ); // Lower start height
    die.body.velocity.set(0, 0, 0);
    die.body.angularVelocity.set(0, 0, 0);
    
    // Random initial rotation
    die.body.quaternion.setFromEuler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    
    // Apply throw force - mostly downward with gentle horizontal
    const throwForce = new CANNON.Vec3(
      (Math.random() - 0.5) * 6,  // Reduced horizontal force
      -15 - Math.random() * 5,    // Reduced downward force
      (Math.random() - 0.5) * 6
    );
    die.body.applyImpulse(throwForce, new CANNON.Vec3(0, 0, 0));
    
    // Apply spin (reduced)
    const spin = new CANNON.Vec3(
      (Math.random() - 0.5) * 20,  // Reduced spin
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    );
    die.body.angularVelocity.set(spin.x, spin.y, spin.z);
    
    die.body.wakeUp();
  }

  // Reset a die that has escaped bounds
  resetDiePosition(die) {
    die.body.position.set(
      (Math.random() - 0.5) * 4,
      3,
      (Math.random() - 0.5) * 3
    );
    die.body.velocity.set(0, -2, 0);
    die.body.angularVelocity.set(0, 0, 0);
    die.body.wakeUp();
  }

  // Check if die is out of bounds
  isDieOutOfBounds(die) {
    const pos = die.body.position;
    return Math.abs(pos.x) > 10 || pos.y < -5 || pos.y > 20 || Math.abs(pos.z) > 8;
  }

  rollAll() {
    if (this.isRolling) return;
    this.isRolling = true;
    
    console.log('Rolling all dice:', this.dice.length);
    
    // Stagger the rolls for visual effect
    this.dice.forEach((die, index) => {
      if (!die.locked) {
        setTimeout(() => this.rollDie(die.id), index * 150);
      }
    });
    
    // Start checking if dice have settled
    setTimeout(() => this.checkSettled(), 500);
  }

  checkSettled() {
    let checkCount = 0;
    const maxChecks = 60; // 6 seconds max (reduced from 10)
    
    const checkInterval = setInterval(() => {
      checkCount++;
      
      // Check for out-of-bounds dice and reset them
      this.dice.forEach(die => {
        if (!die.locked && this.isDieOutOfBounds(die)) {
          console.log('Die escaped bounds, resetting:', die.id);
          this.resetDiePosition(die);
        }
      });
      
      const allSettled = this.dice.every(die => {
        if (die.locked) return true;
        const velocity = die.body.velocity;
        const angularVelocity = die.body.angularVelocity;
        const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
        const angSpeed = Math.sqrt(angularVelocity.x ** 2 + angularVelocity.y ** 2 + angularVelocity.z ** 2);
        return speed < 0.1 && angSpeed < 0.1; // Slightly more lenient threshold
      });
      
      if (allSettled || checkCount >= maxChecks) {
        clearInterval(checkInterval);
        
        // Force stop any remaining motion
        this.dice.forEach(die => {
          if (!die.locked) {
            die.body.velocity.set(0, 0, 0);
            die.body.angularVelocity.set(0, 0, 0);
            die.body.sleep();
          }
        });
        
        this.isRolling = false;
        this.readDiceValues();
        
        console.log('Dice settled, values:', this.dice.map(d => d.mesh.userData.currentValue));
        
        if (this.onRollComplete) {
          const results = this.dice.map(d => ({
            id: d.id,
            value: d.mesh.userData.currentValue,
            locked: d.locked
          }));
          this.onRollComplete(results);
        }
      }
    }, 100);
  }

  readDiceValues() {
    this.dice.forEach(die => {
      if (die.locked) return;
      
      // Get the upward-facing side by checking which face normal points most upward
      const upVector = new THREE.Vector3(0, 1, 0);
      
      // Face normals in local space and their corresponding face values
      // Standard die: 1 opposite 6, 2 opposite 5, 3 opposite 4
      const faces = [
        { normal: new THREE.Vector3(1, 0, 0), value: 3 },   // Right
        { normal: new THREE.Vector3(-1, 0, 0), value: 4 },  // Left
        { normal: new THREE.Vector3(0, 1, 0), value: 1 },   // Top
        { normal: new THREE.Vector3(0, -1, 0), value: 6 },  // Bottom
        { normal: new THREE.Vector3(0, 0, 1), value: 2 },   // Front
        { normal: new THREE.Vector3(0, 0, -1), value: 5 }   // Back
      ];
      
      let maxDot = -1;
      let topFaceValue = 1;
      
      faces.forEach(face => {
        const worldNormal = face.normal.clone().applyQuaternion(die.mesh.quaternion);
        const dot = worldNormal.dot(upVector);
        if (dot > maxDot) {
          maxDot = dot;
          topFaceValue = face.value;
        }
      });
      
      // Map to custom face values if different from standard
      const standardIndex = topFaceValue - 1;
      const value = die.faceValues[standardIndex];
      die.mesh.userData.currentValue = value;
    });
  }

  toggleLock(dieId) {
    const die = this.dice.find(d => d.id === dieId);
    if (!die) return false;
    
    die.locked = !die.locked;
    die.mesh.userData.locked = die.locked;
    
    console.log('Toggling lock for die:', dieId, 'locked:', die.locked);
    
    // Visual feedback - glow when locked
    if (die.locked) {
      die.body.mass = 0;
      die.body.velocity.set(0, 0, 0);
      die.body.angularVelocity.set(0, 0, 0);
      die.body.updateMassProperties();
      
      // Add golden glow effect
      die.mesh.material.forEach(mat => {
        mat.emissive = new THREE.Color(0xc9944a);
        mat.emissiveIntensity = 0.4;
      });
    } else {
      die.body.mass = 1;
      die.body.updateMassProperties();
      
      die.mesh.material.forEach(mat => {
        mat.emissive = new THREE.Color(0x000000);
        mat.emissiveIntensity = 0;
      });
    }
    
    // Notify callback
    if (this.onDieLocked) {
      this.onDieLocked(dieId, die.locked, die.mesh.userData.currentValue);
    }
    
    return die.locked;
  }

  removeDie(dieId) {
    const index = this.dice.findIndex(d => d.id === dieId);
    if (index === -1) return;
    
    const die = this.dice[index];
    this.scene.remove(die.mesh);
    this.world.removeBody(die.body);
    die.mesh.geometry.dispose();
    die.mesh.material.forEach(m => {
      if (m.map) m.map.dispose();
      m.dispose();
    });
    this.dice.splice(index, 1);
  }

  clearDice() {
    console.log('Clearing all dice');
    [...this.dice].forEach(die => this.removeDie(die.id));
    this.dice = [];
  }

  onClick(event) {
    if (!this.initialized) return;
    
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.dice.map(d => d.mesh));
    
    if (intersects.length > 0) {
      const clickedDie = this.dice.find(d => d.mesh === intersects[0].object);
      if (clickedDie) {
        if (this.isRolling) return;
        
        if (event.shiftKey) {
          this.toggleLock(clickedDie.id);
        } else if (!clickedDie.locked) {
          this.isRolling = true;
          this.rollDie(clickedDie.id);
          setTimeout(() => this.checkSettled(), 500);
        }
      }
    }
  }

  onRightClick(event) {
    event.preventDefault();
    if (!this.initialized) return;
    
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.dice.map(d => d.mesh));
    
    if (intersects.length > 0) {
      const clickedDie = this.dice.find(d => d.mesh === intersects[0].object);
      if (clickedDie && !this.isRolling) {
        this.toggleLock(clickedDie.id);
      }
    }
  }

  onResize() {
    if (!this.initialized) return;
    
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 300;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (!this.initialized) return;
    
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
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.clearDice();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    this.initialized = false;
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
      shape: dieConfig.shape || 'd6',
      color: dieConfig.color || 'white',
      faceValues: dieConfig.faceValues || [1, 2, 3, 4, 5, 6],
      faceColors: dieConfig.faceColors || Array(6).fill(FACE_COLORS.default),
      pipColor: dieConfig.pipColor || PIP_COLORS.default,
      modifiers: dieConfig.modifiers || [],
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
