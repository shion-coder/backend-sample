import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';

import { User, TokenPayloadProps } from '@model';
import { JWT_SECRET, FACEBOOK_CONFIG, GOOGLE_CONFIG } from '@config';

/* -------------------------------------------------------------------------- */

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

export const passportInit = (): void => {
  passport.serializeUser((user, cb) => {
    cb(null, user);
  });

  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });

  /**
   * Token
   */

  passport.use(
    new JwtStrategy(options, async (payload: TokenPayloadProps, done) => {
      try {
        const user = await User.findById(payload.id);

        if (user) {
          return done(null, user);
        }

        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }),
  );

  /**
   * Google Strategy
   */

  passport.use(
    new GoogleStrategy(GOOGLE_CONFIG, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(undefined, user);
        }

        return done(undefined, profile);
      } catch (error) {
        return done(error, false);
      }
    }),
  );

  /**
   * Facebook Strategy
   */

  passport.use(
    new FacebookStrategy(FACEBOOK_CONFIG, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ facebookId: profile.id });

        if (user) {
          return done(null, user);
        }

        return done(null, profile);
      } catch (error) {
        return done(error, false);
      }
    }),
  );
};
