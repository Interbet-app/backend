class AppError {
   public readonly statusCode: number;
   public readonly message: string;
   public readonly error: Error | undefined;

   constructor(status: number, message: string, error?: Error) {
      this.statusCode = status;
      this.message = message;
      this.error = error;
   }
}
export default AppError;

