/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `condition` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Product` table. All the data in the column will be lost.
  - The `status` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserConversations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'SOLD', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'SYSTEM');

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_userId_fkey";

-- DropForeignKey
ALTER TABLE "_UserConversations" DROP CONSTRAINT "_UserConversations_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserConversations" DROP CONSTRAINT "_UserConversations_B_fkey";

-- DropIndex
DROP INDEX "Conversation_productId_idx";

-- DropIndex
DROP INDEX "Message_conversationId_idx";

-- DropIndex
DROP INDEX "Message_receiverId_idx";

-- DropIndex
DROP INDEX "Message_senderId_idx";

-- DropIndex
DROP INDEX "Product_category_idx";

-- DropIndex
DROP INDEX "Product_status_idx";

-- DropIndex
DROP INDEX "Product_userId_idx";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'TEXT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category",
DROP COLUMN "condition",
DROP COLUMN "tags",
DROP COLUMN "userId",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USDC',
ADD COLUMN     "location" TEXT,
ADD COLUMN     "sellerId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "_UserConversations";

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_userId_conversationId_key" ON "ConversationParticipant"("userId", "conversationId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
