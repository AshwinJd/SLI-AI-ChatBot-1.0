import { PrismaClient } from '@prisma/client';
import { createReadStream } from 'node:fs';
import csv from 'csv-parser';
const prisma = new PrismaClient()
async function main() {
    const results:{
        week: string
        weekTitle: string,
        _class: string,
        startDate: string,
        startTime: string,
        endTime: string,
        timeZone: string
    }[] = [];
    createReadStream('./data/classes.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const updatedResults = results.map(({week, weekTitle, _class, startDate, startTime, endTime, timeZone}) => {
                const starts = new Date(Date.parse(startDate + ' ' + startTime));
                const ends = new Date(Date.parse(startDate + ' ' + endTime));

                return {
                    week: parseInt(week),
                    weekTitle,
                    class: _class,
                    starts,
                    ends,
                };
            });

            await prisma.class.createMany({data: updatedResults});

            console.log('results:', updatedResults);
    });
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });