"use client";

import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";

type Props = {
  imageUrl: string;
};

export default function PanoramaViewer({
  imageUrl,
}: Props) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new Viewer({
      container: containerRef.current,

      panorama: imageUrl,

      defaultYaw: "0deg",

      defaultPitch: "0deg",

      mousewheel: true,

      touchmoveTwoFingers: false,

      moveSpeed: 1.2,

      zoomSpeed: 1,

      navbar: [
        "zoom",
        "move",
        "fullscreen",
      ],
    });

    viewer.animate({
      yaw: Math.PI * 2,
      speed: "1rpm",
    });

    return () => {
      viewer.destroy();
    };
  }, [imageUrl]);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full"
    />
  );
}