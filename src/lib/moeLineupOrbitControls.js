/**
 * 展示3D — ドラッグでカメラ回転 · ホイールで拡大縮小
 * @param {HTMLElement} dom
 * @param {import('three').PerspectiveCamera} camera
 * @param {import('three').Vector3} lookAt
 * @param {{ initialDist: number, minDist?: number, maxDist?: number, initialPitch?: number, initialYaw?: number }} opts
 */
export function attachLineupOrbitControls(dom, camera, lookAt, opts) {
  const minDist = opts.minDist ?? opts.initialDist * 0.35;
  const maxDist = opts.maxDist ?? opts.initialDist * 2.8;
  let yaw = opts.initialYaw ?? 0;
  let pitch = opts.initialPitch ?? 0.42;
  let dist = opts.initialDist;

  const sync = () => {
    camera.position.set(
      lookAt.x + dist * Math.cos(pitch) * Math.sin(yaw),
      lookAt.y + dist * Math.sin(pitch),
      lookAt.z + dist * Math.cos(pitch) * Math.cos(yaw)
    );
    camera.lookAt(lookAt);
  };
  sync();

  let dragging = false;
  let pointerId = null;
  let lastX = 0;
  let lastY = 0;

  const onDown = (e) => {
    if (e.button !== 0) return;
    dragging = true;
    pointerId = e.pointerId;
    lastX = e.clientX;
    lastY = e.clientY;
    dom.style.cursor = "grabbing";
    try {
      dom.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onMove = (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    yaw -= (e.clientX - lastX) * 0.008;
    pitch = Math.max(0.08, Math.min(1.25, pitch - (e.clientY - lastY) * 0.006));
    lastX = e.clientX;
    lastY = e.clientY;
    sync();
  };

  const onUp = (e) => {
    if (e.pointerId !== pointerId) return;
    dragging = false;
    pointerId = null;
    dom.style.cursor = "grab";
    try {
      dom.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onWheel = (e) => {
    e.preventDefault();
    dist = Math.max(minDist, Math.min(maxDist, dist + e.deltaY * 0.012));
    sync();
  };

  dom.style.cursor = "grab";
  dom.style.touchAction = "none";
  dom.addEventListener("pointerdown", onDown);
  dom.addEventListener("pointermove", onMove);
  dom.addEventListener("pointerup", onUp);
  dom.addEventListener("pointercancel", onUp);
  dom.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    dom.removeEventListener("pointerdown", onDown);
    dom.removeEventListener("pointermove", onMove);
    dom.removeEventListener("pointerup", onUp);
    dom.removeEventListener("pointercancel", onUp);
    dom.removeEventListener("wheel", onWheel);
    dom.style.cursor = "";
    dom.style.touchAction = "";
  };
}
