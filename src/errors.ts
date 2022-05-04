export class ConflictError extends Error {  
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class InvalidDataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ServerInternalError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ResourceNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class InvalidDataReceivedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}
