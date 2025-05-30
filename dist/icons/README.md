# PWA Icon Generation Guide  
**智慧圆觉 · 佛学修行助手**

本文件说明如何从现有 `icon.svg` 生成 Progressive Web App 所需的多尺寸 PNG 图标，并放置到 `public/icons/` 目录下。

---

## 📐 需要的尺寸一览

| 用途 | 尺寸 (像素) | 文件名 (建议) |
| ---- | ----------- | ------------- |
| PWA Manifest – 标准 | 72×72 | `icon-72x72.png` |
| | 96×96 | `icon-96x96.png` |
| | 128×128 | `icon-128x128.png` |
| | 144×144 | `icon-144x144.png` |
| | 152×152 | `icon-152x152.png` |
| | 192×192 | `icon-192x192.png` |
| | 384×384 | `icon-384x384.png` |
| | 512×512 | `icon-512x512.png` |
| iOS / iPadOS 可选 | 167×167 | `icon-167x167.png` |
| | 180×180 | `icon-180x180.png` |
| Badge 可选 | 72×72 | `badge-72x72.png` |

> 如果需要更多尺寸，可在此基础上自行添加并在 `manifest.json` 中引用。

---

## 🛠️ 生成图标的方法

### 1. 在线工具（零安装）

1. 打开 **[RealFaviconGenerator](https://realfavicongenerator.net/)**  
2. 选择 *SVG* 模式上传 `icon.svg`  
3. 在 *Favicon Generator Options* 中取消除 *Android*、*PWA* 以外的多余平台  
4. 点击 **Generate**，下载生成包  
5. 将生成的各尺寸 PNG 重命名/移动到 `public/icons/` 目录

**其它在线工具**  
- [Squoosh](https://squoosh.app/) – 支持 SVG→PNG 并可调压缩  
- [SVG to PNG Converter](https://svg2png.com/) – 批量转换

### 2. 本地命令行（Inkscape / ImageMagick）

```bash
# 使用 Inkscape 批量导出（示例尺寸 192 和 512）
inkscape icon.svg -o icon-192x192.png -w 192 -h 192
inkscape icon.svg -o icon-512x512.png -w 512 -h 512

# 使用 ImageMagick (须先将 SVG 转成 1024px PNG 再缩放)
convert -background none icon.svg -resize 1024x1024 icon-1024.png
convert icon-1024.png -resize 192x192 icon-192x192.png
```

> 建议先导出 **1024×1024** 的中间 PNG，再逐尺寸缩放，可保持形状锐利。

---

## 📂 放置文件

```
public/
└─ icons/
   ├─ icon.svg               # 源文件
   ├─ icon-72x72.png
   ├─ icon-96x96.png
   ├─ ……
   └─ icon-512x512.png
```

- 生成后无需修改代码，`manifest.json` 已预先配置好对应文件名  
- 若新增尺寸，请同步更新 `manifest.json` 的 `icons` 列表

---

## 🔄 更新后记得

1. 重新执行 `npm run build` 生成新的 PWA 产物  
2. 将更新后的 `public/icons/*`、`manifest.json` 推送至 GitHub  
3. 若使用 Tauri 打包桌面版，可同时替换 `src-tauri/icons/` 中的图标保持一致

---

愿此项目利益一切有情，圆满菩提！🙏
