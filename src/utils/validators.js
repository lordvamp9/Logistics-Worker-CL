export class SecurityValidator {
    static checkRut(rut) {
        let value = rut.replace(/[^0-9kK]/g, '');

        if (value.length < 2) return false;

        let body = value.slice(0, -1);
        let dv = value.slice(-1).toUpperCase();

        if (!/^[0-9]+$/.test(body)) return false;

        let sum = 0;
        let multiplier = 2;

        for (let i = body.length - 1; i >= 0; i--) {
            sum += multiplier * parseInt(body.charAt(i));
            multiplier = multiplier < 7 ? multiplier + 1 : 2;
        }

        let calculated = 11 - (sum % 11);
        let expected = calculated === 11 ? '0' : calculated === 10 ? 'K' : calculated.toString();

        return expected === dv;
    }

    static checkPassword(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        return {
            isValid: strength === 4 && password.length >= 8,
            strengthScore: strength
        };
    }

    static formatRut(rut) {
        let clean = rut.replace(/[^0-9kK]/g, '');

        if (clean.length <= 1) return clean;

        let body = clean.slice(0, -1);
        let dv = clean.slice(-1).toUpperCase();

        let formattedBody = body.split('').reverse().join('').match(/.{1,3}/g).join('.').split('').reverse().join('');

        return `${formattedBody}-${dv}`;
    }
}
