export class ServerDownException extends Error {
  constructor(message = ``, public code = 1000) {
    super(message);
  }

  public what() {
    return this.message;
  }
}
