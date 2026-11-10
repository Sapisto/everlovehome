/** Fades `.reveal` elements in as they scroll into view. */
const items = document.querySelectorAll<HTMLElement>(".reveal");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduce || !("IntersectionObserver" in window)) {
  items.forEach((el) => el.classList.add("is-visible"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        // Stagger siblings slightly for a softer cascade.
        const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains("reveal")) : [];
        el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 70}ms`;
        el.classList.add("is-visible");
        io.unobserve(el);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  items.forEach((el) => io.observe(el));
}
