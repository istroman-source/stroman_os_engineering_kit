"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { prepareInteriorMaterials } from "@/infrastructure/spatial/prepare-interior-materials";
import type { PreparedLocationEnvironment } from "@/ui/auth/api-client";
import { Button } from "@/ui/primitives/button";

type CameraPose = { yaw: number; pitch: number };

function disposeRoomScene(scene: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => {
      materials.add(material);
      Object.values(material as unknown as Record<string, unknown>).forEach((value) => {
        if (value instanceof THREE.Texture) textures.add(value);
      });
    });
  });
  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}

export function PreparedRoomViewer({
  locationId,
  locationName,
  environment,
}: {
  locationId: string;
  locationName: string;
  environment: PreparedLocationEnvironment;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const poseRef = useRef<CameraPose>({ yaw: 0, pitch: 0 });
  const dragRef = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const [loadState, setLoadState] = useState<"LOADING" | "READY" | "FAILED">("LOADING");
  const [progress, setProgress] = useState(0);

  const look = () => {
    const camera = cameraRef.current;
    if (!camera) return;
    const { yaw, pitch } = poseRef.current;
    camera.lookAt(
      camera.position.x + Math.sin(yaw) * Math.cos(pitch),
      camera.position.y + Math.sin(pitch),
      camera.position.z - Math.cos(yaw) * Math.cos(pitch),
    );
  };

  const move = (forward: number, right: number) => {
    const camera = cameraRef.current;
    if (!camera) return;
    const { yaw } = poseRef.current;
    const dx = Math.sin(yaw) * forward + Math.cos(yaw) * right;
    const dz = -Math.cos(yaw) * forward + Math.sin(yaw) * right;
    const margin = 0.08;
    camera.position.x = Math.max(
      environment.bounds.min.x + margin,
      Math.min(environment.bounds.max.x - margin, camera.position.x + dx),
    );
    camera.position.z = Math.max(
      environment.bounds.min.z + margin,
      Math.min(environment.bounds.max.z - margin, camera.position.z + dz),
    );
    look();
  };

  const turn = (yaw: number, pitch = 0) => {
    poseRef.current = {
      yaw: poseRef.current.yaw + yaw,
      pitch: Math.max(-1.3, Math.min(1.3, poseRef.current.pitch + pitch)),
    };
    look();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let animation = 0;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151b24);
    const camera = new THREE.PerspectiveCamera(52, 16 / 9, 0.03, 300);
    cameraRef.current = camera;
    const width = environment.bounds.max.x - environment.bounds.min.x;
    const height = environment.bounds.max.y - environment.bounds.min.y;
    const depth = environment.bounds.max.z - environment.bounds.min.z;
    camera.position.set(
      environment.bounds.min.x + width * 0.5,
      environment.bounds.min.y + Math.min(Math.max(height * 0.55, 0.5), 1.65),
      environment.bounds.min.z + depth * 0.7,
    );
    look();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x28303c, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 7, 4);
    scene.add(key);
    new GLTFLoader().load(
      `/api/v1/locations/${encodeURIComponent(locationId)}/geometry`,
      (gltf) => {
        if (disposed) {
          disposeRoomScene(gltf.scene);
          return;
        }
        gltf.scene.applyMatrix4(new THREE.Matrix4().fromArray([...environment.sourceToCanonical]));
        prepareInteriorMaterials(gltf.scene);
        scene.add(gltf.scene);
        setProgress(100);
        setLoadState("READY");
      },
      (event) => {
        if (!disposed && event.total > 0)
          setProgress(Math.round((event.loaded / event.total) * 100));
      },
      () => !disposed && setLoadState("FAILED"),
    );
    const render = () => {
      const cssWidth = Math.max(1, canvas.clientWidth);
      const cssHeight = Math.max(1, canvas.clientHeight);
      if (canvas.width !== cssWidth || canvas.height !== cssHeight) {
        renderer.setSize(cssWidth, cssHeight, false);
        camera.aspect = cssWidth / cssHeight;
        camera.updateProjectionMatrix();
      }
      renderer.render(scene, camera);
      animation = requestAnimationFrame(render);
    };
    animation = requestAnimationFrame(render);
    return () => {
      disposed = true;
      cancelAnimationFrame(animation);
      disposeRoomScene(scene);
      renderer.dispose();
      cameraRef.current = null;
    };
  }, [environment, locationId]);

  const onKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    const amount = event.shiftKey ? 0.5 : 0.18;
    const moves: Record<string, [number, number]> = {
      w: [amount, 0],
      ArrowUp: [amount, 0],
      s: [-amount, 0],
      ArrowDown: [-amount, 0],
      a: [0, -amount],
      ArrowLeft: [0, -amount],
      d: [0, amount],
      ArrowRight: [0, amount],
    };
    const delta = moves[event.key];
    if (delta) {
      event.preventDefault();
      move(...delta);
      return;
    }
    const looks: Record<string, [number, number]> = {
      q: [-0.14, 0],
      e: [0.14, 0],
      r: [0, 0.1],
      f: [0, -0.1],
    };
    const lookDelta = looks[event.key.toLowerCase()];
    if (!lookDelta) return;
    event.preventDefault();
    turn(...lookDelta);
  };

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = { x: event.clientX, y: event.clientY, ...poseRef.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    poseRef.current = {
      yaw: drag.yaw - (event.clientX - drag.x) * 0.006,
      pitch: Math.max(-1.3, Math.min(1.3, drag.pitch - (event.clientY - drag.y) * 0.006)),
    };
    look();
  };

  return (
    <section aria-labelledby="room-viewer-heading" className="space-y-3">
      <div>
        <h2 id="room-viewer-heading" className="text-lg font-semibold">
          Explore the room
        </h2>
        <p className="text-muted-foreground text-sm">
          Drag to look around. Use arrows or WASD to move, and Q/E/R/F to look around with a
          keyboard.
        </p>
      </div>
      <div className="relative aspect-video min-h-64 overflow-hidden rounded-2xl bg-[#151b24] shadow-lg">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label={`Interactive view inside ${locationName}`}
          aria-describedby="room-viewer-help"
          className="focus-visible:ring-primary h-full w-full touch-none outline-none focus-visible:ring-2 focus-visible:ring-inset"
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => (dragRef.current = null)}
          onPointerCancel={() => (dragRef.current = null)}
        />
        {loadState !== "READY" ? (
          <div className="absolute inset-0 grid place-items-center bg-[#151b24]/90 p-6 text-center text-sm text-white">
            {loadState === "FAILED"
              ? "This room could not be displayed. Your source files are still safe."
              : `Opening room… ${progress}%`}
          </div>
        ) : null}
      </div>
      <p id="room-viewer-help" className="sr-only">
        Use W A S D or the arrow keys to move. Use Q and E to turn, and R and F to look up or down.
      </p>
      <div className="flex justify-center gap-2" aria-label="Look around room">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => turn(-0.22)}
          aria-label="Turn left"
        >
          <ArrowLeft />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => turn(0, 0.16)}
          aria-label="Look up"
        >
          <ArrowUp />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => turn(0, -0.16)}
          aria-label="Look down"
        >
          <ArrowDown />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => turn(0.22)}
          aria-label="Turn right"
        >
          <ArrowRight />
        </Button>
      </div>
      <div className="flex justify-center gap-2 sm:hidden" aria-label="Move through room">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => move(0, -0.22)}
          aria-label="Move left"
        >
          <ArrowLeft />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => move(0.22, 0)}
          aria-label="Move forward"
        >
          <ArrowUp />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => move(-0.22, 0)}
          aria-label="Move backward"
        >
          <ArrowDown />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => move(0, 0.22)}
          aria-label="Move right"
        >
          <ArrowRight />
        </Button>
      </div>
    </section>
  );
}
