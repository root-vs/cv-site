import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import {
  CHAPTER_PALETTES,
  ChapterId,
  CUBE_PIECES,
  CubePieceNode,
} from '../data/cvVault';
import { soundEngine } from '../utils/soundEngine';

export type CubeThemeMode = 'obsidian' | 'light';

interface ObsidianBrainCanvasProps {
  activeChapter: ChapterId;
  activeNodeId: string;
  scrollProgress: number; // 0..1 across entire CV scroll
  homeExitProgress: number; // 0 at Home top, 1 once scrolled past Home
  cubeManuallyExploded: boolean;
  onToggleCubeExplode: () => void;
  onSelectPiece: (piece: CubePieceNode) => void;
  autoOrbit: boolean;
  resetSignal: number;
  stageSide: 'right' | 'left' | 'center';
  theme: CubeThemeMode;
}

// Pre-allocated scratch objects at module scope (zero GC inside animation loop)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _frontDir = new THREE.Vector3(0.14, 0.08, 1.0).normalize();
const _upAxis = new THREE.Vector3(0, 1, 0);
const _targetQuat = new THREE.Quaternion();
const _swayQuat = new THREE.Quaternion();
const _swayEuler = new THREE.Euler();
const _camDesiredPos = new THREE.Vector3();
const _coreProjected = new THREE.Vector3();

// Theme accent colors for central sphere breathing & dual-theme transitions (zero GC in loop)
const BREATH_ACCENT_TEAL = new THREE.Color(0x5eead4);
const BREATH_ACCENT_SKY = new THREE.Color(0x38bdf8);
const BREATH_ACCENT_VIOLET = new THREE.Color(0xa78bfa);
const BREATH_ACCENT_EMERALD = new THREE.Color(0x34d399);
const BREATH_ACCENT_ROSE = new THREE.Color(0xf472b6);
const _obsidianBg = new THREE.Color(0x04070a);
const _lightBg = new THREE.Color(0xf4f4f5);
const _hemiObsidianSky = new THREE.Color(0xa5b4fc);
const _hemiLightSky = new THREE.Color(0xffffff);
const _hemiObsidianGround = new THREE.Color(0x04070a);
const _hemiLightGround = new THREE.Color(0xd4d4d8);
const _cubettoDarkBody = new THREE.Color(0x080d14);
const _cubettoLightBody = new THREE.Color(0x27272a);
const _cubettoLightActiveBody = new THREE.Color(0x111827);
const _lightEdgeMuted = new THREE.Color(0x52525b);
const _lightCoreCenter = new THREE.Color(0x09090b);
const _darkCoreCenter = new THREE.Color(0xf0fdfa);
const _activeChapterTargetColor = new THREE.Color(0x5eead4);
const _activeChapterColor = new THREE.Color(0x5eead4);
const _activeChapterLightColor = new THREE.Color(0x09090b);
const _breathCoreColor = new THREE.Color();
const _breathMidColor = new THREE.Color();
const _breathAuraColor = new THREE.Color();
const _breathOrbitColor = new THREE.Color();
const _pieceEdgeTarget = new THREE.Color();
const _highlightEdgeWhite = new THREE.Color(0xf8fafc);

