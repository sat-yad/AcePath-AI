import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/client';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET. Google Auth will fail.');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'missing-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'missing-client-secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
        if (!email) {
          return done(new Error('No email found from Google profile'), false);
        }

        // 1. Check if user exists by email
        const existingUserResult = await query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUserResult.rows.length > 0) {
          // User exists, return the user
          const user = existingUserResult.rows[0];
          
          // Optionally associate the google_id if not already set (if column exists)
          // We won't alter schema just for this, email matching is usually enough for simple SSO.
          
          return done(null, user);
        }

        // 2. User does not exist, create new user
        const fullName = profile.displayName || email.split('@')[0];
        const avatarUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

        // Create new user. Using a dummy password hash since they signed up with Google.
        const result = await query(
          'INSERT INTO users (email, password_hash, full_name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
          [email, 'GOOGLE_SSO_USER', fullName, avatarUrl]
        );

        const newUser = result.rows[0];
        return done(null, newUser);
      } catch (err) {
        console.error('Google Strategy Error:', err);
        return done(err as Error, false);
      }
    }
  )
);

// We need these generic serialization methods or Passport throws errors sometimes
// even though we use JWTs and non-session based auth.
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      done(null, result.rows[0]);
    } else {
      done(null, false);
    }
  } catch (err) {
    done(err, false);
  }
});

export default passport;
