"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseInViewOptions {
    rootMargin?: string;
    threshold?: number | number[];
    triggerOnce?: boolean;
}

export default function useInView({
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

            observerRef.current = new IntersectionObserver(
                ([entry]) => {
                    const isIntersecting = entry.isIntersecting;
                    setInView(isIntersecting);

                    if (isIntersecting && triggerOnce) {
                        observerRef.current?.disconnect();
                        observerRef.current = null;
                    }
                },
                { rootMargin, threshold }
            );

            observerRef.current.observe(node);
        },
        [rootMargin, threshold, triggerOnce]
    );

    useEffect(() => {
        return () => {
            observerRef.current?.disconnect();
        };
    }, []);

    return { ref, inView };
}
