# 鲜活商品价格指数的替换篮子与订阅解释

面向该业务领域的本地演练资料与 Node.js 资料工具。所有原始记录均为合成资料，分析结果不预置。

运行环境为 Node.js 22.23.4。当前工具只使用 Node.js 内置模块，无需数据库账号或第三方在线服务。`package-lock.json` 固定依赖状态；`npm ci --ignore-scripts` 可核对安装清单。

`npm run inspect` 查看资料类别和记录数。`npm run check` 检查字段类型、编号与显式引用。`npm test` 运行资料契约检查及合作端接口检查。这些命令核实资料与环境，不计算经营结论或代替分析应用。

`data/` 保存事实和字段定义，字段单位、生效范围及后补记录见 [资料契约](docs/资料契约.md)。`scripts/` 是资料工具，`test/` 是现有契约检查。运行生成的状态应保存在 `state/`，不改原始资料。

容器可用 `docker build -t wholesale-index-governance:local .` 构建，`docker run --rm wholesale-index-governance:local` 检查资料。镜像保留普通用户，命令也可在本机同版本 Node.js 执行。

合作接收方的本地服务及确认语义见 [合作端接口](docs/合作端.md)。
