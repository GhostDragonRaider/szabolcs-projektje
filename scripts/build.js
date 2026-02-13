import * as esbuild from "esbuild"
import { mkdirSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const outDir = join(root, "dist")
const watch = process.argv.includes("--watch")

mkdirSync(outDir, { recursive: true })

const html = `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Project1</title>
</head>
<body>
  <div id="root"></div>
  <script src="/main.js"></script>
</body>
</html>
`
writeFileSync(join(outDir, "index.html"), html)

const ctx = await esbuild.context({
  entryPoints: [join(root, "src", "main.tsx")],
  bundle: true,
  outfile: join(outDir, "main.js"),
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  jsx: "automatic",
  jsxImportSource: "@emotion/react",
  define: {
    // Üres = relatív /api (proxy a serve.js-ben továbbítja 8000-re); így nincs CORS, egy origin.
    "process.env.VITE_API_URL": JSON.stringify(
      process.env.VITE_API_URL ?? ""
    ),
  },
  loader: {
    ".tsx": "tsx",
    ".ts": "ts",
    ".json": "json",
    ".png": "dataurl",
    ".jpg": "dataurl",
    ".jpeg": "dataurl",
    ".gif": "dataurl",
    ".svg": "dataurl",
    ".webp": "dataurl",
  },
})

if (watch) {
  await ctx.rebuild()
  await ctx.watch()
  console.log("Watching for changes... (dist/main.js)")
} else {
  await ctx.rebuild()
  ctx.dispose()
  console.log("Build done: dist/main.js")
}
