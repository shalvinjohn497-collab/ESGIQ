import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema(
  {
    name:      { type: String, required: [true, 'Name is required'], trim: true, minlength: 2 },
    email:     { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password:  { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role:      { type: String, enum: ['user', 'admin'], default: 'user' },
    orgName:   { type: String, trim: true, default: '' },
    sector:    { type: String, default: 'Healthcare' },
    isActive:  { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
)

// Mongoose 8 — async pre-save hooks do NOT use next()
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

UserSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.__v
  return obj
}

export default mongoose.model('User', UserSchema)