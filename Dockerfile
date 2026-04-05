# use the official Bun image
FROM docker.m.daocloud.io/oven/bun:1.3.10 AS base
WORKDIR /usr/src/app

# Set the timezone to UTC+8
ENV TZ=Asia/Shanghai

# Install system dependencies for skia-canvas and node-gyp
# Use Aliyun mirror for Debian packages
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    apt-get update && apt-get install -y \
    libfontconfig1 \
    libfreetype6 \
    libpng16-16 \
    libglib2.0-0 \
    python3 \
    make \
    g++ \
    fonts-wqy-microhei \
    fonts-wqy-zenhei \
    fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for font configuration
ENV FONTCONFIG_PATH=/etc/fonts
ENV LANG=C.UTF-8

# Copy custom fontconfig to set default fonts
COPY fonts.conf /etc/fonts/local.conf

# Rebuild font cache
RUN fc-cache -fv

# copy production dependencies and source code into final image
FROM base AS release

# Copy source files
COPY package.json .
COPY bun.lock .
COPY tsconfig.json .
COPY tsconfig.build.json .
COPY src ./src
COPY api-server.ts .

# Install dependencies
RUN bun install --production

# Force rebuild skia-canvas from source for compatibility
RUN cd node_modules/skia-canvas && \
    bun run install || \
    bunx node-gyp rebuild

# run the app
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "api-server.ts" ]
