"use client"

import {
  Audiotrack,
  PlayArrow,
  PlayCircleFilled,
  SkipNext,
  SkipPrevious,
  Stop,
} from "@mui/icons-material"
import {
  Avatar,
  Box,
  Card,
  IconButton,
  SxProps,
  Theme,
  Typography,
  alpha,
} from "@mui/material"
import { usePlayerStore } from "../stores/player-store"
import { useFileStore } from "../stores/file-store"
import { useThemeStore } from "../stores/theme-store"
import {
  MaterialDynamicColors,
  hexFromArgb,
} from "@material/material-color-utilities"
import { useEffect, useMemo, useRef, useState } from "react"
import * as mm from "music-metadata-browser"
import { Variant } from "@mui/material/styles/createTypography"

interface MiniPlayerProps {
  sx?: SxProps<Theme>
}

const MarqueeText = ({
  text,
  variant,
  color,
}: {
  text: string
  variant?: Variant
  color?: string
}) => {
  const textRef = useRef<HTMLSpanElement>(null)
  const [scrollAmount, setScrollAmount] = useState(0)
  const updateScrollAmount = () => {
    console.log("XXXX")
    const offsetWidth = textRef.current?.offsetWidth
    const scrollWidth = textRef.current?.scrollWidth
    if (offsetWidth && scrollWidth) {
      setScrollAmount(offsetWidth - scrollWidth)
    }
  }
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === textRef.current) {
          updateScrollAmount()
        }
      }
    })

    if (textRef.current) {
      observer.observe(textRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    updateScrollAmount()
  }, [text])

  useEffect(() => {
    const style = textRef.current?.style
    if (!style) return
    style.left = `${scrollAmount}px`
    style.animation = `marquee 10s ease-in-out infinite alternate`
    // console.log("scrollAmount", scrollAmount)
  }, [scrollAmount])

  return (
    <Box
      // variant="body1"
      sx={{ overflow: "hidden" }}
    >
      <Typography
        ref={textRef}
        color={color}
        variant={variant}
        sx={{
          position: "relative",
          // position: "absolute",
          whiteSpace: "nowrap",
          // overflow: "hidden",
          // textOverflow: "ellipsis",
          // animation: `marquee 10s ease-in-out infinite alternate`,
          "@keyframes marquee": {
            // "0%": { left: "0" },
            from: { left: "0" },
            // "0%": { transform: "translateX(0)" },
            // "100%": { transform: `translateX(${scrollAmount}px)` },
          },
        }}
      >
        {text}
      </Typography>
    </Box>
  )
}

export const MiniPlayer = (props: MiniPlayerProps) => {
  const [playerState, playerActions] = usePlayerStore()
  const [themeStoreState] = useThemeStore()
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined)

  const activeTrack = playerState.activeTrack

  const title =
    activeTrack?.file.metadata?.common.title ||
    activeTrack?.file.name ||
    "No track playing"

  useEffect(() => {
    if (coverUrl) {
      URL.revokeObjectURL(coverUrl)
    }

    const cover = mm.selectCover(activeTrack?.file.metadata?.common.picture)
    let url: string | undefined
    if (cover) {
      url = URL.createObjectURL(new Blob([cover.data], { type: cover.format }))
    }
    setCoverUrl(url)

    return () => {
      if (coverUrl) {
        URL.revokeObjectURL(coverUrl)
      }
    }
  }, [activeTrack?.file.metadata?.common.picture])

  return (
    <Card
      sx={{
        ...props.sx,
        backdropFilter: "blur(10px)",
        backgroundColor: alpha(
          hexFromArgb(
            MaterialDynamicColors.surfaceContainerHigh.getArgb(
              themeStoreState.scheme
            )
          ),
          0.1
        ),
        display: "flex",
        p: 2,
        m: 1,
        alignItems: "center",
      }}
    >
      <Avatar
        src={coverUrl}
        variant="rounded"
        sx={{
          mr: 2,
        }}
      >
        {coverUrl ? null : <Audiotrack />}
      </Avatar>
      <Box sx={{ flexGrow: 1, minWidth: "0" }}>
        <MarqueeText
          text={title}
          color={hexFromArgb(
            MaterialDynamicColors.onSurface.getArgb(themeStoreState.scheme)
          )}
        />
        <MarqueeText
          text={activeTrack?.file.metadata?.common.artist || ""}
          color={hexFromArgb(
            MaterialDynamicColors.onSurfaceVariant.getArgb(
              themeStoreState.scheme
            )
          )}
        />
      </Box>
      <IconButton>
        <SkipPrevious />
      </IconButton>
      <IconButton
        sx={{
          backgroundColor: hexFromArgb(
            MaterialDynamicColors.tertiaryContainer.getArgb(
              themeStoreState.scheme
            )
          ),
          "&:hover": {
            backgroundColor: hexFromArgb(
              MaterialDynamicColors.tertiaryContainer.getArgb(
                themeStoreState.scheme
              )
            ),
          },
        }}
        onClick={() => {
          if (playerState.isPlaying) {
            playerActions.pause()
          } else {
            playerActions.play()
          }
        }}
      >
        {playerState.isPlaying ? <Stop /> : <PlayArrow />}
      </IconButton>
      <IconButton
        onClick={() => {
          playerActions.playNextTrack()
        }}
      >
        <SkipNext />
      </IconButton>
    </Card>
  )
}
