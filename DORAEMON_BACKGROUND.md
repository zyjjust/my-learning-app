# 哆啦A梦背景图功能说明

## ✅ 已完成的功能

### 1. 默认背景图
- ✅ 已将默认背景图设置为哆啦A梦相关壁纸
- ✅ 登录页面和主页面都使用哆啦A梦背景
- ✅ 如果默认图片无法加载，会显示渐变背景作为备用

### 2. 背景图上传功能
- ✅ 用户可以通过上传功能自定义背景图片
- ✅ 上传入口：点击右上角"主题"按钮 → 选择"更换背景"
- ✅ 支持多种图片格式：JPG、PNG、WebP 等
- ✅ 文件大小限制：最大 10MB

### 3. 背景图存储
- ✅ **已登录用户**：
  - 图片上传到 Supabase Storage 的 `backgrounds` bucket
  - 背景图 URL 保存到数据库 `users.background_image_url` 字段
  - 下次登录时自动加载保存的背景图
  
- ✅ **未登录用户**：
  - 图片以 base64 格式保存在浏览器 localStorage 中
  - 刷新页面后仍然保留

### 4. 数据库支持
- ✅ `users` 表已包含 `background_image_url` 字段
- ✅ 如果字段不存在，可以运行 `database/add-background-image-field.sql` 添加

## 📝 使用方法

### 上传背景图
1. 登录应用
2. 点击右上角的"主题"按钮（调色板图标）
3. 在下拉菜单中点击"更换背景"
4. 选择要上传的图片文件
5. 图片会自动上传并设置为背景

### 恢复默认背景
如果需要恢复默认的哆啦A梦背景：
1. 清除浏览器的 localStorage（开发者工具 → Application → Local Storage → 清除 `backgroundImageUrl`）
2. 或者上传一张新的哆啦A梦图片

## 🔧 技术实现

### 默认背景图 URL
```typescript
const defaultDoraemonBg = 'https://wallpaperaccess.com/full/1102715.jpg'
```

### 上传处理流程
1. 用户选择图片文件
2. 验证文件类型和大小
3. 如果已登录：
   - 上传到 Supabase Storage
   - 获取公共 URL
   - 保存到数据库
4. 如果未登录：
   - 转换为 base64
   - 保存到 localStorage
5. 更新页面背景

### 背景图加载优先级
1. localStorage 中保存的背景图（最快）
2. 数据库中的背景图（已登录用户）
3. 默认哆啦A梦背景图

## 📋 数据库设置

如果您的 Supabase 数据库中还没有 `background_image_url` 字段，请运行：

```sql
-- 在 Supabase SQL Editor 中运行
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS background_image_url TEXT;
```

## 🎨 自定义背景图建议

- **推荐尺寸**：1920x1080 或更高
- **文件格式**：JPG、PNG、WebP
- **文件大小**：建议小于 2MB（最大 10MB）
- **图片内容**：建议使用明亮、清晰的图片，避免过于复杂的图案

## ⚠️ 注意事项

1. **Supabase Storage 设置**：
   - 确保在 Supabase 中创建了 `backgrounds` bucket
   - 设置 bucket 为公开访问（如果需要）
   - 或者配置适当的访问策略

2. **图片加载**：
   - 如果使用外部图片 URL，确保图片可公开访问
   - 建议使用 HTTPS 协议的图片 URL

3. **性能考虑**：
   - 大图片会影响加载速度
   - 建议压缩图片后再上传
   - base64 格式的图片会增加 localStorage 大小

## 🚀 未来改进建议

- [ ] 添加图片裁剪功能
- [ ] 支持从 URL 直接设置背景图
- [ ] 提供预设背景图选择
- [ ] 添加背景图预览功能
- [ ] 支持背景图模糊度调整
























