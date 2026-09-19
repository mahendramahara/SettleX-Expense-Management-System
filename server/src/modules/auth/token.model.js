import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['VERIFICATION_OTP', 'PASSWORD_RESET_OTP', 'REFRESH_TOKEN'],
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'tokens',
  }
);

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenSchema.index({ userId: 1, type: 1 });

export const TokenModelEntity = mongoose.models.Token || mongoose.model('Token', tokenSchema);

export class TokenModel {
  async createOtp({ userId, type, code, expiresInMinutes = 10 }) {
    await TokenModelEntity.deleteMany({ userId, type });

    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    return TokenModelEntity.create({
      userId,
      type,
      code: code.trim(),
      expiresAt,
    });
  }

  async verifyOtp({ userId, type, code }) {
    const record = await TokenModelEntity.findOne({
      userId,
      type,
      code: code.trim(),
    });

    if (!record) {
      throw new Error('Invalid code');
    }

    if (new Date() > new Date(record.expiresAt)) {
      throw new Error('Code has expired');
    }

    return record;
  }

  async verifyAndConsumeOtp({ userId, type, code }) {
    await this.verifyOtp({ userId, type, code });
    await TokenModelEntity.deleteMany({ userId, type });
    return true;
  }

  async deleteUserTokens(userId, type) {
    const query = { userId };
    if (type) {
      query.type = type;
    }
    await TokenModelEntity.deleteMany(query);
  }
}
