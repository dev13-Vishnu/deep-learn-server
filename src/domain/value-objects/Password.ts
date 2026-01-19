export class Password {
    private readonly value: string;
    constructor (password: string) {
        if(!Password.isValid(password)) {
            throw new Error('Password must be at leas 8 characters long');
        }
        this.value = password;
    }

    getValue(): string{
        return this.value;
    }
    private static isValid(password: string): boolean{
        return password.length >= 8;
    }
}