/*
  Warnings:

  - The values [RESENT] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.
  - The `sent_at` column on the `boletos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `filepath` to the `boletos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('AWAITING', 'SENT', 'ERROR');
ALTER TABLE "boletos" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "boletos" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "Status_old";
ALTER TABLE "boletos" ALTER COLUMN "status" SET DEFAULT 'AWAITING';
COMMIT;

-- AlterTable
ALTER TABLE "boletos" ADD COLUMN     "filepath" TEXT NOT NULL,
DROP COLUMN "sent_at",
ADD COLUMN     "sent_at" DATE;
