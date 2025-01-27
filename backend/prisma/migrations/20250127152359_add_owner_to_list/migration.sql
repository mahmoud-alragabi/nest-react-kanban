/*
  Warnings:

  - Added the required column `ownerId` to the `List` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "List" ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
