"use client";

import { useSyncExternalStore } from "react";

const storageKey = "ruang-baca:v1";
const emptyState = { saved: [], progress: {} };
let snapshot = emptyState;
let previousValue;
let memoryOnly = false;

function getSnapshot() {
  if (memoryOnly) return snapshot;

  try {
    const value = window.localStorage.getItem(storageKey);
    if (value !== previousValue) {
      previousValue = value;
      const parsed = value ? JSON.parse(value) : emptyState;
      snapshot = {
        saved: Array.isArray(parsed?.saved) ? parsed.saved : [],
        progress: parsed?.progress && typeof parsed.progress === "object" ? parsed.progress : {},
      };
    }
    return snapshot;
  } catch {
    return snapshot;
  }
}

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener("ruang-baca:change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("ruang-baca:change", callback);
  };
}

function update(transform) {
  snapshot = transform(getSnapshot());
  previousValue = JSON.stringify(snapshot);
  try {
    window.localStorage.setItem(storageKey, previousValue);
  } catch {
    memoryOnly = true;
  }
  window.dispatchEvent(new Event("ruang-baca:change"));
}

export function useReadingState() {
  return useSyncExternalStore(subscribe, getSnapshot, () => emptyState);
}

export function getProgress(id) {
  return getSnapshot().progress[id];
}

export function saveProgress(id, position) {
  update((state) => ({
    ...state,
    progress: { ...state.progress, [id]: { ...position, updated: Date.now() } },
  }));
}

export function toggleSaved(id) {
  update((state) => ({
    ...state,
    saved: state.saved.includes(id) ? state.saved.filter((item) => item !== id) : [...state.saved, id],
  }));
}
