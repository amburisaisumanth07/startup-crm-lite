import mongoose from 'mongoose';

/**
 * Lead Schema defining the structure of a lead in the database.
 */
export const leadSchema = new mongoose.Schema(
  {
    /**
     * Full name of the lead.
     * Must be between 2 and 100 characters.
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minLength: [2, 'Name must be at least 2 characters long'],
      maxLength: [100, 'Name cannot exceed 100 characters'],
    },
    /**
     * Company name the lead belongs to.
     */
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },
    /**
     * Email address of the lead.
     * Must be in a valid email format.
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Email must be a valid email address',
      ],
    },
    /**
     * Phone number of the lead.
     */
    phone: {
      type: String,
      trim: true,
    },
    /**
     * Current status of the lead in the sales pipeline.
     */
    status: {
      type: String,
      enum: {
        values: [
          'New',
          'Contacted',
          'Meeting Scheduled',
          'Proposal Sent',
          'Won',
          'Lost',
        ],
        message: '{VALUE} is not a valid status',
      },
      default: 'New',
    },
    /**
     * Source from which the lead was acquired.
     */
    source: {
      type: String,
      enum: {
        values: [
          'Website',
          'Referral',
          'LinkedIn',
          'Cold Call',
          'Email Campaign',
          'Other',
        ],
        message: '{VALUE} is not a valid source',
      },
      default: 'Website',
    },
    /**
     * Additional notes or comments about the lead.
     */
    notes: {
      type: String,
      maxLength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    /**
     * Estimated value of the deal.
     */
    value: {
      type: Number,
      default: 0,
      min: [0, 'Value cannot be negative'],
    },
    /**
     * Reference to the User who owns/created this lead.
     */
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for lead age in days
leadSchema.virtual('age').get(function () {
  if (!this.createdAt) return 0;
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Indexes for optimized querying
leadSchema.index({ owner: 1, status: 1 });
leadSchema.index({ owner: 1, source: 1 });
leadSchema.index({ owner: 1, createdAt: -1 });
leadSchema.index({ owner: 1, value: -1 });
leadSchema.index({ owner: 1, name: 1 });
leadSchema.index({ owner: 1, company: 1 });
leadSchema.index({ email: 1 });

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
