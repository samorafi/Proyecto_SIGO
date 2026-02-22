# ---------- BUILD ----------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY . .
RUN dotnet restore "Backend_SIGO/Backend_SIGO.sln"
RUN dotnet publish "Backend_SIGO/SIGO.Api (Proyecto ASP.NET Core Web API).csproj" \
    -c Release -o /app/publish /p:UseAppHost=false

# ---------- RUNTIME ----------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SIGO.Api (Proyecto ASP.NET Core Web API).dll"]