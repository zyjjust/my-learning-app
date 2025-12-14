# 背景图上传功能使用指南

## 功能说明

现在应用支持自定义背景图上传功能，默认使用哆啦A梦卡通形象作为背景。

## 功能特点

- ✅ 支持上传自定义背景图片
- ✅ 自动保存到 Supabase Storage（已登录用户）
- ✅ 本地存储备份（localStorage）
- ✅ 默认使用哆啦A梦背景图
- ✅ 支持 JPG、PNG、WebP 等图片格式
- ✅ 最大文件大小：10MB

## 使用步骤

### 1. 运行数据库迁移（必需）

在 Supabase SQL Editor 中运行以下脚本，添加 `background_image_url` 字段：

```sql
-- 文件位置：database/add-background-image-field.sql
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS background_image_url TEXT;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_login_date DATE;
```

### 2. 创建 Supabase Storage Bucket（可选，推荐）

如果希望背景图永久保存，需要在 Supabase 中创建存储桶：

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目
3. 进入 **Storage** 页面
4. 点击 **New bucket**
5. 输入名称：`backgrounds`
6. 设置为 **Public bucket**（公开访问）
7. 点击 **Create bucket**

**注意：** 如果不创建存储桶，背景图会使用 base64 格式保存在数据库中，文件较大时可能影响性能。

### 3. 使用背景图上传功能

1. **登录应用**
2. **点击右上角的"主题"按钮**
3. **选择"更换背景"选项**
4. **选择您想要上传的图片文件**
5. **等待上传完成**

上传成功后，背景图会立即更新，并自动保存。

## 默认背景图

应用默认使用哆啦A梦卡通形象作为背景图。如果您想更换为其他图片，只需使用上传功能即可。

## 图片要求

- **推荐尺寸**：1920x1080 或更高
- **格式**：JPG、PNG、WebP
- **文件大小**：最大 10MB
- **建议**：使用横向（宽屏）图片效果最佳

## 技术实现

### 存储方式

1. **已登录用户**：
   - 优先上传到 Supabase Storage（`backgrounds` bucket）
   - 同时保存 URL 到数据库 `users.background_image_url` 字段
   - 备份到 localStorage

2. **未登录用户**：
   - 使用 base64 格式保存到 localStorage
   - 仅在当前浏览器有效

### 加载优先级

1. localStorage 中的背景图（最快）
2. Supabase 数据库中的背景图
3. 默认哆啦A梦背景图

## 故障排除

### 问题 1：上传后背景图不显示

**解决方案：**
- 检查浏览器控制台是否有错误
- 确认图片格式是否正确
- 检查文件大小是否超过 10MB

### 问题 2：背景图上传失败

**解决方案：**
- 确认 Supabase Storage bucket `backgrounds` 已创建
- 检查 Supabase Storage 权限设置
- 如果 Storage 不可用，系统会自动使用 base64 格式

### 问题 3：背景图在刷新后丢失

**解决方案：**
- 确认已登录（未登录用户只能使用 localStorage）
- 检查数据库字段是否已添加
- 查看浏览器是否禁用了 localStorage

## 数据库字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `background_image_url` | TEXT | 用户自定义背景图片 URL |
| `last_login_date` | DATE | 最后登录日期（用于计算连续登录） |

## 注意事项

- 背景图会占用一定的存储空间
- 建议使用压缩后的图片以提升加载速度
- 如果使用 Supabase Storage，注意存储配额限制
- 背景图 URL 应该是可公开访问的

---

**享受您的个性化学习应用！** 🎨✨
