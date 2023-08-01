export class IncorrectCredentials extends Error {
    constructor() {
        super("Incorrect credentials");
    }
}

export class AlreadyAuthenticated extends Error {
    constructor() {
        super("Already authenticated");
    }
}

export class UserNotFound extends Error {
    constructor() {
        super("User not found");
    }
}
