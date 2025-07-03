# Stage 1: Build .NET Backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS dotnet-build
WORKDIR /src

# Copy .NET project files
COPY Moviemo/Moviemo.csproj ./Moviemo/
RUN dotnet restore "Moviemo/Moviemo.csproj"

# Copy remaining .NET files and build
COPY Moviemo/ ./Moviemo/
WORKDIR /src/Moviemo
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Build Next.js Frontend
FROM node:18-alpine AS node-build
WORKDIR /app

# Copy package files
COPY nextjs-app/package.json nextjs-app/package-lock.json ./
RUN npm ci

# Copy remaining Next.js files and build
COPY nextjs-app/ ./
RUN npm run build

# Stage 3: Final Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Install Node.js for Next.js runtime
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    gnupg && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Copy .NET backend
COPY --from=dotnet-build /app/publish .

# Copy Next.js frontend
COPY --from=node-build /app/.next ./wwwroot/.next
COPY --from=node-build /app/public ./wwwroot/public
COPY --from=node-build /app/package.json ./wwwroot/
COPY --from=node-build /app/node_modules ./wwwroot/node_modules
COPY --from=node-build /app/next.config.js ./wwwroot/

# Configure environment
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Configure Next.js to serve from /wwwroot
ENV NEXT_PUBLIC_BASE_PATH=/wwwroot
ENV NEXT_PUBLIC_API_URL=http://localhost:80

# Create startup script
RUN echo "#!/bin/sh\n\
dotnet Moviemo.dll &\n\
cd /app/wwwroot && npm start\n\
wait" > /app/startup.sh && \
    chmod +x /app/startup.sh

EXPOSE 80
CMD ["/bin/sh", "/app/startup.sh"]