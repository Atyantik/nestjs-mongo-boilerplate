interface IEmailValidator {
  isValid: (email: string) => boolean | Promise<boolean>;
}

export { IEmailValidator };
