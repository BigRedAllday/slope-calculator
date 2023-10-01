import fs from "fs";
import path from "path";
import {FeedInData} from "./feedInData";
import {ECalculationStrategy, EInterval} from "./types";
import * as console from "console";

const CALCULATION_STRATEGY = ECalculationStrategy.HALF_YEAR;

async function main() {
    const allFiles = await getFilesInDirectory(`./feedin/hamburg/south`);

    const angleToIntervalResults: Map<number, Map<EInterval, number>> = new Map();

    for (const file of allFiles) {
        const feedInData = new FeedInData();
        const feedInMetaData = feedInData.loadFeedInData(file);
        console.log(`Calculating slopes for ${JSON.stringify(feedInMetaData)}`);

        if (!angleToIntervalResults.has(feedInMetaData.slope)) {
            angleToIntervalResults.set(feedInMetaData.slope, new Map());
        }

        const intervalResults = angleToIntervalResults.get(feedInMetaData.slope)!;

        // Variables needed by year-iteration
        const start = new Date('2020-12-31T23:00:00.000Z');
        const end = new Date('2021-12-31T22:45:00.000Z');
        const quarterHour = 1000 * 60 * 15; // in Millisekunden

        for (let current = start.getTime(); current <= end.getTime(); current += quarterHour) {
            const currentTime = new Date(current);

            const feedInFromSolar = feedInData.getFeedIn(currentTime);
            const interval = getInterval(CALCULATION_STRATEGY, currentTime);

            const currentSum = intervalResults.has(interval)
                ? intervalResults.get(interval)! + feedInFromSolar
                : feedInFromSolar;

            intervalResults.set(interval, currentSum);
        }

        // write into csv file
        const fileName = "slopes.csv";
        const existed = fs.existsSync(fileName);
        if (existed) {
            fs.rmSync(fileName);
        }

        const intervalKeys: EInterval[] = [];
        for (const map of angleToIntervalResults.values()) {
            for (const key of map.keys()) {

                if (!intervalKeys.includes(key)) {
                    intervalKeys.push(key);

                }
            }
        }

        const sortedIntervalKeys = intervalKeys.sort((a, b) => a.localeCompare(b));

        // write header
        fs.writeFileSync(fileName, `slope;${intervalKeys.join(";")}\r\n`);

        for (const interval of Array.from(angleToIntervalResults.keys()).sort((n1: number, n2: number)=> n1 - n2)) {

            fs.appendFileSync(fileName, `${interval.toString()};`);

            const map = angleToIntervalResults.get(interval)!;

            for (const interval of sortedIntervalKeys) {
                fs.appendFileSync(fileName, `${map.get(interval)!.toFixed(2)};`);
            }

            // write values
            fs.appendFileSync(fileName, "\r\n");
        }
    }
}

function getInterval(calculationStrategy: ECalculationStrategy, currentTime: Date) : EInterval {
    if (calculationStrategy === ECalculationStrategy.MONTHLY) {
        switch (currentTime.getMonth()) {
            case 0:
                return EInterval.JANUARY;
            case 1:
                return EInterval.FEBRUARY;
            case 2:
                return EInterval.MARCH;
            case 3:
                return EInterval.APRIL;
            case 4:
                return EInterval.MAY;
            case 5:
                return EInterval.JUNE;
            case 6:
                return EInterval.JULY;
            case 7:
                return EInterval.AUGUST;
            case 8:
                return EInterval.SEPTEMBER;
            case 9:
                return EInterval.OCTOBER;
            case 10:
                return EInterval.NOVEMBER;
            default:
                return EInterval.DECEMBER;
        }
    } else if (calculationStrategy === ECalculationStrategy.SEASON) {
        return getSeason(currentTime);
    } else {
        const season = getSeason(currentTime);
        if (season === EInterval.SUMMER || season === EInterval.SPRING) {
            return EInterval.SUMMER;
        } else {
            return EInterval.WINTER;
        }
    }
}

function getSeason(date: Date) : EInterval {
    if (date.getMonth() < 2) {
        return EInterval.WINTER;
    } else if (date.getMonth() === 2) {
        if (date.getDate() < 21) {
            return EInterval.WINTER;
        } else {
            return EInterval.SPRING;
        }
    } else if (date.getMonth() < 5) {
        return EInterval.SPRING;
    } else if (date.getMonth() === 5) {
        if (date.getDate() < 21) {
            return EInterval.SPRING;
        } else {
            return EInterval.SUMMER;
        }
    } else if (date.getMonth() < 8) {
        return EInterval.SUMMER;
    } else if (date.getMonth() === 8) {
        if (date.getDay() < 21) {
            return EInterval.SUMMER;
        } else {
            return EInterval.AUTUMN;
        }
    } else if (date.getMonth() < 11) {
        return EInterval.AUTUMN;
    } else {
        if (date.getDate() < 21) {
            return EInterval.AUTUMN;
        } else {
            return EInterval.WINTER;
        }
    }
}

function getFilesInDirectory(directoryPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                reject(err);
            } else {
                const filePaths: string[] = [];

                files.forEach((file) => {
                    const filePath = path.join(directoryPath, file);
                    filePaths.push(filePath);
                });

                resolve(filePaths);
            }
        });
    });
}

//Invoke the main function
main().catch(err => {
    console.log(err);
});