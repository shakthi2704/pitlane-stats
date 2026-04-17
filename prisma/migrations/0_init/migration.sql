-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" SERIAL NOT NULL,
    "sport" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "round" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "f1_drivers" (
    "driverId" TEXT NOT NULL,
    "code" TEXT,
    "permanentNumber" TEXT,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "nationality" TEXT,
    "dateOfBirth" TEXT,
    "url" TEXT,

    CONSTRAINT "f1_drivers_pkey" PRIMARY KEY ("driverId")
);

-- CreateTable
CREATE TABLE "f1_constructors" (
    "constructorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nationality" TEXT,
    "url" TEXT,

    CONSTRAINT "f1_constructors_pkey" PRIMARY KEY ("constructorId")
);

-- CreateTable
CREATE TABLE "f1_circuits" (
    "circuitId" TEXT NOT NULL,
    "circuitName" TEXT NOT NULL,
    "locality" TEXT,
    "country" TEXT,
    "lat" TEXT,
    "lng" TEXT,
    "url" TEXT,

    CONSTRAINT "f1_circuits_pkey" PRIMARY KEY ("circuitId")
);

-- CreateTable
CREATE TABLE "f1_driver_standings" (
    "id" SERIAL NOT NULL,
    "season" TEXT NOT NULL,
    "round" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "wins" INTEGER NOT NULL,
    "driverId" TEXT NOT NULL,
    "constructorId" TEXT NOT NULL,
    "constructorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "f1_driver_standings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "f1_constructor_standings" (
    "id" SERIAL NOT NULL,
    "season" TEXT NOT NULL,
    "round" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "wins" INTEGER NOT NULL,
    "constructorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "f1_constructor_standings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "f1_races" (
    "id" SERIAL NOT NULL,
    "season" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "raceName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT,
    "circuitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "f1_races_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "f1_race_results" (
    "id" SERIAL NOT NULL,
    "raceId" INTEGER NOT NULL,
    "position" INTEGER,
    "positionText" TEXT NOT NULL,
    "number" TEXT,
    "grid" INTEGER,
    "laps" INTEGER,
    "status" TEXT,
    "points" DOUBLE PRECISION,
    "time" TEXT,
    "driverId" TEXT NOT NULL,
    "constructorId" TEXT NOT NULL,
    "fastestLapRank" INTEGER,
    "fastestLapNumber" INTEGER,
    "fastestLapTime" TEXT,
    "fastestLapSpeed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "f1_race_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "f1_lap_times" (
    "id" SERIAL NOT NULL,
    "raceId" INTEGER NOT NULL,
    "lapNumber" INTEGER NOT NULL,
    "driverId" TEXT NOT NULL,
    "position" INTEGER,
    "time" TEXT NOT NULL,
    "timeMs" INTEGER,

    CONSTRAINT "f1_lap_times_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "f1_news" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "source" TEXT,
    "url" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "f1_news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motogp_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legacyId" INTEGER NOT NULL,

    CONSTRAINT "motogp_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motogp_riders" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "nationality" TEXT,
    "birthDate" TEXT,
    "birthCity" TEXT,
    "number" INTEGER,
    "legacyId" INTEGER,
    "categoryId" TEXT NOT NULL,
    "photoUrl" TEXT,

    CONSTRAINT "motogp_riders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motogp_teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legacyId" INTEGER,
    "color" TEXT,
    "textColor" TEXT,

    CONSTRAINT "motogp_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motogp_constructors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legacyId" INTEGER,

    CONSTRAINT "motogp_constructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motogp_circuits" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "place" TEXT,
    "nation" TEXT,
    "legacyId" INTEGER,

    CONSTRAINT "motogp_circuits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motogp_seasons" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "current" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "motogp_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motogp_events" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "circuitId" TEXT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "sponsoredName" TEXT,
    "dateStart" TEXT NOT NULL,
    "dateEnd" TEXT NOT NULL,
    "status" TEXT,
    "isTest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "motogp_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motogp_sessions" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL DEFAULT 1,
    "date" TEXT,
    "status" TEXT,
    "trackCondition" TEXT,
    "airTemp" TEXT,
    "humidity" TEXT,
    "groundTemp" TEXT,
    "weather" TEXT,

    CONSTRAINT "motogp_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motogp_results" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "teamId" TEXT,
    "constructorId" TEXT,
    "position" INTEGER,
    "status" TEXT,
    "points" DOUBLE PRECISION,
    "time" TEXT,
    "gapFirst" TEXT,
    "gapLap" INTEGER,
    "averageSpeed" DOUBLE PRECISION,
    "totalLaps" INTEGER,
    "bestLapTime" TEXT,
    "bestLapNumber" INTEGER,
    "topSpeed" DOUBLE PRECISION,
    "gapPrev" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "motogp_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motogp_rider_standings" (
    "id" SERIAL NOT NULL,
    "seasonId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "raceWins" INTEGER NOT NULL DEFAULT 0,
    "podiums" INTEGER NOT NULL DEFAULT 0,
    "sprintWins" INTEGER NOT NULL DEFAULT 0,
    "sprintPodiums" INTEGER NOT NULL DEFAULT 0,
    "teamName" TEXT,
    "constructorName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motogp_rider_standings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motogp_constructor_standings" (
    "id" SERIAL NOT NULL,
    "seasonId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "constructorId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motogp_constructor_standings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motogp_team_standings" (
    "id" SERIAL NOT NULL,
    "seasonId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motogp_team_standings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sync_logs_sport_dataType_season_idx" ON "sync_logs"("sport", "dataType", "season");

-- CreateIndex
CREATE INDEX "sync_logs_syncedAt_idx" ON "sync_logs"("syncedAt");

-- CreateIndex
CREATE INDEX "f1_driver_standings_season_position_idx" ON "f1_driver_standings"("season", "position");

-- CreateIndex
CREATE UNIQUE INDEX "f1_driver_standings_season_driverId_key" ON "f1_driver_standings"("season", "driverId");

-- CreateIndex
CREATE INDEX "f1_constructor_standings_season_position_idx" ON "f1_constructor_standings"("season", "position");

-- CreateIndex
CREATE UNIQUE INDEX "f1_constructor_standings_season_constructorId_key" ON "f1_constructor_standings"("season", "constructorId");

-- CreateIndex
CREATE INDEX "f1_races_season_idx" ON "f1_races"("season");

-- CreateIndex
CREATE UNIQUE INDEX "f1_races_season_round_key" ON "f1_races"("season", "round");

-- CreateIndex
CREATE INDEX "f1_race_results_raceId_idx" ON "f1_race_results"("raceId");

-- CreateIndex
CREATE UNIQUE INDEX "f1_race_results_raceId_driverId_key" ON "f1_race_results"("raceId", "driverId");

-- CreateIndex
CREATE INDEX "f1_lap_times_raceId_driverId_idx" ON "f1_lap_times"("raceId", "driverId");

-- CreateIndex
CREATE INDEX "f1_lap_times_raceId_lapNumber_idx" ON "f1_lap_times"("raceId", "lapNumber");

-- CreateIndex
CREATE UNIQUE INDEX "f1_lap_times_raceId_lapNumber_driverId_key" ON "f1_lap_times"("raceId", "lapNumber", "driverId");

-- CreateIndex
CREATE UNIQUE INDEX "f1_news_url_key" ON "f1_news"("url");

-- CreateIndex
CREATE INDEX "f1_news_publishedAt_idx" ON "f1_news"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "motogp_seasons_year_key" ON "motogp_seasons"("year");

-- CreateIndex
CREATE INDEX "motogp_events_seasonId_categoryId_idx" ON "motogp_events"("seasonId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "motogp_events_seasonId_categoryId_shortName_key" ON "motogp_events"("seasonId", "categoryId", "shortName");

-- CreateIndex
CREATE INDEX "motogp_sessions_eventId_type_idx" ON "motogp_sessions"("eventId", "type");

-- CreateIndex
CREATE INDEX "motogp_results_sessionId_idx" ON "motogp_results"("sessionId");

-- CreateIndex
CREATE INDEX "motogp_results_riderId_idx" ON "motogp_results"("riderId");

-- CreateIndex
CREATE UNIQUE INDEX "motogp_results_sessionId_riderId_key" ON "motogp_results"("sessionId", "riderId");

-- CreateIndex
CREATE INDEX "motogp_rider_standings_seasonId_categoryId_position_idx" ON "motogp_rider_standings"("seasonId", "categoryId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "motogp_rider_standings_seasonId_categoryId_riderId_key" ON "motogp_rider_standings"("seasonId", "categoryId", "riderId");

-- CreateIndex
CREATE INDEX "motogp_constructor_standings_seasonId_categoryId_position_idx" ON "motogp_constructor_standings"("seasonId", "categoryId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "motogp_constructor_standings_seasonId_categoryId_constructo_key" ON "motogp_constructor_standings"("seasonId", "categoryId", "constructorId");

-- CreateIndex
CREATE INDEX "motogp_team_standings_seasonId_categoryId_position_idx" ON "motogp_team_standings"("seasonId", "categoryId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "motogp_team_standings_seasonId_categoryId_teamId_key" ON "motogp_team_standings"("seasonId", "categoryId", "teamId");

-- AddForeignKey
ALTER TABLE "f1_driver_standings" ADD CONSTRAINT "f1_driver_standings_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "f1_drivers"("driverId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "f1_constructor_standings" ADD CONSTRAINT "f1_constructor_standings_constructorId_fkey" FOREIGN KEY ("constructorId") REFERENCES "f1_constructors"("constructorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "f1_races" ADD CONSTRAINT "f1_races_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "f1_circuits"("circuitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "f1_race_results" ADD CONSTRAINT "f1_race_results_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "f1_races"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "f1_race_results" ADD CONSTRAINT "f1_race_results_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "f1_drivers"("driverId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "f1_race_results" ADD CONSTRAINT "f1_race_results_constructorId_fkey" FOREIGN KEY ("constructorId") REFERENCES "f1_constructors"("constructorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "f1_lap_times" ADD CONSTRAINT "f1_lap_times_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "f1_races"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "f1_lap_times" ADD CONSTRAINT "f1_lap_times_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "f1_drivers"("driverId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_riders" ADD CONSTRAINT "motogp_riders_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "motogp_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_events" ADD CONSTRAINT "motogp_events_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "motogp_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_events" ADD CONSTRAINT "motogp_events_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "motogp_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_events" ADD CONSTRAINT "motogp_events_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "motogp_circuits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_sessions" ADD CONSTRAINT "motogp_sessions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "motogp_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_results" ADD CONSTRAINT "motogp_results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "motogp_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_results" ADD CONSTRAINT "motogp_results_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "motogp_riders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_results" ADD CONSTRAINT "motogp_results_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "motogp_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_results" ADD CONSTRAINT "motogp_results_constructorId_fkey" FOREIGN KEY ("constructorId") REFERENCES "motogp_constructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_rider_standings" ADD CONSTRAINT "motogp_rider_standings_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "motogp_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_rider_standings" ADD CONSTRAINT "motogp_rider_standings_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "motogp_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_rider_standings" ADD CONSTRAINT "motogp_rider_standings_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "motogp_riders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_constructor_standings" ADD CONSTRAINT "motogp_constructor_standings_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "motogp_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_constructor_standings" ADD CONSTRAINT "motogp_constructor_standings_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "motogp_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_constructor_standings" ADD CONSTRAINT "motogp_constructor_standings_constructorId_fkey" FOREIGN KEY ("constructorId") REFERENCES "motogp_constructors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_team_standings" ADD CONSTRAINT "motogp_team_standings_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "motogp_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_team_standings" ADD CONSTRAINT "motogp_team_standings_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "motogp_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motogp_team_standings" ADD CONSTRAINT "motogp_team_standings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "motogp_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

