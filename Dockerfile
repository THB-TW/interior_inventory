# ── 第一階段：用 Maven 編譯 ──────────────────────
# 從 Docker Hub 拉一個已經裝好 Maven + Java 22 的環境
FROM maven:3.9-eclipse-temurin-22 AS builder

# 設定工作目錄，之後所有指令都在 /app 裡執行
WORKDIR /app

# 先只複製 pom.xml
# 好處：只要 pom.xml 沒變，Maven 下載依賴的那層 cache 就不會重跑
# 可以省下每次 build 都要重新下載 Spring Boot 所有 jar 的時間
COPY pom.xml .
RUN mvn dependency:go-offline -B
# dependency:go-offline = 預先把所有依賴下載到容器裡
# -B = batch mode，不顯示互動提示

# 再複製完整 src 原始碼
COPY src ./src

# 打包成 jar，-DskipTests 跳過測試加快速度
RUN mvn package -DskipTests -B

# ── 第二階段：執行環境 ────────────────────────────
# 用更輕量的 JRE（只能跑，不能編譯）
# alpine = 超精簡 Linux，整個 image 只有幾十 MB
FROM eclipse-temurin:22-jre-alpine

WORKDIR /app

# 從第一階段的 builder 把編譯好的 jar 複製過來
# target/*.jar 會匹配到 interior-inventory-0.0.1-SNAPSHOT.jar
COPY --from=builder /app/target/*.jar app.jar

# 宣告容器對外開放 8080 port（只是說明，不是真的開）
EXPOSE 8080

# 容器啟動時執行的指令
ENTRYPOINT ["java", \
    "-Xms128m", \
    "-Xmx400m", \
    "-XX:MetaspaceSize=96m", \
    "-XX:MaxMetaspaceSize=250m", \
    "-XX:+UseContainerSupport", \
    "-XX:+UseG1GC", \
    "-XX:+UseStringDeduplication", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]