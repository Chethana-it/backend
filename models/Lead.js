const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    // Lead ID
    leadId: {
      type: String,
      required: true,
      unique: true,
    },
    
    // Company Information
    company: {
      name: {
        type: String,
        required: true,
      },
      officeSize: {
        type: Number,
        required: true,
      },
      acUnits: {
        type: Number,
        required: true,
      },
      currentACType: {
        type: String,
        enum: ['non-inverter', 'old-inverter'],
        required: true,
      },
    },
    
    // Consumption Data
    consumption: {
      monthlyBill: {
        type: Number,
        required: true,
      },
      operatingHours: {
        type: Number,
        required: true,
      },
      currentUsage: {
        type: Number,
        required: true,
      },
      projectedUsage: {
        type: Number,
        required: true,
      },
    },
    
    // Projected Savings
    projectedSavings: {
      monthly: {
        type: Number,
        required: true,
      },
      yearly: {
        type: Number,
        required: true,
      },
      fiveYear: {
        type: Number,
        required: true,
      },
      savingsPercentage: {
        type: Number,
        required: true,
      },
      co2Reduction: {
        type: Number,
        required: true,
      },
    },
    
    // Contact Information
    contact: {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    
    // Lead Scoring
    leadScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      required: true,
    },
    
    // Tracking
    source: {
      type: String,
      default: 'Energy_Savings_Calculator',
    },
    
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
      default: 'new',
    },
    
    // Email sent status
    emailSent: {
      type: Boolean,
      default: false,
    },
    
    // Notes (for sales team)
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
leadSchema.index({ 'contact.email': 1 });
leadSchema.index({ leadScore: -1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);