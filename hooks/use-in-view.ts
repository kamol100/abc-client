"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseInViewOptions {
    /** Scroll container to measure against (e.g. a modal body). Default: the viewport. */
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
    triggerOnce?: boolean;
}

export default function useInView({
    root = null,
    rootMargin = "0px",
    threshold = 0,
    triggerOnce = false,
}: UseInViewOptions = {}) {
    const [inView, setInView] = useState(false);
    const elementRef = useRef<Element | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const ref = useCallback(
        (node: Element | null) => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }

            elementRef.current = node;

            if (!node) {
                setInView(false);
                return;
            }

            if (typeof IntersectionObserver === "undefined") {
                setInView(true);
                return;
            }

            observerRef.current = new IntersectionObserver(
                ([entry]) => {
                    const isIntersecting = entry.isIntersecting;
                    setInView(isIntersecting);

                    if (isIntersecting && triggerOnce) {
                        observerRef.current?.disconnect();
                        observerRef.current = null;
                    }
                },
                { root, rootMargin, threshold }
            );

            observerRef.current.observe(node);
        },
        [root, rootMargin, threshold, triggerOnce]
    );

    useEffect(() => {
        return () => {
            observerRef.current?.disconnect();
        };
    }, []);

    return { ref, inView };
}
