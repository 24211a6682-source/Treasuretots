import { useState, useEffect, useRef, useCallback } from "react";
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
  const count = books.length;

  const prev = useCallback(() => setCurrent(c => (c - 1 + count) % count), [count]);
  const next = useCallback(() => setCurrent(c => (c + 1) % count), [count]);

  // Reset on book list change (filter)
  useEffect(() => { setCurrent(0); }, [books]);

  // Auto-advance every 5s
  useEffect(() => {
    if (isPaused || count <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [isPaused, next, count]);

  // Keyboard navigation
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

  const cardW = mini ? 160 : 240;
  const cardH = mini ? 213 : 320;
  const containerH = cardH + (mini ? 72 : 88);
  // Horizontal offset for side cards from center
  const sideOffset = mini ? cardW * 0.72 : cardW * 0.82;

  return (
    <div
      className="relative select-none w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 3D Stage */}
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
                transition: "all 0.4s ease",
                cursor: isCenter ? "pointer" : "pointer",
                transformOrigin: "center center",
              }}
            >
              {/* Book card */}
              <div
                className={`rounded-2xl overflow-hidden ${
                  isCenter
                    ? "shadow-2xl shadow-orange-200/60 ring-1 ring-orange-100"
                    : "shadow-lg"
                }`}
              >
                <img
                  src={book.coverImage}
                  alt={book.name}
                  draggable={false}
                  style={{ width: `${cardW}px`, height: `${cardH}px`, objectFit: "cover", display: "block" }}
                />
              </div>

              {/* Book info below */}
              <div className="mt-2 px-1 text-center">
                <Badge
                  variant="secondary"
                  className={`text-[10px] capitalize mb-1 ${CATEGORY_COLORS[book.storyCategory] ?? ""}`}
                >
                  {book.storyCategory}
                </Badge>
                <p
                  className={`font-semibold leading-tight text-gray-900 ${
                    mini ? "text-xs" : "text-sm"
                  }`}
                >
                  {book.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrow buttons */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-0 top-0 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all z-20 border border-gray-100"
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

      {/* Dot indicators */}
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
