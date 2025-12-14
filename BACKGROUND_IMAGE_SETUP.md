# 背景图片设置说明

## 当前配置

页面已配置为使用哆啦A梦（Doraemon）背景图片作为默认背景。用户可以通过上传功能自定义背景图片。

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

当前使用的默认背景图片是哆啦A梦相关的壁纸。如果图片无法加载，页面会显示渐变背景作为备用。

## 上传自定义背景图片

用户可以通过以下方式上传自定义背景图片：

1. **通过主题菜单上传**：
   - 点击右上角的用户头像
   - 在弹出的菜单中点击"更换背景"
   - 选择要上传的图片文件（支持 JPG、PNG、WebP 等格式）
   - 图片会自动上传并设置为背景

2. **图片存储方式**：
   - 已登录用户：图片会上传到 Supabase Storage 的 `backgrounds` bucket，并保存 URL 到数据库
   - 未登录用户：图片会以 base64 格式保存在 localStorage 中

3. **图片要求**：
   - 文件大小：不超过 10MB
   - 推荐尺寸：1920x1080 或更高分辨率
   - 格式：JPG、PNG、WebP 等常见图片格式

4. **背景图持久化**：
   - 已登录用户的背景图会保存到数据库，下次登录时自动加载
   - 未登录用户的背景图保存在浏览器 localStorage 中

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


