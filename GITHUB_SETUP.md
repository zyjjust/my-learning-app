# GitHub 配置指南

## 在 Cursor 中配置 GitHub

### 1. 检查当前 Git 配置

您的 Git 用户信息已经配置：
- 用户名：zyjjust
- 邮箱：zyjjust@gmail.com

### 2. 配置 GitHub 远程仓库

#### 方法一：通过命令行添加远程仓库

如果您已经在 GitHub 上创建了仓库，使用以下命令添加远程仓库：

```bash
# 添加 GitHub 远程仓库（将 YOUR_USERNAME 和 YOUR_REPO 替换为实际值）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 或者使用 SSH（如果您已配置 SSH 密钥）
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
```

#### 方法二：在 Cursor 中通过 UI 配置

1. 点击 Cursor 左侧的源代码管理图标（或按 `Ctrl+Shift+G`）
2. 点击右上角的 `...` 菜单
3. 选择 "Remote" > "Add Remote"
4. 输入远程名称（通常是 `origin`）
5. 输入 GitHub 仓库 URL

### 3. 配置 GitHub 认证

#### 使用 Personal Access Token (推荐)

1. 访问 GitHub：https://github.com/settings/tokens
2. 点击 "Generate new token" > "Generate new token (classic)"
3. 设置权限（至少需要 `repo` 权限）
4. 复制生成的 token
5. 在 Cursor 中推送代码时，使用 token 作为密码

#### 使用 SSH 密钥（更安全）

1. 生成 SSH 密钥（如果还没有）：
   ```bash
   ssh-keygen -t ed25519 -C "zyjjust@gmail.com"
   ```

2. 将公钥添加到 GitHub：
   - 复制 `~/.ssh/id_ed25519.pub` 的内容
   - 访问 https://github.com/settings/keys
   - 点击 "New SSH key"
   - 粘贴公钥并保存

3. 测试连接：
   ```bash
   ssh -T git@github.com
   ```

### 4. 首次推送代码

```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit"

# 推送到 GitHub（首次推送）
git push -u origin master
```

### 5. 验证配置

```bash
# 查看远程仓库配置
git remote -v

# 查看远程分支
git branch -r
```

## 常见问题

### 问题：推送时提示需要认证
**解决方案**：使用 Personal Access Token 或配置 SSH 密钥

### 问题：路径包含中文字符导致问题
**解决方案**：在 PowerShell 中使用引号包裹路径，或使用短路径名

### 问题：如何更改远程仓库 URL
```bash
# 查看当前远程 URL
git remote get-url origin

# 更改远程 URL
git remote set-url origin NEW_URL
```

## 下一步

配置完成后，您可以：
- 在 Cursor 中使用源代码管理面板进行提交和推送
- 使用 Git 命令进行版本控制
- 与团队成员协作开发

