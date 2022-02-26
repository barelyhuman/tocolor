import {max, min, normalizeHex} from './lib/utils'

const padHex = d => (parseInt(d, 16) < 16 ? `0${d}` : d)
const toRGBIndex = (val, lMultiplier) => Math.ceil((val + lMultiplier) * 255)

/**
 * @typedef {object} RGBEnum
 * @property {number} r
 * @property {number} g
 * @property {number} b
 */

/**
 * @typedef {object} HSLEnum
 * @property {number} h
 * @property {number} s
 * @property {number} l
 */

/**
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
export function rgbToHex(r, g, b) {
	const red = padHex(r.toString(16))
	const green = padHex(g.toString(16))
	const blue = padHex(b.toString(16))
	return normalizeHex(`${red}${green}${blue}`)
}

/**
 *
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @returns {string}
 */
export function hslToHex(h, s, l) {
	const {r, g, b} = hslToRGB(h, s, l)
	return rgbToHex(r, g, b)
}

/**
 *
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @returns {RGBEnum}
 */
export function hslToRGB(h, s, l) {
	const luminanceInBinary = l > 100 ? 1 : l / 100
	const saturationInBinary = s > 100 ? 1 : s / 100
	const chroma = (1 - Math.abs(2 * luminanceInBinary - 1)) * saturationInBinary
	const huePoint = h > 360 ? (h - 360) / 60 : h / 60
	const secondaryChroma = chroma * (1 - Math.abs((huePoint % 2) - 1))
	const lightnessMultiplier = luminanceInBinary - chroma / 2

	let rTemp, gTemp, bTemp

	const _huePointRounded = Math.floor(huePoint)

	switch (true) {
		case _huePointRounded >= 0 && _huePointRounded < 1: {
			rTemp = chroma
			gTemp = secondaryChroma
			bTemp = 0
			break
		}
		case _huePointRounded >= 1 && _huePointRounded < 2: {
			rTemp = secondaryChroma
			gTemp = chroma
			bTemp = 0
			break
		}
		case _huePointRounded >= 2 && _huePointRounded < 3: {
			rTemp = 0
			gTemp = chroma
			bTemp = secondaryChroma
			break
		}
		case _huePointRounded >= 3 && _huePointRounded < 4: {
			rTemp = 0
			gTemp = secondaryChroma
			bTemp = chroma
			break
		}
		case _huePointRounded >= 4 && _huePointRounded < 5: {
			rTemp = secondaryChroma
			gTemp = 0
			bTemp = chroma
			break
		}
		case _huePointRounded >= 5 && _huePointRounded < 6: {
			rTemp = chroma
			gTemp = 0
			bTemp = secondaryChroma
			break
		}
	}

	return {
		r: toRGBIndex(rTemp, lightnessMultiplier),
		g: toRGBIndex(gTemp, lightnessMultiplier),
		b: toRGBIndex(bTemp, lightnessMultiplier),
	}
}

/**
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {HSLEnum}
 */
export function rgbToHSL(r, g, b) {
	const pointR = r / 255
	const pointG = g / 255
	const pointB = b / 255
	const chromaMin = min(pointR, pointG, pointB)
	const chromaMax = max(pointR, pointG, pointB)
	const delta = chromaMax - chromaMin
	const luminance = (chromaMax + chromaMin) / 2

	let saturation = 0
	let hue = 0

	if (delta === 0) {
		saturation = 0
	} else {
		saturation = delta / (1 - Math.abs(2 * luminance - 1))
	}

	switch (true) {
		case delta === 0: {
			hue = 0
		}
	}

	if (saturation > 0) {
		switch (chromaMax) {
			case pointR: {
				hue = ((pointG - pointB) % 6) / delta
				break
			}
			case pointG: {
				hue = 2 + (pointB - pointR) / delta
				break
			}
			case pointB: {
				hue = 4 + (pointR - pointG) / delta
				break
			}
		}
	}

	hue = hue * 60

	if (hue < 0) {
		hue += 360
	}

	return {
		h: Math.floor(hue),
		s: Math.floor(saturation * 100),
		l: Math.floor(luminance * 100),
	}
}

/**
 *
 * @param {string} hex
 * @returns {RGBEnum}
 */
export function hexToRGB(hex) {
	const colorString = normalizeHex(hex)
	const r = hexToInt(colorString, 0)
	const g = hexToInt(colorString, 2)
	const b = hexToInt(colorString, 4)
	return {r, g, b}
}

/**
 * @description convert a given hex value (1A) to it's integer value
 * @param {string} hex
 * @param {number} index
 * @returns {number}
 */
export function hexToInt(hex, index) {
	return parseInt(hex.slice(index, index + 2), 16)
}

/**
 * @param {string} hex
 * @returns {HSLEnum}
 */
export function hexToHSL(hex) {
	const {r, g, b} = hexToRGB(hex)
	return rgbToHSL(r, g, b)
}

/**
 * @description parse a given string of value hex / rgb / hsl format
 * into it's normalized hex variant
 * @param {string} colorstring
 * @returns {string}
 */
export function parseToHex(colorstring) {
	const rgbMatcher = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/
	const hslMatcher = /^hsl\(\s*(\d+)\s*,\s*(\d+)%*\s*,\s*(\d+)%*\s*\)$/

	switch (true) {
		case rgbMatcher.test(colorstring): {
			const _values = colorstring.match(rgbMatcher)
			if (_values && _values.length) {
				return rgbToHex(
					parseInt(_values[1], 10),
					parseInt(_values[2], 10),
					parseInt(_values[3], 10),
				)
			} else {
				throw new Error('Invalid RGB String')
			}
		}
		case hslMatcher.test(colorstring): {
			const _values = colorstring.match(hslMatcher)
			if (_values && _values.length) {
				return hslToHex(
					parseInt(_values[1], 10),
					parseInt(_values[2], 10),
					parseInt(_values[3], 10),
				)
			} else {
				throw new Error('Invalid HSL String')
			}
		}
		default: {
			const _value = normalizeHex(colorstring)
			if (_value.length > 6) {
				throw new Error('Invalid Hex String')
			}
			return _value
		}
	}
}
