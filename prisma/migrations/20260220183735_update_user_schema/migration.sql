/*
  Warnings:

  - You are about to drop the `FilmPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ImagePost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TextPost` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('IMAGE', 'TEXT', 'FILM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountType" TEXT NOT NULL DEFAULT 'User',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "FilmPost";

-- DropTable
DROP TABLE "ImagePost";

-- DropTable
DROP TABLE "TextPost";

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "PostType" NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "link" TEXT,
    "authorId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "year" TEXT,
    "filmTitle" TEXT,
    "tags" TEXT,
    "showDetails" BOOLEAN DEFAULT true,
    "images" TEXT[],

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
