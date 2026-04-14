# =========================
# 1. Runtime
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app

# Elastic Beanstalk con Docker normalmente espera que tu app escuche en 80
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Development 

EXPOSE 80

# =========================
# 2. Build
# =========================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copiar csproj para restaurar dependencias primero
COPY ["Backend_SIGO/SIGO.Api.csproj", "Backend_SIGO/"]
COPY ["SIGO.Application (Proyecto Biblioteca de Clases .NET)/SIGO.Application.csproj", "SIGO.Application (Proyecto Biblioteca de Clases .NET)/"]
COPY ["SIGO.Domain (Proyecto Biblioteca de Clases .NET)/SIGO.Domain.csproj", "SIGO.Domain (Proyecto Biblioteca de Clases .NET)/"]
COPY ["SIGO.Infrastructure (Proyecto Biblioteca de Clases .NET)/SIGO.Infrastructure.csproj", "SIGO.Infrastructure (Proyecto Biblioteca de Clases .NET)/"]

RUN dotnet restore "Backend_SIGO/SIGO.Api.csproj"

# Copiar todo el código
COPY . .

WORKDIR "/src/Backend_SIGO"
RUN dotnet build "SIGO.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

# =========================
# 3. Publish
# =========================
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
WORKDIR "/src/Backend_SIGO"
RUN dotnet publish "SIGO.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# =========================
# 4. Final
# =========================
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "SIGO.Api.dll"]