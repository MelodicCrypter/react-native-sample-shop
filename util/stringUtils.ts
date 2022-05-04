export const shortenStr = (str: string, end: number, start: number = 0) => {
    return str.substr(start, end);
}

export const ellipsist = (str: string, end: number, start: number = 0, ) => {
    return str.length > end ? `${str.substr(start, end)}...` : str;
}
