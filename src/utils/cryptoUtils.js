class AESCrypto {
    #key;
    #iv;
    #algorithm = { name: 'AES-CBC' };

    constructor(key, iv) {
        this.rawKey = key;
        this.rawIv = iv;
    }

    async #prepare() {
        if (this.#key) return;

        const encoder = new TextEncoder();

        let keyBytes = encoder.encode(this.rawKey);
        const requiredKeyLength = 16;

        if (keyBytes.length < requiredKeyLength) {
            const hashBuffer = await crypto.subtle.digest('SHA-256', keyBytes);
            keyBytes = new Uint8Array(hashBuffer).slice(0, requiredKeyLength);
        } else {
            keyBytes = keyBytes.slice(0, requiredKeyLength);
        }

        let ivBytes = encoder.encode(this.rawIv);
        if (ivBytes.length < 16) {
            const paddedIv = new Uint8Array(16);
            paddedIv.set(ivBytes);
            ivBytes = paddedIv;
        } else {
            ivBytes = ivBytes.slice(0, 16);
        }

        this.#iv = ivBytes;
        this.#key = await crypto.subtle.importKey(
            'raw',
            keyBytes,
            this.#algorithm,
            false,
            ['encrypt', 'decrypt']
        );
    }

    async encrypt(plainText) {
        await this.#prepare();
        const data = new TextEncoder().encode(plainText);
        const encrypted = await crypto.subtle.encrypt(
            { ...this.#algorithm, iv: this.#iv },
            this.#key,
            data
        );
        return this.#bufferToBase64(encrypted);
    }

    async decrypt(encryptedText) {
        await this.#prepare();
        const data = this.#base64ToBuffer(encryptedText);
        const decrypted = await crypto.subtle.decrypt(
            { ...this.#algorithm, iv: this.#iv },
            this.#key,
            data
        );
        return new TextDecoder().decode(decrypted);
    }

    #bufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    #base64ToBuffer(base64) {
        const binary = window.atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
}

const getAESKey = () => 'mAou.aes.key.3ca';
const getAESIv = () => 'mAou.aes.iv.a6b7';

let defaultAESCrypto = null;

const getDefaultAESCrypto = () => {
    if (!defaultAESCrypto) {
        defaultAESCrypto = new AESCrypto(getAESKey(), getAESIv());
    }
    return defaultAESCrypto;
};

export const aesEncrypt = async (text) => await getDefaultAESCrypto().encrypt(text);
export const aesDecrypt = async (text) => await getDefaultAESCrypto().decrypt(text);

export async function encryptPassword(pwd) {
    const saltRaw = 'mAou5820.authorization';

    const encoder = new TextEncoder();
    const saltUint8 = encoder.encode(saltRaw);
    const saltHex = Array.from(saltUint8)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    const dataToHash = encoder.encode(pwd + saltHex);

    const hashBuffer = await crypto.subtle.digest('SHA-256', dataToHash);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return hashHex;
}