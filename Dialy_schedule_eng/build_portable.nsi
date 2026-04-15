; ── Daily Schedule - Single-file Portable Builder ──────────────────
Unicode True

!define APP_NAME     "Daily Schedule"
!define EXE_NAME     "Daily_schedule_v1.6-win_x64.exe"
!define OUT_NAME     "Daily_schedule_v1.6.exe"
!define SRC_DIR      "dist\Daily_schedule_v1.6"

Name "${APP_NAME}"
OutFile "${OUT_NAME}"
Icon "C:\Xcode\Dialy_schedule\dialy.ico"
RequestExecutionLevel user
SilentInstall silent

; 解压到用户临时目录下固定子目录（保证 localStorage 数据持久）
InstallDir "$LOCALAPPDATA\Daily_schedule_v1.6"

!include "LogicLib.nsh"

Section
  SetOutPath "$INSTDIR"
  ; 嵌入两个文件
  File "${SRC_DIR}\${EXE_NAME}"
  File "${SRC_DIR}\resources.neu"

  ; 启动主程序（异步，不阻塞）
  Exec '"$INSTDIR\${EXE_NAME}"'
SectionEnd
