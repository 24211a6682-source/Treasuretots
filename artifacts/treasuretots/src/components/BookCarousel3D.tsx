import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { StorybookData } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  mythology: "bg-orange-100 text-orange-800",
  adventure: "bg-blue-100 text-blue-800",
  princess: "bg-pink-100 text-pink-800",
  superhero: "bg-red-100 text-red-800",
  anime: "bg-purple-100 text-purple-800",
  sports: "bg-green-100 text-green-800",
  career: "bg-yellow-100 text-yellow-800",
};

interface BookCarousel3DProps {
  books: StorybookData[];
  mini?: boolean;
}

export function BookCarousel3D({ books, mini = false }: BookCarousel3DProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [, navigate] = useLocation();
  const touchStartX = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [availW, setAvailW] = useState(0);
  const count = books.length;

  const prev = useCallback(() => setCurrent(c => (c - 1 + count) % count), [count]);
  const next = useCallback(() => setCurrent(c => (c + 1) % count), [count]);

  useEffect(() => { setCurrent(0); }, [books]);

  // Measure the available width so the 3D stage (fixed-size cards + side
  // offsets) can scale to fit narrow viewports instead of overflowing the page.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setAvailW(el.clientWidth);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (isPaused || count <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [isPaused, next, count]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 50) prev();
    else if (dx < -50) next();
    touchStartX.current = null;
    setIsPaused(false);
  };

  const handleCardClick = (offset: number, slug: string) => {
    if (offset === 0) {
      navigate(`/storybooks/${slug}`);
    } else {
      setCurrent(c => (c + offset + count) % count);
    }
  };

  // Ideal (desktop) card size, scaled down to fit the measured width. The side
  // cards sit at `offsetRatio` of a card width from centre and are drawn at
  // 0.75 scale, so their outer edge reaches `cardW * (offsetRatio + 0.375)`
  // from the stage centre — that must stay within half the available width.
  const maxCardW = mini ? 180 : 340;
  const minCardW = mini ? 90 : 120;
  const offsetRatio = mini ? 0.72 : 0.88;
  const extentFactor = offsetRatio + 0.375;
  // Before the first measurement (availW === 0) fall back to the SMALLEST size,
  // not the largest: a provisional max-width card overflows narrow viewports for
  // one frame on load, which latches fixed/`w-full` elements (toaster, FAB) to a
  // widened layout viewport. useLayoutEffect corrects the size before paint, so
  // desktop never flashes small.
  const fitCardW = availW > 0 ? (availW / 2 - 12) / extentFactor : minCardW;
  const cardW = Math.max(minCardW, Math.min(maxCardW, Math.round(fitCardW)));
  const cardH = Math.round(cardW * 1.332);
  const containerH = cardH + (mini ? 72 : 100);
  const sideOffset = cardW * offsetRatio;

  return (
    <div
      ref={wrapRef}
      className="relative select-none w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="relative mx-auto overflow-visible"
        style={{
          perspective: "1200px",
          height: `${containerH}px`,
          maxWidth: `${sideOffset * 2 + cardW + 80}px`,
        }}
      >
        {[-1, 0, 1].map(offset => {
          const idx = (current + offset + count) % count;
          const book = books[idx];
          if (!book) return null;

          const isCenter = offset === 0;
          const rotateY = offset === -1 ? "rotateY(25deg)" : offset === 1 ? "rotateY(-25deg)" : "rotateY(0deg)";
          const scale = isCenter ? "scale(1)" : "scale(0.75)";
          const opacity = isCenter ? 1 : 0.65;
          const zIndex = isCenter ? 10 : 5;
          const translateX = `translateX(calc(-50% + ${offset * sideOffset}px))`;

          return (
            <div
              key={`slot-${offset}`}
              onClick={() => handleCardClick(offset, book.slug)}
              className="absolute top-0"
              style={{
                left: "50%",
                width: `${cardW}px`,
                transform: `${translateX} ${scale} ${rotateY}`,
                opacity,
                zIndex,
                // Animate only the carousel motion (transform/opacity). Never
                // animate layout (width/left): on first mount the card settles
                // from its provisional size to the measured fit, and animating
                // width there causes a transient horizontal overflow flicker.
                transition: "transform 0.4s ease, opacity 0.4s ease",
                cursor: "pointer",
                transformOrigin: "center center",
              }}
            >
              <div
                className={`rounded-2xl overflow-hidden bg-white ${
                  isCenter
                    ? "shadow-2xl shadow-orange-200/60 ring-1 ring-orange-100"
                    : "shadow-lg"
                }`}
              >
                <img
                  src={book.coverImage}
                  alt={book.name}
                  draggable={false}
                  style={{ width: `${cardW}px`, height: `${cardH}px`, objectFit: "contain", display: "block" }}
                />
              </div>

              <div className="mt-2 px-1 text-center">
                <Badge
                  variant="secondary"
                  className={`text-[10px] capitalize mb-1 ${CATEGORY_COLORS[book.storyCategory] ?? ""}`}
                >
                  {book.storyCategory}
                </Badge>
                <p className={`font-semibold leading-tight text-gray-900 ${mini ? "text-xs" : "text-sm"}`}>
                  {book.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-0 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all z-20 border border-gray-100"
        style={{ top: `${(containerH - 80) / 2}px` }}
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-0 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all z-20 border border-gray-100"
        style={{ top: `${(containerH - 80) / 2}px` }}
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>

      {!mini && (
        <div className="flex justify-center gap-1.5 mt-4">
          {books.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to book ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-5 bg-primary" : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
