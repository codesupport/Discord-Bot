class NumberUtil {
	static getRandomNumberInRange(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}

export default NumberUtil;