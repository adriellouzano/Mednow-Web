/*
  Warnings:

  - You are about to drop the column `frequencia` on the `Alarme` table. All the data in the column will be lost.
  - Added the required column `duracaoDias` to the `Alarme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frequenciaDiaria` to the `Alarme` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alarme" DROP COLUMN "frequencia",
ADD COLUMN     "duracaoDias" INTEGER NOT NULL,
ADD COLUMN     "frequenciaDiaria" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Prescricao" ADD CONSTRAINT "Prescricao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescricao" ADD CONSTRAINT "Prescricao_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
