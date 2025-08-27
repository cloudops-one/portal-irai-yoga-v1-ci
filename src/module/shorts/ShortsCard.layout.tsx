import React, { useEffect, useRef, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import ShortsType from "./Shorts.types";
import ShortCard from "./ShortsCard.view";

interface ShortsCardLayoutProps {
  shorts: ShortsType[];
  activeShortId: string | null;
  setActiveShortId: (id: string) => void;
  onEdit: (shortsId: string) => void;
  onDelete: (shortsId: string) => void;
  fetchMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  getShortBannerUrl: (short: ShortsType) => string;
  refetch: () => void;
}

const ShortsCardLayout: React.FC<ShortsCardLayoutProps> = ({
  shorts,
  activeShortId,
  setActiveShortId,
  onEdit,
  onDelete,
  fetchMore,
  hasMore,
  isLoading,
  containerRef,
  getShortBannerUrl,
  refetch,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isFetching, setIsFetching] = useState(false);
  useEffect(() => {
    if (!sentinelRef.current || !containerRef.current || isLoading || !hasMore)
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setIsFetching(true);
          fetchMore();
        }
      },
      {
        root: containerRef.current,
        rootMargin: "100px",
        threshold: 0.01,
      },
    );
    observer.observe(sentinelRef.current);
    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [isLoading, hasMore, fetchMore, isFetching]);

  useEffect(() => {
    if (!isLoading) {
      setIsFetching(false);
    }
  }, [isLoading]);
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 1,
        padding: 1,
        position: "relative",
        minHeight: "100px",
      }}
    >
      {shorts.map((short, index) => (
        <Box key={`${short.shortsId}-${index}`}>
          <ShortCard
            short={short}
            isActive={activeShortId === short.shortsId}
            onEdit={() => onEdit(short.shortsId)}
            onDelete={() => onDelete(short.shortsId)}
            onActivate={() => setActiveShortId(short.shortsId)}
            getShortBannerUrl={getShortBannerUrl}
            refetch={refetch}
          />
        </Box>
      ))}
      <div ref={sentinelRef} style={{ height: "2px" }} />
      {(isLoading || isFetching) && (
        <Box
          sx={{
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "center",
            padding: 2,
          }}
        >
          <CircularProgress color="success" />
        </Box>
      )}
    </Box>
  );
};

export default ShortsCardLayout;
