"use client"

import { AudioPlayer } from "@/src/audio/audio-player"
import { MiniPlayer } from "@/src/components/mini-player"
import { FileStoreProvider } from "@/src/stores/file-store"
import { PlayerStoreProvider, usePlayerStore } from "@/src/stores/player-store"
import { DynamicBackground } from "@/src/components/dynamic-background"
import { Box, styled } from "@mui/material"
import { MaterialDesignContent, SnackbarProvider } from "notistack"
import { NetworkMonitorProvider } from "@/src/stores/network-monitor"
import { RouterProvider } from "@/src/router"
import { useEffect, useRef, useState } from "react"
import { useThemeStore } from "@/src/stores/theme-store"
import * as mm from "music-metadata-browser"
import {
  DynamicThemeStoreProvider,
  useDynamicThemeStore,
} from "@/src/stores/dynamic-theme-store"

const ThemeChanger = () => {
  const [playerState] = usePlayerStore()
  const [theme, themeActions] = useThemeStore()
  const themeActionsRef = useRef(themeActions)
  themeActionsRef.current = themeActions

  useEffect(() => {
    if (!playerState.activeTrack) return
    if (playerState.isActiveTrackLoading) return

    const cover = mm.selectCover(
      playerState.activeTrack.file.metadata?.common.picture
    )
    if (cover) {
      const url = URL.createObjectURL(
        new Blob([cover.data], { type: cover.format })
      )

      themeActionsRef.current.applyThemeFromImage(url)

      return () => URL.revokeObjectURL(url)
    }
  }, [playerState.activeTrack, playerState.isActiveTrackLoading])

  return null
}

// const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
//   '&.notistack-MuiContent-success': {
//     backgroundColor: '#2D7738',
//   },
//   '&.notistack-MuiContent-error': {
//     backgroundColor: '#970C0C',
//   },
// }));

export function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .then(registration => {
            console.log("SW registered: ", registration)
          })
          .catch(registrationError => {
            console.log("SW registration failed: ", registrationError)
          })
      })
    }
  }, [])

  return (
    <SnackbarProvider
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      classes={{
        containerAnchorOriginBottomLeft: "snackbar-container",
      }}
      // Components={{
      //   success: StyledMaterialDesignContent,
      //   error: StyledMaterialDesignContent,
      // }}
    >
      <RouterProvider>
        <NetworkMonitorProvider>
          <FileStoreProvider>
            <PlayerStoreProvider>
              <DynamicThemeStoreProvider>
                <ThemeChanger />
                <DynamicBackground />
                <AudioPlayer />
                {/* <StatusBar /> */}
                <Box
                  sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    mt: 4,
                    mb: 10,
                  }}
                >
                  {children}
                </Box>
                <MiniPlayer
                  sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
                />
              </DynamicThemeStoreProvider>
            </PlayerStoreProvider>
          </FileStoreProvider>
        </NetworkMonitorProvider>
      </RouterProvider>
    </SnackbarProvider>
  )
}
