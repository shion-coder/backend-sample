import { Schema, Document, Model, HookNextFunction, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { PostProps, NotificationProps } from '@model';
import { JWT_SECRET, JWT_EXPIRE } from '@config';
import { errorMessage } from '@messages';

/* -------------------------------------------------------------------------- */

/**
 * Types
 */

type UserSchemaProps = {
  googleId?: string;
  facebookId?: string;
  firstName: string;
  lastName?: string;
  fullName?: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  website?: string;
  posts?: PostProps['id'][];
  postCount?: number;
  saved?: PostProps['id'][];
  followers?: UserProps['id'][];
  followerCount?: number;
  following?: UserProps['id'][];
  followingCount?: number;
  notifications?: NotificationProps['id'][];
  isAdmin?: boolean;
  confirmed?: boolean;
  date?: string;
};

export type UserProps = UserSchemaProps &
  Document & {
    comparePassword: (password: string) => Promise<boolean>;
    generateAuthToken: () => string;
  };

export type TokenPayloadProps = {
  id: UserProps['id'];
};

/**
 * User schema
 */

const userSchema: Schema = new Schema({
  googleId: String,
  facebookId: String,
  firstName: {
    type: String,
    required: true,
    maxlength: 30,
  },
  lastName: {
    type: String,
    maxlength: 30,
    default: '',
  },
  fullName: {
    type: String,
  },
  username: {
    type: String,
    lowercase: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
  },
  website: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default:
      'https://res.cloudinary.com/shion-coder/image/upload/v1597954454/avatar/187-050b834aa2ef8e6508f03a2e7c6e70a994d77eebde95022f161d3728608ab6fa_ncsfg4.png',
  },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  postCount: {
    type: Number,
    default: 0,
  },
  saved: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  followerCount: {
    type: Number,
    default: 0,
  },
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  followingCount: {
    type: Number,
    default: 0,
  },
  notifications: [{ type: Schema.Types.ObjectId, ref: 'Notification' }],
  isAdmin: {
    type: Boolean,
    default: false,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Set full name, default username as id when no username exist, hash password before save user
 */

userSchema.pre('save', async function (this: UserProps, next: HookNextFunction): Promise<void> {
  if (!this.lastName) {
    this.fullName = this.firstName;
  } else {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }

  if (!this.username) {
    this.username = this._id;
  }

  if (this.password && this.isModified('password')) {
    try {
      const salt = await genSalt(10);

      this.password = await hash(this.password, salt);
    } catch {
      throw new Error(errorMessage.hashingPass);
    }
  }

  next();
});

/**
 * Compare password
 */

userSchema.methods.comparePassword = async function (this: UserProps, password: string): Promise<boolean> {
  try {
    if (!this.password) {
      return false;
    }

    const isMatch: boolean = await compare(password, this.password);

    return isMatch;
  } catch {
    throw new Error(errorMessage.comparingPass);
  }
};

/**
 * Get token
 */

userSchema.methods.generateAuthToken = function (this: UserProps): string {
  const payload: TokenPayloadProps = {
    id: this.id,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

export const User: Model<UserProps> = model<UserProps>('User', userSchema);
