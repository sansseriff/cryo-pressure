/**
 * Arden Buck equation for saturation vapor pressure.
 * @param T Temperature in Celsius.
 * @returns Saturation vapor pressure in kPa.
 */
export function ardenBuckEquation(T: number): number {
    // https://en.wikipedia.org/wiki/Arden_Buck_equation
    if (T > 0) {
        return 0.61121 * Math.exp((18.678 - T / 234.5) * (T / (T + 257.14)));
    } else {
        return 0.61115 * Math.exp((23.036 - T / 333.7) * (T / (T + 279.82)));
    }
}

/**
 * Calculate the actual water vapor pressure.
 * @param T Temperature in Celsius.
 * @param H Relative humidity in percent.
 * @returns Actual vapor pressure in kPa.
 */
export function pWaterActual(T: number, H: number): number {
    const P_saturation = ardenBuckEquation(T);
    return P_saturation * H / 100;
}

/**
 * Convert pressure from kPa to Torr.
 * @param P Pressure in kPa.
 * @returns Pressure in Torr.
 */
export function kPaToTorr(P: number): number {
    return P * 7.50062;
}

/**
 * Convert temperature from Kelvin to Celsius.
 * @param T Temperature in Kelvin.
 * @returns Temperature in Celsius.
 */
export function kToC(T: number): number {
    return T - 273.15;
}

/**
 * Convert temperature from Fahrenheit to Celsius.
 * @param T Temperature in Fahrenheit.
 * @returns Temperature in Celsius.
 */
export function fToC(T: number): number {
    return (T - 32) * 5 / 9;
}

/**
 * Calculates the maximum air pressure that can be let into the cryostat.
 * @param coldestSurfaceK Temperature of the coldest surface in Kelvin.
 * @param ambientTempF Ambient temperature in Fahrenheit.
 * @param ambientHumidityPercent Ambient relative humidity in percent.
 * @returns Maximum air pressure to let in, in Torr.
 */
export function calculateMaxAirInletPressure(
    coldestSurfaceK: number,
    ambientTempF: number,
    ambientHumidityPercent: number
): number {
    const P_atmospheric_torr = 760; // Standard atmospheric pressure in Torr

    const ambientTempC = fToC(ambientTempF);
    const pActualAmbientkPa = pWaterActual(ambientTempC, ambientHumidityPercent);

    const coldestSurfaceC = kToC(coldestSurfaceK);
    const pSatColdestkPa = ardenBuckEquation(coldestSurfaceC);

    if (pActualAmbientkPa === 0) {
        // Avoid division by zero; if ambient air has no water vapor,
        // theoretically infinite air can be let in (unless pSatColdestkPa is also 0).
        // Or, if pSatColdestkPa is also 0, result is NaN.
        // For practical purposes, if humidity is 0, this implies very dry air.
        return pSatColdestkPa === 0 && pActualAmbientkPa === 0 ? NaN : Infinity;
    }

    // The formula P_max_air_in = P_atmospheric * (P_sat_coldest / P_actual_ambient)
    // The ratio of pressures in kPa is the same as the ratio in Torr.
    return P_atmospheric_torr * (pSatColdestkPa / pActualAmbientkPa);
}
