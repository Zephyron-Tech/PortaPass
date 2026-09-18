"use client";

import { useEffect, useRef } from "react";

export interface AbortableRequest {
  controller: AbortController;
  timer: ReturnType<typeof setTimeout>;
}

/** Shared AbortController+timeout bookkeeping for a component that only
 * ever cares about its most recent in-flight fetch. Each caller keeps its
 * own error-branching/UI logic; this only owns the controller, the timer,
 * and "is this still the latest request." */
export function useAbortableRequest() {
  const requestRef = useRef<AbortableRequest | null>(null);

  useEffect(() => () => {
    const request = requestRef.current;
    requestRef.current = null;
    if (request) {
      clearTimeout(request.timer);
      request.controller.abort();
    }
  }, []);

  function start(timeoutMs: number): AbortableRequest {
    const controller = new AbortController();
    const request: AbortableRequest = { controller, timer: setTimeout(() => controller.abort(), timeoutMs) };
    requestRef.current = request;
    return request;
  }

  function isCurrent(request: AbortableRequest) {
    return requestRef.current === request;
  }

  /** Clears the timer and, if still current, clears the ref. Returns
   * whether it was still current, so callers know whether to reset their
   * own in-flight flag. */
  function finish(request: AbortableRequest) {
    clearTimeout(request.timer);
    const wasCurrent = requestRef.current === request;
    if (wasCurrent) requestRef.current = null;
    return wasCurrent;
  }

  return { start, isCurrent, finish };
}
