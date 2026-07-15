"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type Dice3DProps = {
  value: number;
  rolling: boolean;
  revealed: boolean;
  variant: 0 | 1;
};

let diceModelPromise: Promise<THREE.Group> | null = null;

function loadDiceModel() {
  if (!diceModelPromise) {
    diceModelPromise = new Promise((resolve, reject) => {
      new GLTFLoader().load("/models/dice.glb", (gltf) => resolve(gltf.scene), undefined, reject);
    });
  }
  return diceModelPromise;
}

const restingRotation: Record<number, [number, number, number]> = {
  1: [0.12, -0.28, 0.08],
  2: [0.08, -0.28, Math.PI / 2],
  3: [-Math.PI / 2, -0.2, 0.06],
  4: [Math.PI / 2, 0.2, -0.08],
  5: [0.05, 0.28, -Math.PI / 2],
  6: [Math.PI, 0.2, 0.08],
};

export default function Dice3D({ value, rolling, revealed, variant }: Dice3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rollingRef = useRef(rolling);
  const valueRef = useRef(value);
  const rollStartedAt = useRef(0);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    rollingRef.current = rolling;
    if (rolling) rollStartedAt.current = performance.now();
  }, [rolling]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 4));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
    camera.position.set(0, 6.8, 4.6);
    camera.lookAt(0, -0.08, 0);
    scene.add(new THREE.HemisphereLight(0xfff8df, 0x164b3d, 2.8));
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    keyLight.position.set(-2.5, 7, 4);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xf5bd38, 2.2);
    rimLight.position.set(4, 1, -2);
    scene.add(rimLight);

    let die: THREE.Group | null = null;
    let animationFrame = 0;
    let disposed = false;

    loadDiceModel().then((source) => {
      if (disposed) return;
      die = source.clone(true);
      die.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (!(material instanceof THREE.MeshStandardMaterial)) return;
          [material.map, material.normalMap, material.roughnessMap, material.metalnessMap].forEach((texture) => {
            if (!texture) return;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.needsUpdate = true;
          });
        });
      });
      const bounds = new THREE.Box3().setFromObject(die);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const scale = 2 / Math.max(size.x, size.y, size.z);
      die.position.copy(center.multiplyScalar(-1));
      const holder = new THREE.Group();
      holder.add(die);
      holder.scale.setScalar(scale);
      die = holder;
      scene.add(die);
    }).catch(() => {
      canvas.dataset.failed = "true";
    });

    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const render = (now: number) => {
      if (die) {
        if (rollingRef.current) {
          const elapsed = Math.max(0, (now - rollStartedAt.current) / 1000);
          const bounce = Math.abs(Math.sin(elapsed * 7.4 + variant * 0.7)) * Math.max(0, 2.4 - elapsed);
          die.position.y = bounce * 0.42;
          die.position.x = Math.sin(elapsed * 4.8 + variant * 2.4) * 0.2;
          die.rotation.x = elapsed * (variant ? 10.5 : 12.5) + variant;
          die.rotation.y = elapsed * (variant ? 13.5 : 9.5) - variant;
          die.rotation.z = elapsed * (variant ? 8.5 : 11.5);
        } else {
          const target = restingRotation[valueRef.current || 1];
          die.position.x = THREE.MathUtils.lerp(die.position.x, 0, 0.14);
          die.position.y = THREE.MathUtils.lerp(die.position.y, 0, 0.14);
          die.rotation.x = THREE.MathUtils.lerp(die.rotation.x, target[0], 0.12);
          die.rotation.y = THREE.MathUtils.lerp(die.rotation.y, target[1], 0.12);
          die.rotation.z = THREE.MathUtils.lerp(die.rotation.z, target[2], 0.12);
        }
      }
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      renderer.dispose();
    };
  }, [variant]);

  return (
    <div className={`dice-model ${rolling ? "is-rolling" : ""} ${revealed ? "is-revealed" : ""}`} role="img" aria-label={value ? `Xúc xắc ${value} điểm` : "Xúc xắc chưa tung"}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <span>{value || "?"}</span>
    </div>
  );
}
