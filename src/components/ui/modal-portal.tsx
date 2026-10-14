"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

type ModalPortalProps = {
  children: React.ReactNode;
};

function getRoot() {
  let root = document.getElementById("modal-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "modal-root";
    document.body.appendChild(root);
  }
  return root;
}

export function ModalPortal({ children }: ModalPortalProps) {
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
    }
    return () => {
      const root = document.getElementById("modal-root");
      if (root && root.children.length === 0) {
        root.remove();
      }
    };
  }, []);

  if (!mounted) return null;

  return createPortal(children, getRoot());
}