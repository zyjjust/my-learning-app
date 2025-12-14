# 背景图片设置说明

## 当前配置

页面已配置为使用疯狂动物城（Zootopia）背景图片。

## 更换背景图片

### 方法 1：直接修改代码

在 `app/page.tsx` 文件中，找到以下位置并修改 `backgroundImage` URL：

**主页面背景（约第688行）：**
```typescript
backgroundImage: 'url(https://wallpaperaccess.com/full/1102715.jpg)',
```

**登录页面背景（约第655行）：**
```typescript
backgroundImage: 'url(https://wallpaperaccess.com/full/1102715.jpg)',
```

### 方法 2：使用环境变量（推荐）

1. 在 `app/page.tsx` 顶部添加：
```typescript
const BACKGROUND_IMAGE_URL = process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_URL || 'https://wallpaperaccess.com/full/1102715.jpg'
```

2. 在 `.env.local` 文件中添加：
```env
NEXT_PUBLIC_BACKGROUND_IMAGE_URL=你的图片URL
```

3. 在代码中使用：
```typescript
backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
```

## 图片要求

- **推荐尺寸**：1920x1080 或更高
- **格式**：JPG、PNG、WebP
- **文件大小**：建议小于 2MB，以确保加载速度

## 图片来源推荐

1. **免费图片网站**：
   - Unsplash: https://unsplash.com
   - Pexels: https://www.pexels.com
   - Pixabay: https://pixabay.com

2. **壁纸网站**：
   - WallpaperAccess: https://wallpaperaccess.com
   - Wallpaper Abyss: https://wall.alphacoders.com

3. **自托管**：
   - 将图片放在 `public/images/` 目录
   - 使用相对路径：`url(/images/zootopia-bg.jpg)`

## 当前背景图片说明

当前使用的背景图片来自 WallpaperAccess，展示疯狂动物城的场景。如果图片无法加载，页面会显示渐变背景作为备用。

## 调整背景遮罩层

如果需要调整背景图片的透明度或颜色遮罩，修改以下代码：

```typescript
<div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-cyan-900/40 to-green-900/50 ..."></div>
```

- 调整透明度：修改 `/50`、`/40` 等数值（0-100）
- 调整颜色：修改 `from-blue-900`、`via-cyan-900` 等颜色类

## 注意事项

- 确保图片URL可公开访问
- 使用 HTTPS 协议的图片URL
- 考虑图片加载速度，避免使用过大的图片
- 在深色模式下，可能需要调整遮罩层透明度


