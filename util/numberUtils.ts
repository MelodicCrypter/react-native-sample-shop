export const numFixer = (num: number): number => {
    return Math.round(num.toFixed(2) * 100) / 100;
}
