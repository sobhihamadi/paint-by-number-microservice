export class RequestNotFoundException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ItemNotFoundException";
    }
    
}
export class InvalidRequestException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidRequestException";
    }   }
export class InitializationException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InitializationException";
    }
}
export class DbException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DbException";
    }}