// Custom Volumetric Light-Bleed & Depth-Separation ShaderPass
const LightBleedShader = {
  uniforms: {
    tDiffuse: { value: null },
    uCoreUv: { value: new THREE.Vector2(0.5, 0.5) },
    uTexelSize: { value: new THREE.Vector2(1 / 1280, 1 / 720) },
    uExplosion: { value: 0.0 },
    uPulse: { value: 0.5 },
    uThemeLight: { value: 0.0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 uCoreUv;
    uniform vec2 uTexelSize;
    uniform float uExplosion;
    uniform float uPulse;
    uniform float uThemeLight;
    varying vec2 vUv;

    float luma(vec3 c) {
      return dot(c, vec3(0.2126, 0.7152, 0.0722));
    }

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);

      // Radial screen-space light-bleed marching toward the glowing center sphere
      vec2 toCore = uCoreUv - vUv;
      float distToCore = length(toCore);
      vec2 dir = toCore / max(distToCore, 0.0001);
      float marchDist = min(distToCore, 0.24);
      vec2 stepUv = dir * (marchDist / 10.0);

      vec3 radialAccum = vec3(0.0);
      vec2 sampleUv = vUv;
      float decay = 1.0;

      for (int i = 0; i < 10; i++) {
        sampleUv += stepUv;
        vec2 clampedUv = clamp(sampleUv, vec2(0.001), vec2(0.999));
        vec3 s = texture2D(tDiffuse, clampedUv).rgb;
        float bright = smoothstep(0.28, 1.25, luma(s));
        radialAccum += s * bright * decay;
        decay *= 0.84;
      }
      radialAccum /= 10.0;

      // Subtle 4-tap chromatic edge halation to separate flying cubetto silhouettes
      vec2 off = uTexelSize * 2.6;
      vec3 sR = texture2D(tDiffuse, clamp(vUv + vec2(off.x, 0.0), vec2(0.001), vec2(0.999))).rgb;
      vec3 sL = texture2D(tDiffuse, clamp(vUv - vec2(off.x, 0.0), vec2(0.001), vec2(0.999))).rgb;
      vec3 sU = texture2D(tDiffuse, clamp(vUv + vec2(0.0, off.y), vec2(0.001), vec2(0.999))).rgb;
      vec3 sD = texture2D(tDiffuse, clamp(vUv - vec2(0.0, off.y), vec2(0.001), vec2(0.999))).rgb;

      vec3 edgeHalo = (
        sR * smoothstep(0.45, 1.4, luma(sR)) +
        sL * smoothstep(0.45, 1.4, luma(sL)) +
        sU * smoothstep(0.45, 1.4, luma(sU)) +
        sD * smoothstep(0.45, 1.4, luma(sD))
      ) * 0.25;

      float radialAtten = exp(-distToCore * 2.8);
      float bleedStrength = 0.11 + uPulse * 0.05 + uExplosion * 0.04;
      vec3 mysticTint = mix(vec3(0.68, 1.0, 0.96), vec3(0.84, 0.75, 1.0), smoothstep(0.05, 0.55, distToCore));

      vec3 lightBleed = (radialAccum * radialAtten * bleedStrength * mysticTint + edgeHalo * 0.06) * (1.0 - uThemeLight);
      gl_FragColor = vec4(base.rgb + lightBleed, base.a);
    }
  `,
};

const CHAPTER_CAMERA_OFFSET: Record<ChapterId, [number, number, number]> = {
  home: [0, 0.25, 7.6],
  about: [-0.8, 0.55, 9.8],
  skills: [1.1, 0.85, 9.6],
  experience: [-1.2, -0.45, 9.4],
  certifications: [0.9, -0.85, 9.7],
  publications: [0.0, 1.35, 9.5],
  education: [-0.9, 0.75, 9.6],
  cinema: [0.0, -1.1, 9.9],
  contact: [0.0, 0.25, 9.4],
};

function createBeveledCubettoGeometry(size: number, bevel: number): THREE.ExtrudeGeometry {
  const half = size / 2 - bevel;
  const shape = new THREE.Shape();
  shape.moveTo(-half, -half);
  shape.lineTo(half, -half);
  shape.lineTo(half, half);
  shape.lineTo(-half, half);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: size - bevel * 2,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
  });
  geo.center();
  return geo;
}

function createObsidianMicroTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = 'rgba(220, 220, 220, 0.16)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 256; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.26)';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, 220, 220);
    ctx.strokeStyle = 'rgba(40, 40, 40, 0.38)';
    ctx.strokeRect(32, 32, 192, 192);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// Soft volumetric light-shaft gradient texture (bright near origin sphere, feathered outward)
function createVolumetricBeamTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 128, 256);
    const vGrad = ctx.createLinearGradient(0, 256, 0, 0);
    vGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
    vGrad.addColorStop(0.18, 'rgba(255, 255, 255, 0.65)');
    vGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.22)');
    vGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, 128, 256);

    // Soft horizontal falloff so beam edges never look hard
    ctx.globalCompositeOperation = 'destination-in';
    const hGrad = ctx.createLinearGradient(0, 0, 128, 0);
    hGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
    hGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)');
    hGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
    hGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.85)');
    hGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, 0, 128, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// Radial glowing particle sprite for the inward-flowing particle field
function createParticleSpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.28, 'rgba(200, 255, 245, 0.8)');
    grad.addColorStop(0.65, 'rgba(94, 234, 212, 0.25)');
    grad.addColorStop(1.0, 'rgba(94, 234, 212, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function ObsidianBrainCanvas({
  activeChapter,
  activeNodeId,
  scrollProgress,
  homeExitProgress,
  cubeManuallyExploded,
  onToggleCubeExplode,
  onSelectPiece,
  autoOrbit,
  resetSignal,
  stageSide,
  theme,
}: ObsidianBrainCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredPiece, setHoveredPiece] = useState<CubePieceNode | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const stateRef = useRef({
    activeChapter,
    activeNodeId,
    scrollProgress,
    homeExitProgress,
    cubeManuallyExploded,
    autoOrbit,
    resetSignal,
    lastResetSignal: resetSignal,
    userInteracting: false,
    stageSide,
    theme,
  });

  stateRef.current.activeChapter = activeChapter;
  stateRef.current.activeNodeId = activeNodeId;
  stateRef.current.scrollProgress = scrollProgress;
  stateRef.current.homeExitProgress = homeExitProgress;
  stateRef.current.cubeManuallyExploded = cubeManuallyExploded;
  stateRef.current.autoOrbit = autoOrbit;
  stateRef.current.resetSignal = resetSignal;
  stateRef.current.stageSide = stageSide;
  stateRef.current.theme = theme;

  const callbacksRef = useRef({ onToggleCubeExplode, onSelectPiece });
  callbacksRef.current = { onToggleCubeExplode, onSelectPiece };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isSoftwareGl = false;
    try {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) {
        setWebglUnavailable(true);
        return;
      }
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param) || '');
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04070a);
    scene.fog = new THREE.FogExp2(0x04070a, 0.022);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 7.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => e.preventDefault();
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    // Mystical Studio Lighting Rig: Warm key + Cool fill + Dual Teal/Violet Core Lights
    const hemiLight = new THREE.HemisphereLight(0xa5b4fc, 0x04070a, 0.72);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    keyLight.position.set(7, 10, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.55);
    rimLight.position.set(-8, -5, -7);
    scene.add(rimLight);

    const corePointLight = new THREE.PointLight(0x5eead4, 2.5, 22, 1.35);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    const mysticVioletLight = new THREE.PointLight(0xa78bfa, 1.8, 18, 1.45);
    mysticVioletLight.position.set(0.15, -0.1, 0.15);
    scene.add(mysticVioletLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.055;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.65;

    controls.addEventListener('start', () => {
      stateRef.current.userInteracting = true;
    });
    controls.addEventListener('end', () => {
      stateRef.current.userInteracting = false;
    });

    // =========================================================================
    // MASTER KNOWLEDGE CUBE ASSEMBLY
    // =========================================================================
    const assemblyGroup = new THREE.Group();
    scene.add(assemblyGroup);

    // Focal light inside assemblyGroup illuminating only the active cubetto under inspection
    const activePieceLight = new THREE.PointLight(0x5eead4, 0, 5.2, 1.8);
    assemblyGroup.add(activePieceLight);

    // 1. MULTI-INTENSITY LUMINOUS PULSING SPHERE
    const sphereGroup = new THREE.Group();
    assemblyGroup.add(sphereGroup);

    const coreInnerGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const coreInnerMat = new THREE.MeshStandardMaterial({
      color: 0xf0fdfa,
      emissive: 0x5eead4,
      emissiveIntensity: 3.0,
      roughness: 0.08,
      metalness: 0.1,
    });
    const coreInnerMesh = new THREE.Mesh(coreInnerGeo, coreInnerMat);
    sphereGroup.add(coreInnerMesh);

    const coreMidGeo = new THREE.SphereGeometry(0.54, 32, 32);
    const coreMidMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreMidMesh = new THREE.Mesh(coreMidGeo, coreMidMat);
    sphereGroup.add(coreMidMesh);

    const coreAuraGeo = new THREE.SphereGeometry(0.98, 24, 24);
    const coreAuraMat = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreAuraMesh = new THREE.Mesh(coreAuraGeo, coreAuraMat);
    sphereGroup.add(coreAuraMesh);

    const coreOrbitGeo = new THREE.TorusGeometry(0.66, 0.013, 12, 64);
    const coreOrbitMat = new THREE.MeshBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreOrbitRing = new THREE.Mesh(coreOrbitGeo, coreOrbitMat);
    sphereGroup.add(coreOrbitRing);

    const coreOrbitOuterGeo = new THREE.TorusGeometry(0.84, 0.008, 10, 84);
    const coreOrbitOuterMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreOrbitRingOuter = new THREE.Mesh(coreOrbitOuterGeo, coreOrbitOuterMat);
    coreOrbitRingOuter.rotation.set(0.65, 0.35, 0.4);
    sphereGroup.add(coreOrbitRingOuter);

    // 2. VOLUMETRIC MYSTICAL LIGHT BEAMS POURING OUT THROUGH THE FISSURES
    const beamTexture = createVolumetricBeamTexture();
    const beamPalette = [0x5eead4, 0x38bdf8, 0xa78bfa, 0xf472b6, 0x34d399];
    const lightBeamsGroup = new THREE.Group();
    assemblyGroup.add(lightBeamsGroup);

    // Directions targeting precision seams & fissures between the 3x3x3 cubetti
    const fissureDirections: [number, number, number][] = [
      [0.45, 0.45, 1.0],
      [-0.45, 0.45, 1.0],
      [0.45, -0.45, 1.0],
      [-0.45, -0.45, 1.0],
      [0.45, 0.45, -1.0],
      [-0.45, 0.45, -1.0],
      [0.45, -0.45, -1.0],
      [-0.45, -0.45, -1.0],
      [1.0, 0.45, 0.0],
      [-1.0, 0.45, 0.0],
      [1.0, -0.45, 0.0],
      [-1.0, -0.45, 0.0],
      [0.0, 1.0, 0.45],
      [0.0, 1.0, -0.45],
      [0.0, -1.0, 0.45],
      [0.0, -1.0, -0.45],
      [0.5, 0.0, 0.5],
      [-0.5, 0.0, 0.5],
      [0.5, 0.0, -0.5],
      [-0.5, 0.0, -0.5],
    ];

    const beamPlaneGeo = new THREE.PlaneGeometry(0.42, 3.0);
    beamPlaneGeo.translate(0, 1.5, 0);

    interface BeamRuntime {
      group: THREE.Group;
      mat: THREE.MeshBasicMaterial;
      phase: number;
    }
    const beamsRuntime: BeamRuntime[] = [];

    fissureDirections.forEach((dirArr, idx) => {
      const dir = new THREE.Vector3(...dirArr).normalize();
      const beamColor = beamPalette[idx % beamPalette.length];
      const beamMat = new THREE.MeshBasicMaterial({
        map: beamTexture,
        color: beamColor,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const beamNode = new THREE.Group();
      const p1 = new THREE.Mesh(beamPlaneGeo, beamMat);
      const p2 = new THREE.Mesh(beamPlaneGeo, beamMat);
      p2.rotation.y = Math.PI / 2;
      beamNode.add(p1, p2);

      beamNode.quaternion.setFromUnitVectors(_upAxis, dir);
      lightBeamsGroup.add(beamNode);

      beamsRuntime.push({
        group: beamNode,
        mat: beamMat,
        phase: idx * 0.63,
      });
    });

    // 3. INWARD-FLOWING PARTICLE FIELD SURROUNDING THE CENTRAL GLOWING SPHERE
    const MAX_MOTE_COUNT = 260;
    const moteSprite = createParticleSpriteTexture();
    const motePositions = new Float32Array(MAX_MOTE_COUNT * 3);
    const moteColors = new Float32Array(MAX_MOTE_COUNT * 3);

    interface MoteData {
      dir: THREE.Vector3;
      radius: number;
      maxRadius: number;
      speed: number;
      swirlSpeed: number;
      angle: number;
      color: THREE.Color;
    }

    const motesData: MoteData[] = [];
    const motePalette = [
      new THREE.Color(0x5eead4),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xa78bfa),
      new THREE.Color(0xf472b6),
    ];

    for (let i = 0; i < MAX_MOTE_COUNT; i++) {
      const theta = i * 2.3999632;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / MAX_MOTE_COUNT);
      const dir = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      ).normalize();
      const maxR = 3.8 + ((i * 19) % 10) * 0.24;
      const startR = 0.6 + ((i * 31) % 100) * 0.045;
      const col = motePalette[i % motePalette.length];

      motesData.push({
        dir,
        radius: startR,
        maxRadius: maxR,
        speed: 0.45 + ((i * 13) % 8) * 0.08,
        swirlSpeed: (i % 2 === 0 ? 1 : -1) * (0.18 + ((i * 7) % 5) * 0.05),
        angle: theta,
        color: col,
      });

      motePositions[i * 3 + 0] = dir.x * startR;
      motePositions[i * 3 + 1] = dir.y * startR;
      motePositions[i * 3 + 2] = dir.z * startR;

      moteColors[i * 3 + 0] = col.r;
      moteColors[i * 3 + 1] = col.g;
      moteColors[i * 3 + 2] = col.b;
    }

    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
    moteGeo.setAttribute('color', new THREE.BufferAttribute(moteColors, 3));
    moteGeo.setDrawRange(0, 0);

    const moteMat = new THREE.PointsMaterial({
      size: 0.14,
      map: moteSprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const motePoints = new THREE.Points(moteGeo, moteMat);
    motePoints.frustumCulled = false;
    assemblyGroup.add(motePoints);

    // 4. 26 MYSTICAL IRIDESCENT OBSIDIAN CUBETTI
    const cubettoSize = 0.64;
    const assembledSpacing = 0.705; // Slightly crisp precision gap so light beams pour out from fissures
    const cubettoGeo = createBeveledCubettoGeometry(cubettoSize, 0.042);
    const cubettoEdgesGeo = new THREE.EdgesGeometry(cubettoGeo, 26);

    const microTex = createObsidianMicroTexture();
    microTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const clickableMeshes: THREE.Object3D[] = [];

    interface PieceRuntime {
      node: CubePieceNode;
      group: THREE.Group;
      bodyMesh: THREE.Mesh;
      bodyMat: THREE.MeshPhysicalMaterial;
      edgeMat: THREE.LineBasicMaterial;
      baseColor: THREE.Color;
      assembledPos: THREE.Vector3;
      radialDir: THREE.Vector3;
      explodedPos: THREE.Vector3;
      phase: number;
      surgeAmount: number;
      hoverAmount: number;
    }

    const piecesRuntime: PieceRuntime[] = [];

    CUBE_PIECES.forEach((piece, idx) => {
      const pieceGroup = new THREE.Group();
      const [gx, gy, gz] = piece.gridPos;
      const assembledPos = new THREE.Vector3(
        gx * assembledSpacing,
        gy * assembledSpacing,
        gz * assembledSpacing
      );
      const radialDir = new THREE.Vector3(gx, gy, gz).normalize();
      const explodedPos = radialDir.clone().multiplyScalar(piece.explodedDistance);

      pieceGroup.position.copy(assembledPos);

      const baseColor = new THREE.Color(piece.tonalColor);

      // Mystical Iridescent Obsidian + Category Emissive Resonance
      const bodyMat = new THREE.MeshPhysicalMaterial({
        color: 0x080d14,
        emissive: baseColor,
        emissiveIntensity: 0.14,
        metalness: 0.84,
        roughness: 0.2,
        roughnessMap: microTex,
        bumpMap: microTex,
        bumpScale: 0.006,
        clearcoat: 0.85,
        clearcoatRoughness: 0.14,
        transparent: true,
        opacity: 1.0,
        depthWrite: true,
        iridescence: isSoftwareGl ? 0 : 0.95,
        iridescenceIOR: 1.45,
        iridescenceThicknessRange: [180, 540],
      });

      const bodyMesh = new THREE.Mesh(cubettoGeo, bodyMat);
      bodyMesh.userData = { pieceId: piece.id };
      pieceGroup.add(bodyMesh);

      const edgeMat = new THREE.LineBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.62,
      });
      const edgeLines = new THREE.LineSegments(cubettoEdgesGeo, edgeMat);
      edgeLines.scale.setScalar(1.002);
      pieceGroup.add(edgeLines);

      assemblyGroup.add(pieceGroup);
      clickableMeshes.push(bodyMesh);

      piecesRuntime.push({
        node: piece,
        group: pieceGroup,
        bodyMesh,
        bodyMat,
        edgeMat,
        baseColor,
        assembledPos,
        radialDir,
        explodedPos,
        phase: idx * 0.57,
        surgeAmount: 0,
        hoverAmount: 0,
      });
    });

    // 5. 26 RADIAL TETHER BEAMS FROM PULSING SPHERE TO CUBETTI
    const tetherPositions = new Float32Array(CUBE_PIECES.length * 6);
    const tetherColors = new Float32Array(CUBE_PIECES.length * 6);
    const tetherGeo = new THREE.BufferGeometry();
    tetherGeo.setAttribute('position', new THREE.BufferAttribute(tetherPositions, 3));
    tetherGeo.setAttribute('color', new THREE.BufferAttribute(tetherColors, 3));

    const tetherMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
    });
    const tetherLines = new THREE.LineSegments(tetherGeo, tetherMat);
    tetherLines.frustumCulled = false;
    assemblyGroup.add(tetherLines);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // =========================================================================
    // POST-PROCESSING: DYNAMIC SSAO + VOLUMETRIC LIGHT-BLEED SHADER (GPU ONLY)
    // =========================================================================
    let composer: EffectComposer | null = null;
    let ssaoPass: SSAOPass | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    let lightBleedPass: ShaderPass | null = null;
    let outputPass: OutputPass | null = null;

    class VisibilityGuardPass extends Pass {
      private hide: boolean;
      constructor(hide: boolean) {
        super();
        this.hide = hide;
        this.needsSwap = false;
      }
      render() {
        const visible = !this.hide;
        lightBeamsGroup.visible = visible;
        coreMidMesh.visible = visible;
        coreAuraMesh.visible = visible;
        coreOrbitRing.visible = visible;
        coreOrbitRingOuter.visible = visible;
      }
    }

    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      composer.setSize(width, height);

      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      // Hide additive volumetric planes while SSAOPass evaluates solid cubetto depth/normals
      composer.addPass(new VisibilityGuardPass(true));

      ssaoPass = new SSAOPass(scene, camera, width, height, 24);
      ssaoPass.kernelRadius = 12;
      ssaoPass.minDistance = 0.004;
      ssaoPass.maxDistance = 0.14;
      ssaoPass.output = SSAOPass.OUTPUT.Default;
      composer.addPass(ssaoPass);

      composer.addPass(new VisibilityGuardPass(false));

      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.14,
        0.32,
        0.85
      );
      composer.addPass(bloomPass);

      lightBleedPass = new ShaderPass(LightBleedShader);
      lightBleedPass.uniforms.uTexelSize.value.set(1 / width, 1 / height);
      composer.addPass(lightBleedPass);

      outputPass = new OutputPass();
      composer.addPass(outputPass);
    }

    // =========================================================================
    // RAYCASTING
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverTime = 0;
    let currentHoveredId: string | null = null;

    const updateNdc = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const isOverUiElement = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      return Boolean(
        target.closest('.pointer-events-auto, button, a, input, header, nav, [role="dialog"]')
      );
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverTime < 24) return;
      lastHoverTime = now;

      if (isOverUiElement(e.target)) {
        if (currentHoveredId !== null) {
          currentHoveredId = null;
          document.body.style.cursor = '';
          setHoveredPiece(null);
        }
        return;
      }

      updateNdc(e);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      const nextId = hits.length > 0 ? (hits[0].object.userData.pieceId as string) : null;

      if (nextId !== currentHoveredId) {
        currentHoveredId = nextId;
        document.body.style.cursor = nextId ? 'pointer' : '';
        const found = nextId ? CUBE_PIECES.find((p) => p.id === nextId) || null : null;
        setHoveredPiece(found);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      soundEngine.unlock();
      if (isOverUiElement(e.target)) {
        pointerDownPos = { x: -9999, y: -9999 };
        return;
      }
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isOverUiElement(e.target)) return;
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (dx * dx + dy * dy > 36) return;

      updateNdc(e);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const pid = hits[0].object.userData.pieceId as string;
        if (stateRef.current.activeChapter === 'home' && !stateRef.current.cubeManuallyExploded) {
          callbacksRef.current.onToggleCubeExplode();
          return;
        }
        const piece = CUBE_PIECES.find((p) => p.id === pid);
        if (piece) {
          callbacksRef.current.onSelectPiece(piece);
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    // =========================================================================
    // ANIMATION LOOP
    // =========================================================================
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let currentExplosion = 0;
    let currentViewOffsetX = 0;
    let homeSpinAngle = 0.65;
    let activeFlash = 0;
    let prevActiveNode = stateRef.current.activeNodeId;
    let wasExploded = false;
    let contactProximitySmoothed = 0;
    let breathPhase = 0;
    let breathHarmonicPhase = 0;
    let breathColorPhase = 0;
    let themeLightBlend = stateRef.current.theme === 'light' ? 1.0 : 0.0;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const status = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();
      const st = stateRef.current;

      // Scroll-scrubbed explosion progress
      const targetExplosion = st.cubeManuallyExploded
        ? 1
        : THREE.MathUtils.clamp(st.homeExitProgress * 1.15, 0, 1);
      currentExplosion = THREE.MathUtils.damp(currentExplosion, targetExplosion, 4.8, delta);
      const easedExp = THREE.MathUtils.smootherstep(currentExplosion, 0, 1);

      // Trigger deep thrum during major cube explosion / reassembly transition
      const isNowExploded = targetExplosion > 0.28;
      if (isNowExploded !== wasExploded) {
        wasExploded = isNowExploded;
        soundEngine.playExplosionThrum(isNowExploded);
      }

      // Trigger crisp mechanical click when a new cubetto aligns with camera
      if (st.activeNodeId !== prevActiveNode) {
        prevActiveNode = st.activeNodeId;
        activeFlash = 1.0;
        if (easedExp > 0.12 || isNowExploded) {
          soundEngine.playCubettoClick();
        }
      }
      activeFlash = THREE.MathUtils.damp(activeFlash, 0, 3.8, delta);

      const curW = container.clientWidth || window.innerWidth;
      const curH = container.clientHeight || window.innerHeight;
      const aspect = curW / Math.max(1, curH);
      const aspectPullback =
        aspect < 1.15
          ? THREE.MathUtils.lerp(1.0, 1.54, THREE.MathUtils.clamp((1.15 - aspect) / 0.65, 0, 1))
          : 1.0;

      if (st.resetSignal !== st.lastResetSignal) {
        st.lastResetSignal = st.resetSignal;
        camera.position.set(0, 0.25, 7.6 * aspectPullback);
        controls.target.set(0, 0, 0);
        controls.update();
      }

      let targetOffsetX = 0;
      if (curW >= 1280) {
        if (st.stageSide === 'right') targetOffsetX = -curW * 0.21;
        else if (st.stageSide === 'left') targetOffsetX = curW * 0.21;
        else targetOffsetX = 0;
      } else if (curW >= 1024) {
        if (st.stageSide === 'right') targetOffsetX = -curW * 0.16;
        else if (st.stageSide === 'left') targetOffsetX = curW * 0.16;
        else targetOffsetX = 0;
      }
      currentViewOffsetX = THREE.MathUtils.damp(currentViewOffsetX, targetOffsetX, 4.2, delta);
      if (Math.abs(currentViewOffsetX) > 0.5) {
        camera.setViewOffset(curW, curH, currentViewOffsetX, 0, curW, curH);
      } else if (camera.view && camera.view.enabled) {
        camera.clearViewOffset();
        camera.updateProjectionMatrix();
      }

      if (!st.userInteracting) {
        const chCam = CHAPTER_CAMERA_OFFSET[st.activeChapter] || [0, 0.25, 9.6];
        _camDesiredPos.set(
          chCam[0] * easedExp,
          THREE.MathUtils.lerp(0.25, chCam[1], easedExp),
          THREE.MathUtils.lerp(7.6, chCam[2], easedExp) * aspectPullback
        );
        camera.position.lerp(_camDesiredPos, 1 - Math.exp(-3.0 * delta));
      }

      controls.autoRotate = st.autoOrbit && !st.userInteracting && easedExp > 0.2;
      controls.autoRotateSpeed = 0.22;
      controls.update();

      // Rotate cube assembly so active section/subsection cubetto faces camera
      if (easedExp < 0.08 && !st.cubeManuallyExploded) {
        homeSpinAngle += delta * 0.36;
        _swayEuler.set(Math.sin(elapsed * 0.45) * 0.18 + 0.34, homeSpinAngle, 0.06);
        _targetQuat.setFromEuler(_swayEuler);
        assemblyGroup.quaternion.slerp(_targetQuat, 1 - Math.exp(-5.0 * delta));
      } else {
        const activePiece =
          piecesRuntime.find((p) => p.node.id === st.activeNodeId) || piecesRuntime[0];
        _vec3A.copy(activePiece.radialDir);

        if (_vec3A.dot(_frontDir) < -0.995) {
          _vec3A.y += 0.02;
          _vec3A.normalize();
        }
        _targetQuat.setFromUnitVectors(_vec3A, _frontDir);

        _swayEuler.set(
          Math.sin(elapsed * 0.55) * 0.05,
          Math.cos(elapsed * 0.42) * 0.06,
          Math.sin(elapsed * 0.33) * 0.02
        );
        _swayQuat.setFromEuler(_swayEuler);
        _targetQuat.multiply(_swayQuat);

        assemblyGroup.quaternion.slerp(_targetQuat, 1 - Math.exp(-3.6 * delta));
      }

      const targetLight = st.theme === 'light' ? 1.0 : 0.0;
      themeLightBlend = THREE.MathUtils.damp(themeLightBlend, targetLight, 6.0, delta);

      // Smooth dual-theme environment transition (Deep Obsidian <-> Crisp Monochrome/Light)
      (scene.background as THREE.Color).lerpColors(_obsidianBg, _lightBg, themeLightBlend);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(scene.background as THREE.Color);
        scene.fog.density = THREE.MathUtils.lerp(0.022, 0.011, themeLightBlend);
      }
      renderer.toneMappingExposure = THREE.MathUtils.lerp(1.28, 1.06, themeLightBlend);
      hemiLight.color.lerpColors(_hemiObsidianSky, _hemiLightSky, themeLightBlend);
      hemiLight.groundColor.lerpColors(_hemiObsidianGround, _hemiLightGround, themeLightBlend);
      hemiLight.intensity = THREE.MathUtils.lerp(0.72, 1.48, themeLightBlend);
      keyLight.intensity = THREE.MathUtils.lerp(2.0, 2.3, themeLightBlend);
      rimLight.intensity = THREE.MathUtils.lerp(1.55, 1.15, themeLightBlend);
      if (bloomPass) {
        bloomPass.strength = THREE.MathUtils.lerp(0.14, 0.018, themeLightBlend);
      }

      // Phase-continuous subtle breathing animation for the central sphere using active chapter resonance
      const chPalette = CHAPTER_PALETTES[st.activeChapter];
      _activeChapterTargetColor.set(chPalette.obsidian);
      _activeChapterColor.lerp(_activeChapterTargetColor, 1 - Math.exp(-4.0 * delta));
      _activeChapterLightColor.set(chPalette.lightInk);

      const targetContactProx = THREE.MathUtils.clamp(
        Math.max(st.scrollProgress, st.activeChapter === 'contact' ? 1.0 : 0),
        0,
        1
      );
      contactProximitySmoothed = THREE.MathUtils.damp(
        contactProximitySmoothed,
        targetContactProx,
        3.2,
        delta
      );

      const breathFreq = THREE.MathUtils.lerp(
        1.05,
        4.45,
        Math.pow(contactProximitySmoothed, 1.25)
      );
      breathPhase += delta * breathFreq;
      breathHarmonicPhase += delta * (breathFreq * 1.65);
      breathColorPhase += delta * (0.28 + contactProximitySmoothed * 0.45);

      const rawBreath = 0.5 + 0.5 * Math.sin(breathPhase);
      const breathEase = rawBreath * rawBreath * (3 - 2 * rawBreath);
      const harmonicWave = 0.5 + 0.5 * Math.sin(breathHarmonicPhase);
      const pulseMix = breathEase * 0.76 + harmonicWave * 0.24;

      _breathCoreColor
        .copy(BREATH_ACCENT_TEAL)
        .lerp(_activeChapterColor, 0.58)
        .lerp(BREATH_ACCENT_SKY, 0.18 * (0.5 + 0.5 * Math.sin(breathColorPhase)))
        .lerp(BREATH_ACCENT_EMERALD, 0.14 * (0.5 + 0.5 * Math.cos(breathColorPhase * 0.85)));

      _breathMidColor
        .copy(_activeChapterColor)
        .lerp(
          BREATH_ACCENT_VIOLET,
          0.18 + 0.32 * (0.5 + 0.5 * Math.sin(breathColorPhase + 1.1))
        )
        .lerp(_breathCoreColor, 0.35 * breathEase);

      _breathAuraColor
        .copy(BREATH_ACCENT_VIOLET)
        .lerp(_activeChapterColor, 0.42)
        .lerp(BREATH_ACCENT_ROSE, (0.16 + 0.28 * contactProximitySmoothed) * breathEase);

      _breathOrbitColor
        .copy(_breathCoreColor)
        .lerp(_activeChapterColor, 0.45);

      if (themeLightBlend > 0.02) {
        _breathCoreColor.lerp(_activeChapterLightColor, themeLightBlend * 0.85);
        _breathMidColor.lerp(_activeChapterLightColor, themeLightBlend * 0.82);
        _breathOrbitColor.lerp(_activeChapterLightColor, themeLightBlend * 0.9);
      }

      coreInnerMat.color.copy(_darkCoreCenter).lerp(_lightCoreCenter, themeLightBlend);
      coreInnerMat.emissive.copy(_breathCoreColor);
      coreMidMat.color.copy(_breathMidColor);
      coreAuraMat.color.copy(_breathAuraColor);
      coreOrbitMat.color.copy(_breathOrbitColor);
      coreOrbitOuterMat.color.copy(_breathMidColor);
      corePointLight.color.copy(_breathCoreColor);
      mysticVioletLight.color.copy(_breathAuraColor);

      const scaleAmp = prefersReducedMotion ? 0.15 : 1.0;
      const sphereVisibility = THREE.MathUtils.lerp(0.24, 1.0, easedExp);

      coreInnerMesh.scale.setScalar(
        sphereVisibility *
          (0.91 + (breathEase * 0.16 + harmonicWave * 0.05) * scaleAmp + activeFlash * 0.12)
      );
      coreInnerMat.emissiveIntensity =
        (1.25 +
          breathEase * 1.65 +
          harmonicWave * 0.35 +
          contactProximitySmoothed * 0.45 +
          activeFlash * 1.4) *
        sphereVisibility *
        THREE.MathUtils.lerp(1.0, 0.42, themeLightBlend);

      coreMidMesh.scale.setScalar(
        sphereVisibility * (0.9 + (breathEase * 0.24 + harmonicWave * 0.06) * scaleAmp)
      );
      coreMidMat.blending =
        themeLightBlend > 0.5 ? THREE.NormalBlending : THREE.AdditiveBlending;
      coreMidMat.opacity =
        sphereVisibility * (0.15 + breathEase * 0.2) * THREE.MathUtils.lerp(1.0, 0.35, themeLightBlend);

      coreAuraMesh.scale.setScalar(
        sphereVisibility * (0.88 + breathEase * 0.32 * scaleAmp)
      );
      coreAuraMat.blending =
        themeLightBlend > 0.5 ? THREE.NormalBlending : THREE.AdditiveBlending;
      coreAuraMat.opacity =
        sphereVisibility * (0.055 + breathEase * 0.085) * THREE.MathUtils.lerp(1.0, 0.22, themeLightBlend);

      const ringSpinScale = 1.0 + contactProximitySmoothed * 0.75;
      coreOrbitRing.rotation.x += delta * 0.85 * ringSpinScale;
      coreOrbitRing.rotation.y += delta * 0.62 * ringSpinScale;
      coreOrbitMat.blending =
        themeLightBlend > 0.5 ? THREE.NormalBlending : THREE.AdditiveBlending;
      coreOrbitMat.opacity =
        easedExp * (0.24 + pulseMix * 0.28) * THREE.MathUtils.lerp(1.0, 1.2, themeLightBlend);

      coreOrbitRingOuter.rotation.x -= delta * 0.42 * ringSpinScale;
      coreOrbitRingOuter.rotation.z += delta * 0.56 * ringSpinScale;
      coreOrbitOuterMat.blending =
        themeLightBlend > 0.5 ? THREE.NormalBlending : THREE.AdditiveBlending;
      coreOrbitOuterMat.opacity =
        easedExp * (0.14 + pulseMix * 0.18) * THREE.MathUtils.lerp(1.0, 1.15, themeLightBlend);

      corePointLight.intensity =
        (THREE.MathUtils.lerp(0.95, 2.0, easedExp) +
          breathEase * 1.9 +
          contactProximitySmoothed * 0.45 +
          activeFlash * 1.3) *
        THREE.MathUtils.lerp(1.0, 0.4, themeLightBlend);
      mysticVioletLight.intensity =
        (THREE.MathUtils.lerp(0.55, 1.4, easedExp) + (1 - breathEase) * 1.4) *
        THREE.MathUtils.lerp(1.0, 0.35, themeLightBlend);

      // Subtle Volumetric Light Beams attenuated smoothly in Light theme so background stays pure
      lightBeamsGroup.visible = themeLightBlend < 0.88;
      if (lightBeamsGroup.visible) {
        const beamThemeAtten = 1 - themeLightBlend;
        for (let b = 0; b < beamsRuntime.length; b++) {
          const bm = beamsRuntime[b];
          const beamWave = 0.5 + 0.5 * Math.sin(elapsed * 1.9 + bm.phase);
          const beamLength = THREE.MathUtils.lerp(0.28, 0.72, easedExp) * (0.85 + beamWave * 0.25);
          const beamWidth = THREE.MathUtils.lerp(0.24, 0.68, easedExp) * (0.82 + beamWave * 0.2);
          bm.group.scale.set(beamWidth, beamLength, beamWidth);
          bm.mat.opacity =
            THREE.MathUtils.lerp(0.06, 0.16, easedExp) *
            (0.55 + beamWave * 0.35 + activeFlash * 0.2) *
            beamThemeAtten;
        }
      }

      // Inward-Flowing Particle Field surrounding the central glowing sphere (density reacts to scrollProgress)
      const activeMotes = Math.round(
        THREE.MathUtils.lerp(0, 40 + st.scrollProgress * (MAX_MOTE_COUNT - 40), easedExp)
      );
      moteGeo.setDrawRange(0, activeMotes);
      motePoints.visible = activeMotes > 0;
      if (motePoints.visible) {
        const mPos = moteGeo.attributes.position as THREE.BufferAttribute;
        const mCol = moteGeo.attributes.color as THREE.BufferAttribute;
        const speedScale = 1.0 + st.scrollProgress * 0.9;
        moteMat.blending =
          themeLightBlend > 0.5 ? THREE.NormalBlending : THREE.AdditiveBlending;

        for (let i = 0; i < activeMotes; i++) {
          const md = motesData[i];
          const proximityBoost = 1.0 + Math.max(0, 1.5 - md.radius * 0.35);
          md.radius -= md.speed * delta * speedScale * proximityBoost;
          md.angle += md.swirlSpeed * delta;

          if (md.radius <= 0.35) {
            md.radius = md.maxRadius;
          }

          const cosA = Math.cos(md.angle * 0.08);
          const sinA = Math.sin(md.angle * 0.08);
          const px = (md.dir.x * cosA - md.dir.z * sinA) * md.radius;
          const py = md.dir.y * md.radius;
          const pz = (md.dir.x * sinA + md.dir.z * cosA) * md.radius;

          mPos.setXYZ(i, px, py, pz);

          const edgeFade =
            THREE.MathUtils.smoothstep(md.radius, 0.35, 1.1) *
            (1 - THREE.MathUtils.smoothstep(md.radius, md.maxRadius - 0.8, md.maxRadius));
          const darkMoteShade = THREE.MathUtils.lerp(1.0, 0.22, themeLightBlend);
          mCol.setXYZ(
            i,
            md.color.r * (0.4 + edgeFade * 0.8) * darkMoteShade,
            md.color.g * (0.4 + edgeFade * 0.8) * darkMoteShade,
            md.color.b * (0.4 + edgeFade * 0.8) * darkMoteShade
          );
        }
        mPos.needsUpdate = true;
        mCol.needsUpdate = true;
        moteMat.opacity = (0.55 + st.scrollProgress * 0.35) * THREE.MathUtils.lerp(1.0, 0.65, themeLightBlend);
      }

      // Update 26 Mystical Cubetti + Radial Tethers
      const posAttr = tetherGeo.attributes.position as THREE.BufferAttribute;
      const colAttr = tetherGeo.attributes.color as THREE.BufferAttribute;
      tetherMat.opacity =
        THREE.MathUtils.smoothstep(easedExp, 0.06, 0.42) *
        THREE.MathUtils.lerp(0.85, 0.62, themeLightBlend);
      tetherLines.visible = easedExp > 0.05;

      const scrollFocusBoost = THREE.MathUtils.clamp(
        easedExp * 0.65 + st.scrollProgress * 0.35,
        0,
        1
      );

      let activeLightTargetIntensity = 0;

      for (let i = 0; i < piecesRuntime.length; i++) {
        const pr = piecesRuntime[i];
        const isActive = pr.node.id === st.activeNodeId && easedExp > 0.12;
        const isHovered = pr.node.id === currentHoveredId;

        pr.surgeAmount = THREE.MathUtils.damp(
          pr.surgeAmount,
          isActive ? 1.0 : 0.0,
          5.0,
          delta
        );
        pr.hoverAmount = THREE.MathUtils.damp(
          pr.hoverAmount,
          isHovered ? 1.0 : 0.0,
          isHovered ? 11.0 : 6.0,
          delta
        );

        _vec3B.lerpVectors(pr.assembledPos, pr.explodedPos, easedExp);

        if (easedExp > 0.05) {
          const surgeOffset =
            pr.surgeAmount * 1.48 + pr.hoverAmount * (isActive ? 0.14 : 0.28);
          const floatOffset = Math.sin(elapsed * 1.2 + pr.phase) * 0.08 * easedExp;
          _vec3B.addScaledVector(pr.radialDir, surgeOffset + floatOffset);
        } else if (pr.hoverAmount > 0.005) {
          _vec3B.addScaledVector(pr.radialDir, pr.hoverAmount * 0.12);
        }

        pr.group.position.copy(_vec3B);

        if (isActive) {
          activePieceLight.position.copy(_vec3B).addScaledVector(pr.radialDir, 0.72);
          activePieceLight.color.copy(pr.baseColor);
          activeLightTargetIntensity =
            (2.4 + breathEase * 0.8 + activeFlash * 1.4) *
            easedExp *
            THREE.MathUtils.lerp(1.0, 0.45, themeLightBlend);
        }

        const baseScale = isActive ? 1.38 + activeFlash * 0.14 : 1.0;
        const targetScale = baseScale + pr.hoverAmount * (isActive ? 0.08 : 0.16);
        const nextScale = THREE.MathUtils.damp(pr.group.scale.x, targetScale, 8.5, delta);
        pr.group.scale.setScalar(nextScale);

        if (easedExp > 0.05) {
          pr.group.rotation.x = Math.sin(elapsed * 0.5 + pr.phase) * 0.1 * easedExp;
          pr.group.rotation.y = Math.cos(elapsed * 0.45 + pr.phase) * 0.1 * easedExp;
        } else {
          pr.group.rotation.set(0, 0, 0);
        }

        // Strict scroll spotlight + dual-theme body & tonal edge resonance
        const activeBlend = THREE.MathUtils.clamp(pr.surgeAmount, 0, 1);
        const focusWeight = Math.max(activeBlend, pr.hoverAmount * 0.82);

        pr.bodyMat.color
          .copy(_cubettoDarkBody)
          .lerp(
            activeBlend > 0.15 ? _cubettoLightActiveBody : _cubettoLightBody,
            themeLightBlend
          );
        pr.bodyMat.emissive.copy(pr.baseColor);

        const baseOpacityObsidian = THREE.MathUtils.lerp(1.0, 0.4, easedExp);
        const baseOpacityLight = THREE.MathUtils.lerp(1.0, 0.78, easedExp);
        const baseOpacity = THREE.MathUtils.lerp(
          baseOpacityObsidian,
          baseOpacityLight,
          themeLightBlend
        );

        const baseRoughness = THREE.MathUtils.lerp(
          THREE.MathUtils.lerp(0.2, 0.78, easedExp),
          0.42,
          themeLightBlend * 0.55
        );
        const baseClearcoat = THREE.MathUtils.lerp(0.85, 0.08, easedExp);
        const baseEnv = THREE.MathUtils.lerp(1.0, 0.22, easedExp);
        const baseIridescence = isSoftwareGl
          ? 0
          : THREE.MathUtils.lerp(0.88, 0.12, easedExp) * THREE.MathUtils.lerp(1.0, 0.4, themeLightBlend);
        const baseEmissive =
          THREE.MathUtils.lerp(0.11, 0.004, easedExp) *
          THREE.MathUtils.lerp(1.0, 0.12, themeLightBlend);
        const baseEdgeOpacity = THREE.MathUtils.lerp(
          THREE.MathUtils.lerp(0.42, 0.09, easedExp),
          THREE.MathUtils.lerp(0.48, 0.24, easedExp),
          themeLightBlend
        );

        const activeEmissive =
          (1.25 +
            scrollFocusBoost * 0.75 +
            breathEase * 0.22 +
            activeFlash * 0.48 +
            pr.hoverAmount * 0.2) *
          THREE.MathUtils.lerp(1.0, 0.52, themeLightBlend);

        pr.bodyMat.opacity = THREE.MathUtils.lerp(baseOpacity, 1.0, focusWeight);
        pr.bodyMat.roughness = THREE.MathUtils.lerp(baseRoughness, 0.09, focusWeight);
        pr.bodyMat.clearcoat = THREE.MathUtils.lerp(baseClearcoat, 1.0, focusWeight);
        pr.bodyMat.envMapIntensity = THREE.MathUtils.lerp(baseEnv, 1.45, focusWeight);
        if (!isSoftwareGl) {
          pr.bodyMat.iridescence = THREE.MathUtils.lerp(baseIridescence, 1.0, focusWeight);
        }
        pr.bodyMat.emissiveIntensity = THREE.MathUtils.lerp(
          baseEmissive,
          activeBlend > 0.15 ? activeEmissive : 0.72 * THREE.MathUtils.lerp(1.0, 0.42, themeLightBlend),
          focusWeight
        );

        _pieceEdgeTarget
          .copy(pr.baseColor)
          .lerp(_lightEdgeMuted, themeLightBlend * (1 - focusWeight) * 0.85);
        pr.edgeMat.color
          .copy(_pieceEdgeTarget)
          .lerp(_highlightEdgeWhite, activeBlend * 0.35 * (1 - themeLightBlend));
        pr.edgeMat.opacity = THREE.MathUtils.lerp(baseEdgeOpacity, 1.0, focusWeight);

        // Tether from pulsing center sphere -> cubetto
        posAttr.setXYZ(i * 2, 0, 0, 0);
        posAttr.setXYZ(i * 2 + 1, _vec3B.x, _vec3B.y, _vec3B.z);

        const tetherGain = THREE.MathUtils.lerp(
          Math.max(0.08, pr.hoverAmount * 0.75),
          1.15,
          activeBlend
        );
        const tetherShade = THREE.MathUtils.lerp(1.0, 0.55, themeLightBlend);
        colAttr.setXYZ(
          i * 2,
          THREE.MathUtils.lerp(0.37, 0.95, activeBlend) * tetherGain * tetherShade,
          THREE.MathUtils.lerp(0.92, 1.0, activeBlend) * tetherGain * tetherShade,
          THREE.MathUtils.lerp(0.83, 0.98, activeBlend) * tetherGain * tetherShade
        );
        colAttr.setXYZ(
          i * 2 + 1,
          pr.baseColor.r * tetherGain * tetherShade,
          pr.baseColor.g * tetherGain * tetherShade,
          pr.baseColor.b * tetherGain * tetherShade
        );
      }

      activePieceLight.intensity = THREE.MathUtils.damp(
        activePieceLight.intensity,
        activeLightTargetIntensity,
        6.5,
        delta
      );

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      if (composer && ssaoPass && lightBleedPass) {
        // Keep SSAO projection matrices synced with dynamic camera.setViewOffset
        ssaoPass.ssaoMaterial.uniforms['cameraProjectionMatrix'].value.copy(
          camera.projectionMatrix
        );
        ssaoPass.ssaoMaterial.uniforms['cameraInverseProjectionMatrix'].value.copy(
          camera.projectionMatrixInverse
        );
        ssaoPass.kernelRadius = THREE.MathUtils.lerp(10, 22, easedExp);
        ssaoPass.minDistance = THREE.MathUtils.lerp(0.0035, 0.006, easedExp);
        ssaoPass.maxDistance = THREE.MathUtils.lerp(0.09, 0.22, easedExp);

        // Project central core sphere (0,0,0) into screen UV for directional Light-Bleed
        _coreProjected.set(0, 0, 0).project(camera);
        lightBleedPass.uniforms.uCoreUv.value.set(
          _coreProjected.x * 0.5 + 0.5,
          _coreProjected.y * 0.5 + 0.5
        );
        lightBleedPass.uniforms.uExplosion.value = easedExp;
        lightBleedPass.uniforms.uPulse.value = pulseMix;
        lightBleedPass.uniforms.uThemeLight.value = themeLightBlend;

        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const pr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(pr);
      if (composer) {
        composer.setPixelRatio(pr);
        composer.setSize(w, h);
      }
      if (bloomPass) {
        bloomPass.resolution.set(w, h);
      }
      if (lightBleedPass) {
        lightBleedPass.uniforms.uTexelSize.value.set(1 / w, 1 / h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.body.style.cursor = '';
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      controls.dispose();

      ssaoPass?.dispose();
      bloomPass?.dispose();
      lightBleedPass?.dispose();
      outputPass?.dispose();
      composer?.dispose();

      coreInnerGeo.dispose();
      coreInnerMat.dispose();
      coreMidGeo.dispose();
      coreMidMat.dispose();
      coreAuraGeo.dispose();
      coreAuraMat.dispose();
      coreOrbitGeo.dispose();
      coreOrbitMat.dispose();
      coreOrbitOuterGeo.dispose();
      coreOrbitOuterMat.dispose();
      beamPlaneGeo.dispose();
      beamTexture.dispose();
      beamsRuntime.forEach((b) => b.mat.dispose());
      moteGeo.dispose();
      moteMat.dispose();
      moteSprite.dispose();
      cubettoGeo.dispose();
      cubettoEdgesGeo.dispose();
      microTex.dispose();
      piecesRuntime.forEach((pr) => {
        pr.bodyMat.dispose();
        pr.edgeMat.dispose();
      });
      tetherGeo.dispose();
      tetherMat.dispose();
      envTex.dispose();

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#f4f4f5] transition-colors duration-300 dark:bg-[#04070a]">
      {webglUnavailable ? (
        <div
          className="flex h-full w-full items-center justify-center bg-radial from-zinc-200/70 via-[#f4f4f5] to-[#f4f4f5] dark:from-teal-950/30 dark:via-[#04070a] dark:to-[#04070a]"
          aria-hidden="true"
        >
          <div className="h-24 w-24 rounded-full bg-zinc-950/10 ring-1 ring-zinc-950/25 dark:bg-teal-300/20 dark:ring-teal-300/40" />
        </div>
      ) : (
        <div ref={mountRef} className="h-full w-full" />
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-radial from-transparent via-[#f4f4f5]/10 to-zinc-950/12 dark:from-transparent dark:via-[#04070a]/12 dark:to-[#04070a]/72"
      />

      {hoveredPiece && (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-20 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border border-zinc-950/20 bg-white/95 px-3.5 py-2 text-center shadow-2xl dark:border-teal-400/35 dark:bg-[#060c10]/95 sm:bottom-7 sm:px-4">
          <div className="flex items-center justify-center gap-2 truncate text-xs font-semibold text-zinc-950 dark:text-teal-200">
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: hoveredPiece.tonalColor }}
            />
            <span className="truncate">{hoveredPiece.title}</span>
          </div>
          <div className="mt-0.5 truncate text-[11px] text-zinc-600 dark:text-slate-400">
            {hoveredPiece.meta || hoveredPiece.category} · Click to inspect
          </div>
        </div>
      )}
    </div>
  );
}
