export class Email {
    private readonly value: string;
    
    constructor (email: string) {
        if(!Email.isValid(email)) {
            throw new Error('Invalid email address');
        }
        this.value = email.toLowerCase();
    }
    getValue(): string{
        return this.value;
    }
    private static isValid(email: string): boolean{
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}