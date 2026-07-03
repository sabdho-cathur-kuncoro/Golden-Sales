const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

// Source image for the notification small icon.
// NOTE: Android masks the small icon by ALPHA — only the silhouette shows,
// tinted white/accent. A full-color PNG becomes a solid white square. Use a
// transparent monochrome asset for a clean result.
const SOURCE = "./assets/ic_notification.png";

// Written via a dangerous mod so `prebuild --clean` regenerates it instead of
// wiping a hand-placed res file. display.ts uses `smallIcon: "ic_notification"`.
module.exports = function withNotificationIcon(config) {
  return withDangerousMod(config, [
    "android",
    (cfg) => {
      const src = path.join(cfg.modRequest.projectRoot, SOURCE);
      const drawableDir = path.join(
        cfg.modRequest.platformProjectRoot,
        "app/src/main/res/drawable"
      );
      fs.mkdirSync(drawableDir, { recursive: true });
      // Drop any prior vector variant — same name = duplicate resource error.
      fs.rmSync(path.join(drawableDir, "ic_notification.xml"), { force: true });
      fs.copyFileSync(src, path.join(drawableDir, "ic_notification.png"));
      return cfg;
    },
  ]);
};
