import validator from 'validator';
import isEmpty from 'is-empty';

import { User, UserProps } from '@model';
import { ValidatorProps, RegisterProps } from '@types';
import { excludeUsername } from '@utils';
import { errorMessage, dataMessage } from '@messages';

/* -------------------------------------------------------------------------- */

export const validateRegister = async ({
  firstName = '',
  lastName = '',
  username = '',
  email = '',
  password = '',
  confirmPassword = '',
}: RegisterProps): Promise<ValidatorProps<Partial<RegisterProps>>> => {
  const errors: Partial<RegisterProps> = {};

  let existingUsername: UserProps | null = null;
  let existingEmail: UserProps | null = null;

  /**
   * Find existing username & email
   */

  if (!validator.isEmpty(username)) {
    try {
      existingUsername = await User.findOne({ username });
    } catch {
      throw new Error(errorMessage.findingUsername);
    }
  }

  if (!validator.isEmpty(email) && validator.isEmail(email)) {
    try {
      existingEmail = await User.findOne({ email });
    } catch {
      throw new Error(errorMessage.findingEmail);
    }
  }

  /**
   * First name validation
   */

  validator.isEmpty(firstName)
    ? (errors.firstName = dataMessage.firstName.required)
    : !validator.isLength(firstName, { max: 30 })
    ? (errors.firstName = dataMessage.firstName.maxlength)
    : null;

  /**
   * Last name validation
   */

  lastName && !validator.isLength(lastName, { max: 30 }) ? (errors.lastName = dataMessage.lastName.maxlength) : null;

  /**
   * Username validation
   */

  validator.isEmpty(username)
    ? (errors.username = dataMessage.username.required)
    : !validator.isLength(username, { max: 30 })
    ? (errors.username = dataMessage.username.maxlength)
    : existingUsername || excludeUsername.includes(username)
    ? (errors.username = dataMessage.username.notAvailable)
    : null;

  /**
   * Email validation
   */

  validator.isEmpty(email)
    ? (errors.email = dataMessage.email.required)
    : !validator.isEmail(email)
    ? (errors.email = dataMessage.email.invalid)
    : existingEmail
    ? (errors.email = dataMessage.email.notAvailable)
    : null;

  /**
   * Password validation
   */

  validator.isEmpty(password)
    ? (errors.password = dataMessage.password.required)
    : !validator.isLength(password, { min: 6 })
    ? (errors.password = dataMessage.password.minlength)
    : null;

  /**
   * Confirm password validation
   */

  validator.isEmpty(confirmPassword)
    ? (errors.confirmPassword = dataMessage.confirmPassword.required)
    : !validator.isLength(password, { min: 6 })
    ? (errors.confirmPassword = dataMessage.confirmPassword.minlength)
    : !validator.equals(password, confirmPassword)
    ? (errors.confirmPassword = dataMessage.confirmPassword.notMatch)
    : null;

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
