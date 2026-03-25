export const formatRut = (rut: string): string => {
    // Clear non-alphanumeric characters
    const cleanRut = rut.replace(/[^0-9kK]/g, "");

    if (cleanRut.length <= 1) return cleanRut;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    return `${body}-${dv}`;
};

export const validateRut = (rut: string): boolean => {
    if (!rut) return false;

    const cleanRut = rut.replace(/[^0-9kK]/g, "");
    if (cleanRut.length < 2) return false;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    // Check if body is a valid number
    if (!/^\d+$/.test(body)) return false;

    let sum = 0;
    let multiplier = 2;

    // Calculate check digit
    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDvIndex = 11 - (sum % 11);
    let expectedDv = expectedDvIndex.toString();

    if (expectedDvIndex === 11) expectedDv = "0";
    if (expectedDvIndex === 10) expectedDv = "K";

    return dv === expectedDv;
};

export const validatePhone = (phone: string): boolean => {
    // Allow format like +56 9 1234 5678 or 912345678
    // Must contain at least 9 digits
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    return cleanPhone.length >= 9;
};
