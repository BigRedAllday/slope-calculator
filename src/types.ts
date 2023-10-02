export type TFeedInMetadata = {
    azimuth: number | "tracked",
    slope: number | "tracked",
    peakPowerKw: number,
    systemLossPercent: number
}

export enum ECalculationStrategy {
    MONTHLY,
    SEASON,
    HALF_YEAR
}

export enum EInterval {
    JANUARY = "01_JANUARY",
    FEBRUARY = "02_FEBRUARY",
    MARCH = "03_MARCH",
    APRIL = "04_APRIL",
    MAY = "05_MAY",
    JUNE = "06_JUNE",
    JULY = "07_JULY",
    AUGUST = "08_AUGUST",
    SEPTEMBER = "09_SEPTEMBER",
    OCTOBER = "10_OCTOBER",
    NOVEMBER = "11_NOVEMBER",
    DECEMBER = "12_DECEMBER",
    SPRING = "01_SPRING",
    SUMMER = "02_SUMMER",
    AUTUMN = "03_AUTUMN",
    WINTER = "04_WINTER"
}