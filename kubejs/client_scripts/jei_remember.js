// ===== JEI Remember =====
// Makes JEI remember whether its item list (Ctrl+O) was shown or hidden, across restarts.
// JEI's official API can only READ this state, so this uses JEI's internal toggle.
// If a JEI update renames it, this script just stops doing anything (no crash) and
// logs one line. Delete this file to remove it.

const JEI_SAVE_FILE = 'kubejs/config/jei_overlay.json'
const JEI_CHECK_EVERY = 20 // ticks (20 = once a second)

let jeiState = null      // JEI's internal toggle state, once it's ready
let jeiGaveUp = false    // stop trying if JEI's internals aren't there
let jeiRestored = false  // applied the saved state yet?
let jeiLastSaved = null  // last value written to the file
let jeiTicks = 0

function jeiReadSaved() {
  try {
    let data = JsonIO.read(JEI_SAVE_FILE)
    if (data && data.overlayEnabled != null) return data.overlayEnabled == true
  } catch (e) { }
  return null // no file yet
}

function jeiWriteSaved(value) {
  try {
    JsonIO.write(JEI_SAVE_FILE, { overlayEnabled: value })
    jeiLastSaved = value
  } catch (e) {
    console.warn('[JEI Remember] Could not save state: ' + e)
  }
}

ClientEvents.tick(event => {
  if (jeiGaveUp) return
  if (++jeiTicks < JEI_CHECK_EVERY) return
  jeiTicks = 0

  // Wait until JEI has started, then grab its toggle state.
  if (jeiState == null) {
    try {
      jeiState = Java.loadClass('mezz.jei.common.Internal').getClientToggleState()
    } catch (e) {
      let msg = String(e)
      // JEI not finished loading yet -> try again next second.
      // Class/method missing (JEI changed) -> give up quietly.
      if (msg.indexOf('ClassNotFound') >= 0 || msg.indexOf('NoSuchMethod') >= 0 || msg.indexOf('not found') >= 0 || msg.indexOf('not allowed') >= 0 || msg.indexOf('denied') >= 0) {
        jeiGaveUp = true
        console.warn('[JEI Remember] JEI internals not found, disabled: ' + msg)
      }
      return
    }
    if (jeiState == null) return
  }

  try {
    let current = jeiState.isOverlayEnabled() == true

    // First time: put JEI back the way you left it.
    if (!jeiRestored) {
      jeiRestored = true
      let saved = jeiReadSaved()
      if (saved != null && saved != current) {
        jeiState.toggleOverlayEnabled()
        current = saved
      }
      jeiLastSaved = current
      if (saved == null) jeiWriteSaved(current)
      return
    }

    // After that: save whenever you press Ctrl+O.
    if (current != jeiLastSaved) jeiWriteSaved(current)
  } catch (e) {
    jeiGaveUp = true
    console.warn('[JEI Remember] Stopped after an error: ' + e)
  }
})
